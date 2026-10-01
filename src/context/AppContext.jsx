import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection, doc, getDocs, addDoc, updateDoc, setDoc,
  runTransaction, serverTimestamp, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AppContext = createContext(null);

// ── helpers ────────────────────────────────────────────────────────────────────

// Convert Firestore Timestamp → readable date string
const tsToStr = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Today as a readable date string
const todayStr = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Fuzzy match an item name to a stock document
function findStockMatch(stockList, itemName) {
  const needle = (itemName || '').toLowerCase().trim();
  if (!needle) return null;
  let hit = stockList.find(s => s.name.toLowerCase() === needle);
  if (hit) return hit;
  hit = stockList.find(s => needle.includes(s.name.toLowerCase()));
  if (hit) return hit;
  hit = stockList.find(s => s.name.toLowerCase().includes(needle));
  if (hit) return hit;
  const norm = needle.replace(/s$/, '');
  hit = stockList.find(s => s.name.toLowerCase().replace(/s$/, '').includes(norm));
  return hit || null;
}

// ──────────────────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [bills, setBills]         = useState([]);
  const [returns, setReturns]     = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stock, setStock]         = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Ref for reading current stock inside transactions without stale closure
  const stockRef = useRef([]);

  // ── Load all data from Firestore on mount ────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setDataLoading(true);
    try {
      const [billsSnap, returnsSnap, purchasesSnap, stockSnap] = await Promise.all([
        getDocs(query(collection(db, 'sales'),     orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'returns'),   orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'purchases'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'stock')),
      ]);

      const mapDoc = (d) => ({ ...d.data(), id: d.id });

      const newStock = stockSnap.docs.map(mapDoc);
      setBills(billsSnap.docs.map(mapDoc));
      setReturns(returnsSnap.docs.map(mapDoc));
      setPurchases(purchasesSnap.docs.map(mapDoc));
      setStock(newStock);
      stockRef.current = newStock;
    } catch (e) {
      console.error('Firestore loadAll error:', e);
    } finally {
      setDataLoading(false);
    }
  };

  // ── Internal: update stock qty via Firestore transaction ─────────────────
  // items: [{ name, qty, stockId? }]
  // delta: +1 (purchase/return) or -1 (sale)
  const adjustStockTransaction = async (items, delta) => {
    const currentStock = stockRef.current;
    for (const it of items) {
      const match = it.stockId
        ? currentStock.find(s => s.id === it.stockId)
        : findStockMatch(currentStock, it.name);
      if (!match) continue;
      const stockDocRef = doc(db, 'stock', match.id);
      await runTransaction(db, async (txn) => {
        const snap = await txn.get(stockDocRef);
        if (!snap.exists()) return;
        const newQty = Math.max(0, (snap.data().qty || 0) + delta * (it.qty || 1));
        txn.update(stockDocRef, { qty: newQty });
      });
      // Update local state
      setStock(prev => {
        const updated = prev.map(s =>
          s.id === match.id
            ? { ...s, qty: Math.max(0, s.qty + delta * (it.qty || 1)) }
            : s
        );
        stockRef.current = updated;
        return updated;
      });
    }
  };

  // ── Bills (Sales) ────────────────────────────────────────────────────────
  const addBill = async (bill) => {
    const now   = serverTimestamp();
    const total = (bill.items || []).reduce((s, i) => s + i.price * i.qty, 0) - (bill.discount || 0);
    const data  = { ...bill, date: todayStr(), hasReturn: false, returnedAmt: 0, _total: Math.max(0, total), createdAt: now };
    const ref   = await addDoc(collection(db, 'sales'), data);
    setBills(prev => [{ ...data, id: ref.id, createdAt: new Date() }, ...prev]);
    // ✅ Decrease stock
    await adjustStockTransaction(bill.items || [], -1);
    return ref.id;
  };

  const updateBill = async (id, patch) => {
    await updateDoc(doc(db, 'sales', id), patch);
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  };

  const getBill = (id) => bills.find(b => b.id === id);

  // ── Returns ──────────────────────────────────────────────────────────────
  const addReturn = async (ret) => {
    const now  = serverTimestamp();
    const data = { ...ret, date: todayStr(), createdAt: now };
    const ref  = await addDoc(collection(db, 'returns'), data);
    setReturns(prev => [{ ...data, id: ref.id, createdAt: new Date() }, ...prev]);

    // Update bill: mark hasReturn=true and accumulate returnedAmt
    const parentBill = bills.find(b => b.id === ret.billId);
    const newReturnedAmt = (parentBill?.returnedAmt || 0) + (ret.refundAmt || 0);
    await updateBill(ret.billId, { hasReturn: true, returnedAmt: newReturnedAmt });

    // ✅ Restore stock
    await adjustStockTransaction(ret.items || [], +1);
    return ref.id;
  };

  // ── Purchases ────────────────────────────────────────────────────────────
  const addPurchase = async (purchase) => {
    const now  = serverTimestamp();
    const data = { ...purchase, date: todayStr(), createdAt: now };
    const ref  = await addDoc(collection(db, 'purchases'), data);
    setPurchases(prev => [{ ...data, id: ref.id, createdAt: new Date() }, ...prev]);

    // ✅ For each item: create new stock doc OR update qty+price on existing
    for (const it of (purchase.items || [])) {
      if (it.isNew || !it.stockId) {
        // Create a new stock document
        const stockData = {
          name:      it.name,
          category:  it.category  || 'Other',
          gender:    it.gender    || 'Unisex',
          fabric:    it.fabric    || '',
          sku:       it.sku       || `${(it.category || 'X').slice(0,1)}${String(Date.now()).slice(-3)}`,
          sizes:     it.sizes     || 'Free size',
          qty:       Number(it.qty),
          lowAlert:  Number(it.lowAlert) || 10,
          buyPrice:  Number(it.rate)     || 0,
          sellPrice: Number(it.sellPrice)|| 0,
          vendor:    purchase.vendor || '',
          createdAt: now,
        };
        const sRef = await addDoc(collection(db, 'stock'), stockData);
        const newItem = { ...stockData, id: sRef.id };
        setStock(prev => {
          const updated = [newItem, ...prev];
          stockRef.current = updated;
          return updated;
        });
      } else {
        // Add to existing stock qty and optionally update prices
        const stockDocRef = doc(db, 'stock', it.stockId);
        await runTransaction(db, async (txn) => {
          const snap = await txn.get(stockDocRef);
          if (!snap.exists()) return;
          const patch = { qty: (snap.data().qty || 0) + Number(it.qty) };
          if (it.rate)      patch.buyPrice  = Number(it.rate);
          if (it.sellPrice) patch.sellPrice = Number(it.sellPrice);
          txn.update(stockDocRef, patch);
        });
        setStock(prev => {
          const updated = prev.map(s =>
            s.id === it.stockId
              ? { ...s, qty: s.qty + Number(it.qty), buyPrice: Number(it.rate) || s.buyPrice, sellPrice: Number(it.sellPrice) || s.sellPrice }
              : s
          );
          stockRef.current = updated;
          return updated;
        });
      }
    }
    return ref.id;
  };

  const updatePurchase = async (id, patch) => {
    await updateDoc(doc(db, 'purchases', id), patch);
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  // ── Stock (manual management) ────────────────────────────────────────────
  const addStockItem = async (item) => {
    const data = { ...item, createdAt: serverTimestamp() };
    const ref  = await addDoc(collection(db, 'stock'), data);
    const newItem = { ...data, id: ref.id };
    setStock(prev => {
      const updated = [newItem, ...prev];
      stockRef.current = updated;
      return updated;
    });
    return ref.id;
  };

  const updateStockItem = async (id, patch) => {
    await updateDoc(doc(db, 'stock', id), patch);
    setStock(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...patch } : s);
      stockRef.current = updated;
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{
      bills, addBill, updateBill, getBill,
      returns, addReturn,
      purchases, addPurchase, updatePurchase,
      stock, addStockItem, updateStockItem,
      dataLoading, loadAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);


