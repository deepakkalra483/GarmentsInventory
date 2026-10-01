import React, { createContext, useContext, useState } from 'react';
import { INITIAL_BILLS, INITIAL_RETURNS, INITIAL_PURCHASES, INITIAL_STOCK } from '../data/staticData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [bills, setBills]       = useState(INITIAL_BILLS);
  const [returns, setReturns]   = useState(INITIAL_RETURNS);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [stock, setStock]       = useState(INITIAL_STOCK);

  // Bills
  const addBill = (bill) => {
    const id = String(Date.now());
    setBills(prev => [{ ...bill, id, date: '29 Sep 2026', hasReturn: false }, ...prev]);
    return id;
  };
  const updateBill = (id, data) => setBills(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  const getBill = (id) => bills.find(b => b.id === id);

  // Returns
  const addReturn = (ret) => {
    const id = 'R' + String(Date.now()).slice(-4);
    setReturns(prev => [{ ...ret, id, date: '29 Sep 2026' }, ...prev]);
    updateBill(ret.billId, { hasReturn: true });
    return id;
  };

  // Purchases
  const addPurchase = (purchase) => {
    const id = String(Date.now());
    setPurchases(prev => [{ ...purchase, id, date: '29 Sep 2026' }, ...prev]);
    return id;
  };
  const updatePurchase = (id, data) => setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

  // Stock
  const addStockItem = (item) => {
    const id = String(Date.now());
    setStock(prev => [{ ...item, id }, ...prev]);
    return id;
  };
  const updateStockItem = (id, data) => setStock(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

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
