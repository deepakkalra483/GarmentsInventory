import React, { createContext, useContext, useState, useRef } from 'react';
import { INITIAL_BILLS, INITIAL_RETURNS, INITIAL_PURCHASES, INITIAL_STOCK } from '../data/staticData';

const AppContext = createContext(null);

// ── fuzzy name matcher ────────────────────────────────────────────────────────
// Links an item name from a sale/purchase/return to a stock record.
// e.g. "Men's T-Shirt (M)" → stock "Men's T-Shirt"
//      "Cotton Sarees"      → stock "Cotton Saree"
function findStockMatch(stockList, itemName) {
  const needle = (itemName || '').toLowerCase().trim();
  if (!needle) return null;
  // 1. Exact match
  let hit = stockList.find(s => s.name.toLowerCase() === needle);
  if (hit) return hit;
  // 2. Stock name is a substring of the item name (size suffix case)
  hit = stockList.find(s => needle.includes(s.name.toLowerCase()));
  if (hit) return hit;
  // 3. Item name is a substring of the stock name
  hit = stockList.find(s => s.name.toLowerCase().includes(needle));
  if (hit) return hit;
  // 4. Plural / normalised fallback
  const norm = needle.replace(/s$/, '');
  hit = stockList.find(s => s.name.toLowerCase().replace(/s$/, '').includes(norm));
  return hit || null;
}

export function AppProvider({ children }) {
  const [bills, setBills]         = useState(INITIAL_BILLS);
  const [returns, setReturns]     = useState(INITIAL_RETURNS);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [stock, setStock]         = useState(INITIAL_STOCK);

  // Keep a ref so we can read current stock inside callbacks without stale closure
  const stockRef = useRef(stock);
  const setStockSynced = (updater) => {
    setStock(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      stockRef.current = next;
      return next;
    });
  };

  // ── internal stock adjuster ───────────────────────────────────────────────
  // delta > 0 → add to stock  (purchase / return)
  // delta < 0 → remove from stock (sale)
  const adjustStockByName = (itemName, delta, overrideStockId) => {
    setStockSynced(prev => {
      const match = overrideStockId
        ? prev.find(s => s.id === overrideStockId)
        : findStockMatch(prev, itemName);
      if (!match) return prev;
      return prev.map(s =>
        s.id === match.id
          ? { ...s, qty: Math.max(0, s.qty + delta) }
          : s
      );
    });
  };

  // ── Bills (Sales) ─────────────────────────────────────────────────────────
  const addBill = (bill) => {
    const id = String(Date.now());
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    setBills(prev => [{ ...bill, id, date: dateStr, hasReturn: false }, ...prev]);

    // ✅ Decrease stock for each sold item
    (bill.items || []).forEach(it => {
      adjustStockByName(it.name, -(it.qty || 1), it.stockId);
    });

    return id;
  };

  const updateBill = (id, data) =>
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));

  const getBill = (id) => bills.find(b => b.id === id);

  // ── Returns ───────────────────────────────────────────────────────────────
  const addReturn = (ret) => {
    const id = 'R' + String(Date.now()).slice(-4);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    setReturns(prev => [{ ...ret, id, date: dateStr }, ...prev]);
    updateBill(ret.billId, { hasReturn: true });

    // ✅ Restore stock for each returned item
    (ret.items || []).forEach(it => {
      adjustStockByName(it.name, +(it.qty || 1), it.stockId);
    });

    return id;
  };

  // ── Purchases ─────────────────────────────────────────────────────────────
  const addPurchase = (purchase) => {
    const id = 'P' + String(Date.now()).slice(-6);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    setPurchases(prev => [{ ...purchase, id, date: dateStr }, ...prev]);

    // ✅ Increase stock for each purchased item
    (purchase.items || []).forEach(it => {
      adjustStockByName(it.name, +(it.qty || 1), it.stockId);
    });

    return id;
  };

  const updatePurchase = (id, data) =>
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

  // ── Stock (manual entry) ──────────────────────────────────────────────────
  const addStockItem = (item) => {
    const id = 'S' + String(Date.now()).slice(-6);
    setStockSynced(prev => [{ ...item, id }, ...prev]);
    return id;
  };

  const updateStockItem = (id, data) =>
    setStockSynced(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

  return (
    <AppContext.Provider value={{
      bills, addBill, updateBill, getBill,
      returns, addReturn,
      purchases, addPurchase, updatePurchase,
      stock, addStockItem, updateStockItem,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
