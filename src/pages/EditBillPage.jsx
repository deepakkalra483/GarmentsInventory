import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Select, Button, Alert } from '../components/ui';
import { PAYMENT_MODES, calcBillTotal } from '../data/staticData';
import styles from './pages.module.css';

export default function EditBillPage() {
  const { id } = useParams();
  const { getBill, updateBill } = useApp();
  const { users } = useAuth();
  const navigate = useNavigate();
  const bill = getBill(id);

  const [name, setName]     = useState(bill?.name || '');
  const [sp, setSp]         = useState(bill?.spId || '');
  const [pay, setPay]       = useState(bill?.pay || 'Cash');
  const [items, setItems]   = useState(bill ? JSON.parse(JSON.stringify(bill.items)) : []);
  const [discount, setDisc] = useState(bill?.discount || 0);

  if (!bill) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>Bill not found.</div>;

  const total = calcBillTotal(items, discount);

  const changeQty = (idx, delta) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: Math.max(1, it.qty + delta) } : it));
  };

  const handleSave = async () => {
    const spUser = users.find(u => u.uid === sp);
    await updateBill(id, {
      name, spId: sp, sp: spUser?.name || bill.sp, pay,
      items, discount: Number(discount),
      st: pay === 'Credit' ? 'Credit' : `Paid · ${pay}`,
    });
    navigate(`/sales/${id}`);
  };

  return (
    <div>
      <Alert variant="warning" icon="ti-alert-triangle">
        Editing this bill will update the record. Changes are logged under your name.
      </Alert>

      <Section title="Customer details">
        <Field label="Customer name"><Input value={name} onChange={e => setName(e.target.value)} /></Field>
        <div className={styles.frow}>
          <Field label="Salesperson">
            <Select value={sp} onChange={e => setSp(e.target.value)}>
              {users.filter(u => u.role !== 'admin').map(u => <option key={u.uid} value={u.uid}>{u.name}</option>)}
            </Select>
          </Field>
          <Field label="Payment">
            <Select value={pay} onChange={e => setPay(e.target.value)}>
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Items">
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{it.name}</div>
            <button className={styles.qtyBtn} onClick={() => changeQty(i, -1)}>−</button>
            <span style={{ fontSize: 15, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{it.qty}</span>
            <button className={styles.qtyBtn} onClick={() => changeQty(i, 1)}>+</button>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 68, textAlign: 'right', color: 'var(--accent)' }}>₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, padding: '12px 0 0' }}>
          <span>Total</span><span style={{ color: 'var(--accent)' }}>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </Section>

      <Button variant="primary" size="lg" fullWidth onClick={handleSave}><i className="ti ti-check" /> Save changes</Button>
      <Button variant="secondary" size="md" fullWidth onClick={() => navigate(`/sales/${id}`)} style={{ marginTop: 8 }}>Discard</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
