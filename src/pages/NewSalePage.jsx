import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, USERS } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Select, Button, Pill, Alert } from '../components/ui';
import { CATALOGUE, PAYMENT_MODES, calcBillTotal } from '../data/staticData';
import styles from './pages.module.css';

function ItemRow({ item, index, onChange, onRemove }) {
  const sub = item.price * item.qty;
  return (
    <div className={styles.itemRow}>
      <select
        className={styles.itemSelect}
        value={item.name}
        onChange={e => {
          const cat = CATALOGUE.find(c => c.name === e.target.value);
          onChange(index, { name: e.target.value, price: cat?.sellPrice || 0 });
        }}
      >
        {CATALOGUE.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <input
        className={styles.itemQty}
        type="number" min="1" value={item.qty}
        onChange={e => onChange(index, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
      />
      <span className={styles.itemAmt}>₹{sub.toLocaleString('en-IN')}</span>
      <button className={styles.itemDel} onClick={() => onRemove(index)} aria-label="Remove">
        <i className="ti ti-x" style={{ fontSize: 13 }} />
      </button>
    </div>
  );
}

export default function NewSalePage() {
  const { currentUser, isAdmin } = useAuth();
  const { addBill } = useApp();
  const navigate = useNavigate();

  const [cust, setCust]     = useState('');
  const [phone, setPhone]   = useState('');
  const [sp, setSp]         = useState(isAdmin() ? '' : currentUser.id);
  const [items, setItems]   = useState([{ name: CATALOGUE[0].name, qty: 1, price: CATALOGUE[0].sellPrice }]);
  const [pay, setPay]       = useState('Cash');
  const [discount, setDisc] = useState(0);
  const [errors, setErrors] = useState({});
  const [saved, setSaved]   = useState(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = calcBillTotal(items, discount);

  const addItem = () => setItems(prev => [...prev, { name: CATALOGUE[0].name, qty: 1, price: CATALOGUE[0].sellPrice }]);
  const changeItem = (idx, patch) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const errs = {};
    if (!sp) errs.sp = 'Select a salesperson';
    if (items.length === 0) errs.items = 'Add at least one item';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const spUser = USERS[sp];
    const id = addBill({
      name: cust || 'Walk-in customer',
      sp: spUser.name, spId: sp,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      pay, items, discount: Number(discount),
    });
    setSaved({ id, name: cust || 'Walk-in customer', sp: spUser.name, pay, items, discount: Number(discount), total });
  };

  if (saved) return (
    <div>
      <div className={styles.receiptCard}>
        <div className={`${styles.receiptHead} ${styles.receiptSuccess}`}>
          <i className="ti ti-circle-check" style={{ fontSize: 40 }} />
          <div className={styles.receiptTitle}>Sale saved!</div>
          <div className={styles.receiptSub}>Bill #{saved.id} · 29 Sep 2026</div>
        </div>
        <div style={{ padding: 16 }}>
          {[['Customer', saved.name], ['Salesperson', saved.sp], ['Payment', saved.pay]].map(([l, v]) => (
            <div key={l} className={styles.rRow}><span className={styles.rLabel}>{l}</span><span className={styles.rVal}>{v}</span></div>
          ))}
          <div className={styles.rItems}>
            {saved.items.map((it, i) => (
              <div key={i} className={styles.rItem}><span>{it.name} ×{it.qty}</span><span>₹{(it.price * it.qty).toLocaleString('en-IN')}</span></div>
            ))}
            {saved.discount > 0 && <div className={styles.rItem}><span>Discount</span><span style={{ color: 'var(--success)' }}>−₹{saved.discount.toLocaleString('en-IN')}</span></div>}
          </div>
          <div className={styles.rTotal}><span>Total</span><span style={{ color: 'var(--accent)' }}>₹{saved.total.toLocaleString('en-IN')}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/sales')}><i className="ti ti-arrow-left" /> Sales</Button>
          <Button variant="primary" size="md" fullWidth onClick={() => { setSaved(null); setItems([{ name: CATALOGUE[0].name, qty: 1, price: CATALOGUE[0].sellPrice }]); setCust(''); setDisc(0); }}><i className="ti ti-plus" /> New sale</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Section title="Customer">
        <Field label="Customer name"><Input placeholder="Walk-in customer" value={cust} onChange={e => setCust(e.target.value)} /></Field>
        <div className={styles.frow}>
          <Field label="Phone (optional)"><Input type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
          <Field label="Salesperson *" error={errors.sp}>
            <Select value={sp} onChange={e => { setSp(e.target.value); setErrors(p => ({ ...p, sp: '' })); }}>
              <option value="">Select</option>
              {Object.values(USERS).filter(u => u.id !== 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Items sold">
        <div className={styles.itemColHeads}><span style={{ flex: 2 }}>Item</span><span style={{ width: 44 }}>Qty</span><span style={{ minWidth: 60, textAlign: 'right' }}>Amount</span><span style={{ width: 28 }}></span></div>
        {items.map((it, i) => <ItemRow key={i} item={it} index={i} onChange={changeItem} onRemove={removeItem} />)}
        {errors.items && <div style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 4 }}>{errors.items}</div>}
        <button className={styles.addItemBtn} onClick={addItem}><i className="ti ti-plus" /> Add item</button>
      </Section>

      <Section title="Bill summary">
        <div className={styles.sRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
        <div className={styles.sRow}>
          <span>Discount ₹</span>
          <input type="number" min="0" value={discount} onChange={e => setDisc(Number(e.target.value))} className={styles.inlineInput} />
        </div>
        <div className={`${styles.sRow} ${styles.sRowTotal}`}><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </Section>

      <Section title="Payment mode">
        <div className={styles.payChips}>
          {PAYMENT_MODES.map(m => (
            <button key={m} className={`${styles.payChip} ${pay === m ? styles.payChipActive : ''}`} onClick={() => setPay(m)}>{m}</button>
          ))}
        </div>
      </Section>

      <Button variant="primary" size="lg" fullWidth onClick={handleSave}><i className="ti ti-receipt" /> Save sale</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
