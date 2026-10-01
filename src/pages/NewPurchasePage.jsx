import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Select, Button, Alert } from '../components/ui';
import { VENDORS, PURCHASE_STATUSES, calcPurchaseTotal } from '../data/staticData';
import styles from './pages.module.css';

export default function NewPurchasePage() {
  const { addPurchase, stock } = useApp();
  const navigate = useNavigate();

  const defaultItem = () => ({
    stockId: stock[0]?.id || '',
    name: stock[0]?.name || '',
    qty: 50,
    rate: stock[0]?.buyPrice || 0,
  });

  const [vendor, setVendor]       = useState('');
  const [invNo, setInvNo]         = useState('');
  const [date, setDate]           = useState(
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [delivery, setDelivery]   = useState('');
  const [items, setItems]         = useState([defaultItem()]);
  const [gst, setGst]             = useState(5);
  const [freight, setFreight]     = useState(0);
  const [payStatus, setPayStatus] = useState('Paid full');
  const [paidAmt, setPaidAmt]     = useState('');
  const [errors, setErrors]       = useState({});
  const [done, setDone]           = useState(null);

  const sub   = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const total = calcPurchaseTotal(items, gst, freight);

  const addItem = () => setItems(prev => [...prev, defaultItem()]);
  const changeItem = (idx, patch) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleStockSelect = (idx, stockId) => {
    const s = stock.find(s => s.id === stockId);
    if (s) changeItem(idx, { stockId: s.id, name: s.name, rate: s.buyPrice || 0 });
    else   changeItem(idx, { stockId: '', name: '', rate: 0 });
    setErrors(p => ({...p, items: ''}));
  };

  const handleSave = () => {
    const errs = {};
    if (!vendor) errs.vendor = 'Select a vendor';
    if (!invNo)  errs.invNo  = 'Enter invoice number';
    if (items.length === 0) errs.items = 'Add at least one item';
    if (items.some(it => !it.stockId)) errs.items = 'Select a stock item for each row';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const id = addPurchase({
      vendor, invoiceNo: invNo, date, delivery, items,
      gst: Number(gst), freight: Number(freight),
      payStatus,
      paidAmt: Number(paidAmt) || (payStatus === 'Paid full' ? total : 0),
    });
    setDone({ id, vendor, invNo, total, payStatus });
  };

  if (done) return (
    <div>
      <div className={styles.receiptCard}>
        <div className={`${styles.receiptHead} ${styles.receiptSuccess}`}>
          <i className="ti ti-circle-check" style={{ fontSize: 40 }} />
          <div className={styles.receiptTitle}>Purchase saved!</div>
          <div className={styles.receiptSub}>Invoice #{done.invNo} · {date}</div>
        </div>
        <div style={{ padding: 16 }}>
          {[['Vendor', done.vendor], ['Invoice', done.invNo], ['Status', done.payStatus]].map(([l, v]) => (
            <div key={l} className={styles.rRow}><span className={styles.rLabel}>{l}</span><span className={styles.rVal}>{v}</span></div>
          ))}
          <div className={styles.rItems}>
            {items.map((it, i) => <div key={i} className={styles.rItem}><span>{it.name} ×{it.qty}</span><span>₹{(it.qty * it.rate).toLocaleString('en-IN')}</span></div>)}
          </div>
          <div className={styles.rTotal}><span>Grand total</span><span style={{ color: 'var(--warning)' }}>₹{total.toLocaleString('en-IN')}</span></div>
          <Alert variant="success" icon="ti-package" style={{ marginTop: 12 }}>
            Stock updated automatically for {items.length} item{items.length > 1 ? 's' : ''}.
          </Alert>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/purchase')}><i className="ti ti-arrow-left" /> Purchase</Button>
          <Button variant="primary" size="md" fullWidth onClick={() => { setDone(null); setVendor(''); setInvNo(''); setItems([defaultItem()]); }}><i className="ti ti-plus" /> New</Button>
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
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-info-circle" style={{ fontSize: 13 }} />
          Stock quantities will be updated automatically when you save.
        </div>
        <div className={styles.itemColHeads}>
          <span style={{ flex: 2 }}>Stock item</span>
          <span style={{ width: 50 }}>Qty</span>
          <span style={{ width: 64, textAlign: 'right' }}>Rate ₹</span>
          <span style={{ minWidth: 60, textAlign: 'right' }}>Amt</span>
          <span style={{ width: 28 }}></span>
        </div>
        {items.map((it, i) => {
          const stockItem = stock.find(s => s.id === it.stockId);
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div className={styles.itemRow} style={{ flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                <select
                  className={styles.itemSelect}
                  value={it.stockId}
                  onChange={e => handleStockSelect(i, e.target.value)}
                  style={{ flex: 2, minWidth: 120 }}
                >
                  <option value="">— Select item —</option>
                  {stock.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}  (stock: {s.qty})
                    </option>
                  ))}
                </select>
                <input className={styles.itemQty} type="number" min="1" value={it.qty} onChange={e => changeItem(i, { qty: Math.max(1, parseInt(e.target.value) || 1) })} style={{ width: 50 }} />
                <input className={styles.itemRate} type="number" min="0" value={it.rate} onChange={e => changeItem(i, { rate: parseInt(e.target.value) || 0 })} style={{ width: 64 }} />
                <span className={styles.itemAmt}>₹{(it.qty * it.rate).toLocaleString('en-IN')}</span>
                <button className={styles.itemDel} onClick={() => removeItem(i)} aria-label="Remove"><i className="ti ti-x" style={{ fontSize: 13 }} /></button>
              </div>
              {stockItem && (
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, paddingLeft: 2 }}>
                  Current stock: <strong style={{ color: stockItem.qty <= stockItem.lowAlert ? 'var(--warning)' : 'var(--success)' }}>{stockItem.qty} pcs</strong>
                  {' · '}After purchase: <strong style={{ color: 'var(--accent)' }}>{stockItem.qty + it.qty} pcs</strong>
                </div>
              )}
            </div>
          );
        })}
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

      <Button variant="primary" size="lg" fullWidth onClick={handleSave}><i className="ti ti-truck" /> Save purchase &amp; update stock</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
