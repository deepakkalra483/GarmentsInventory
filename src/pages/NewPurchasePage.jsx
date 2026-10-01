import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Select, Button, Alert } from '../components/ui';
import { VENDORS, PURCHASE_STATUSES, calcPurchaseTotal } from '../data/staticData';
import styles from './pages.module.css';

const PUR_ITEMS_DEFAULT = [{ name: "Men's T-Shirt", qty: 50, rate: 150 }];

export default function NewPurchasePage() {
  const { addPurchase } = useApp();
  const navigate = useNavigate();

  const [vendor, setVendor]   = useState('');
  const [invNo, setInvNo]     = useState('');
  const [date, setDate]       = useState('29 Sep 2026');
  const [delivery, setDelivery] = useState('');
  const [items, setItems]     = useState([...PUR_ITEMS_DEFAULT]);
  const [gst, setGst]         = useState(5);
  const [freight, setFreight] = useState(0);
  const [payStatus, setPayStatus] = useState('Paid full');
  const [paidAmt, setPaidAmt] = useState('');
  const [errors, setErrors]   = useState({});
  const [done, setDone]       = useState(null);

  const sub   = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const total = calcPurchaseTotal(items, gst, freight);

  const addItem = () => setItems(prev => [...prev, { name: "Men's T-Shirt", qty: 10, rate: 150 }]);
  const changeItem = (idx, patch) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const errs = {};
    if (!vendor) errs.vendor = 'Select a vendor';
    if (!invNo)  errs.invNo  = 'Enter invoice number';
    if (items.length === 0) errs.items = 'Add at least one item';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const id = addPurchase({ vendor, invoiceNo: invNo, date, delivery, items, gst: Number(gst), freight: Number(freight), payStatus, paidAmt: Number(paidAmt) || (payStatus === 'Paid full' ? total : 0) });
    setDone({ id, vendor, invNo, total, payStatus });
  };

  if (done) return (
    <div>
      <div className={styles.receiptCard}>
        <div className={`${styles.receiptHead} ${styles.receiptSuccess}`}>
          <i className="ti ti-circle-check" style={{ fontSize: 40 }} />
          <div className={styles.receiptTitle}>Purchase saved!</div>
          <div className={styles.receiptSub}>Invoice #{done.invNo} · 29 Sep 2026</div>
        </div>
        <div style={{ padding: 16 }}>
          {[['Vendor', done.vendor], ['Invoice', done.invNo], ['Status', done.payStatus]].map(([l, v]) => (
            <div key={l} className={styles.rRow}><span className={styles.rLabel}>{l}</span><span className={styles.rVal}>{v}</span></div>
          ))}
          <div className={styles.rItems}>
            {items.map((it, i) => <div key={i} className={styles.rItem}><span>{it.name} ×{it.qty}</span><span>₹{(it.qty * it.rate).toLocaleString('en-IN')}</span></div>)}
          </div>
          <div className={styles.rTotal}><span>Grand total</span><span style={{ color: 'var(--warning)' }}>₹{total.toLocaleString('en-IN')}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/purchase')}><i className="ti ti-arrow-left" /> Purchase</Button>
          <Button variant="primary" size="md" fullWidth onClick={() => { setDone(null); setVendor(''); setInvNo(''); setItems([...PUR_ITEMS_DEFAULT]); }}><i className="ti ti-plus" /> New</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Section title="Vendor details">
        <Field label="Vendor *" error={errors.vendor}>
          <Select value={vendor} onChange={e => { setVendor(e.target.value); setErrors(p => ({...p, vendor:''})); }}>
            <option value="">Select vendor</option>
            {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            <option value="__new__">+ Add new vendor</option>
          </Select>
        </Field>
        <div className={styles.frow}>
          <Field label="Invoice no. *" error={errors.invNo}><Input placeholder="ST-2092" value={invNo} onChange={e => { setInvNo(e.target.value); setErrors(p => ({...p, invNo:''})); }} /></Field>
          <Field label="Date"><Input value={date} onChange={e => setDate(e.target.value)} /></Field>
        </div>
        <Field label="Expected delivery"><Input placeholder="02 Oct 2026" value={delivery} onChange={e => setDelivery(e.target.value)} /></Field>
      </Section>

      <Section title="Items purchased">
        <div className={styles.itemColHeads}><span style={{ flex: 2 }}>Item</span><span style={{ width: 44 }}>Qty</span><span style={{ width: 60, textAlign: 'right' }}>Rate ₹</span><span style={{ minWidth: 60, textAlign: 'right' }}>Amt</span><span style={{ width: 28 }}></span></div>
        {items.map((it, i) => (
          <div key={i} className={styles.itemRow}>
            <input className={styles.itemSelect} placeholder="Item name" value={it.name} onChange={e => changeItem(i, { name: e.target.value })} />
            <input className={styles.itemQty} type="number" min="1" value={it.qty} onChange={e => changeItem(i, { qty: Math.max(1, parseInt(e.target.value) || 1) })} />
            <input className={styles.itemRate} type="number" min="0" value={it.rate} onChange={e => changeItem(i, { rate: parseInt(e.target.value) || 0 })} />
            <span className={styles.itemAmt}>₹{(it.qty * it.rate).toLocaleString('en-IN')}</span>
            <button className={styles.itemDel} onClick={() => removeItem(i)} aria-label="Remove"><i className="ti ti-x" style={{ fontSize: 13 }} /></button>
          </div>
        ))}
        {errors.items && <div style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 4 }}>{errors.items}</div>}
        <button className={styles.addItemBtn} onClick={addItem}><i className="ti ti-plus" /> Add item</button>
      </Section>

      <Section title="Bill summary">
        <div className={styles.sRow}><span>Subtotal</span><span>₹{sub.toLocaleString('en-IN')}</span></div>
        <div className={styles.sRow}><span>GST %</span><input type="number" min="0" value={gst} onChange={e => setGst(e.target.value)} className={styles.inlineInput} /></div>
        <div className={styles.sRow}><span>Freight ₹</span><input type="number" min="0" value={freight} onChange={e => setFreight(e.target.value)} className={styles.inlineInput} /></div>
        <div className={`${styles.sRow} ${styles.sRowTotal}`}><span>Grand total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </Section>

      <Section title="Payment status">
        <div className={styles.payChips} style={{ marginBottom: 10 }}>
          {PURCHASE_STATUSES.map(s => <button key={s} className={`${styles.payChip} ${payStatus === s ? styles.payChipActive : ''}`} onClick={() => setPayStatus(s)}>{s}</button>)}
        </div>
        {payStatus === 'Partial' && (
          <Field label="Amount paid ₹"><Input type="number" placeholder="0" value={paidAmt} onChange={e => setPaidAmt(e.target.value)} /></Field>
        )}
        {(payStatus === 'Credit / unpaid' || payStatus === 'Partial') && (
          <Alert variant="warning" icon="ti-alert-circle">Due to vendor: ₹{(total - (Number(paidAmt) || 0)).toLocaleString('en-IN')}</Alert>
        )}
      </Section>

      <Button variant="primary" size="lg" fullWidth onClick={handleSave}><i className="ti ti-truck" /> Save purchase</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
