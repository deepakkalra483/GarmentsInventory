import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Field, Select, Button, Alert } from '../components/ui';
import { PAYMENT_MODES, calcBillTotal } from '../data/staticData';
import styles from './pages.module.css';

// ── Item row — picks from live stock ─────────────────────────────────────────
function ItemRow({ item, index, onChange, onRemove, stock }) {
  const stockItem = stock.find(s => s.id === item.stockId) || null;
  const available = stockItem ? stockItem.qty : null;
  const isOver    = available !== null && item.qty > available;
  const sub       = item.price * item.qty;

  const handleStockChange = (stockId) => {
    const s = stock.find(x => x.id === stockId);
    onChange(index, {
      stockId,
      name:  s?.name      || '',
      price: s?.sellPrice || 0,
      qty:   1,
    });
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <div className={styles.itemRow}>
        {/* Stock item dropdown */}
        <select
          className={styles.itemSelect}
          value={item.stockId}
          onChange={e => handleStockChange(e.target.value)}
        >
          <option value="">— Select item —</option>
          {stock.map(s => (
            <option key={s.id} value={s.id} disabled={s.qty <= 0}>
              {s.name} {s.qty <= 0 ? '(out of stock)' : `(₹${s.sellPrice})`}
            </option>
          ))}
        </select>

        {/* Price editable */}
        <input
          className={styles.itemRate}
          type="number" min="0"
          value={item.price}
          style={{ width: 64 }}
          onChange={e => onChange(index, { price: Number(e.target.value) || 0 })}
          title="Selling price"
        />

        {/* Qty */}
        <input
          className={styles.itemQty}
          type="number" min="1"
          value={item.qty}
          style={{ borderColor: isOver ? 'var(--danger)' : '' }}
          onChange={e => onChange(index, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
        />

        <span className={styles.itemAmt}>₹{sub.toLocaleString('en-IN')}</span>
        <button className={styles.itemDel} onClick={() => onRemove(index)} aria-label="Remove">
          <i className="ti ti-x" style={{ fontSize: 13 }} />
        </button>
      </div>
      {available !== null && (
        <div style={{ fontSize: 10, color: isOver ? 'var(--danger-text)' : 'var(--text3)', marginTop: 2, paddingLeft: 2 }}>
          {isOver
            ? <><i className="ti ti-alert-circle" style={{ fontSize: 11 }} /> Only {available} in stock — reduce qty!</>
            : <>In stock: <strong style={{ color: 'var(--success)' }}>{available} pcs</strong>{stockItem?.sizes ? ` · ${stockItem.sizes}` : ''}</>
          }
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function NewSalePage() {
  const { currentUser, users, isAdmin } = useAuth();
  const { addBill, stock } = useApp();
  const navigate = useNavigate();

  const firstStock = stock.find(s => s.qty > 0) || stock[0];

  const [cust, setCust]   = useState('');
  const [phone, setPhone] = useState('');
  const [sp, setSp]       = useState(isAdmin() ? '' : currentUser.uid);
  const [items, setItems] = useState([
    firstStock
      ? { stockId: firstStock.id, name: firstStock.name, qty: 1, price: firstStock.sellPrice }
      : { stockId: '', name: '', qty: 1, price: 0 },
  ]);
  const [pay, setPay]         = useState('Cash');
  const [discount, setDisc]   = useState(0);
  const [errors, setErrors]   = useState({});
  const [saved, setSaved]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = calcBillTotal(items, discount);

  const addItem = () => setItems(prev => [
    ...prev,
    firstStock
      ? { stockId: firstStock.id, name: firstStock.name, qty: 1, price: firstStock.sellPrice }
      : { stockId: '', name: '', qty: 1, price: 0 },
  ]);
  const changeItem = (idx, patch) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const removeItem = (idx)        => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const errs = {};
    if (!sp)                                          errs.sp    = 'Select a salesperson';
    if (items.length === 0)                           errs.items = 'Add at least one item';
    if (items.some(it => !it.stockId))                errs.items = 'Select a stock item for each row';
    if (items.some(it => {
      const s = stock.find(x => x.id === it.stockId);
      return s && it.qty > s.qty;
    }))                                               errs.items = 'One or more items exceed available stock';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    const spUser = users.find(u => u.uid === sp) || currentUser;
    const id = await addBill({
      name:  cust || 'Walk-in customer',
      phone,
      sp:    spUser.name, spId: sp,
      time:  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      pay,
      items: items.map(it => ({ stockId: it.stockId, name: it.name, qty: it.qty, price: it.price })),
      discount:    Number(discount),
      returnedAmt: 0,   // will be updated when returns happen
    });
    setSaving(false);
    setSaved({ id, name: cust || 'Walk-in customer', sp: spUser.name, pay, items, discount: Number(discount), total });
  };

  // ── Success receipt ─────────────────────────────────────────────────────────
  if (saved) return (
    <div>
      <div className={styles.receiptCard}>
        <div className={`${styles.receiptHead} ${styles.receiptSuccess}`}>
          <i className="ti ti-circle-check" style={{ fontSize: 40 }} />
          <div className={styles.receiptTitle}>Sale saved!</div>
          <div className={styles.receiptSub}>
            Bill #{saved.id} · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
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
        <div style={{ padding: '0 16px 8px' }}>
          <Alert variant="info" icon="ti-package">
            Stock updated for {saved.items.length} item{saved.items.length > 1 ? 's' : ''}.
          </Alert>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/sales')}><i className="ti ti-arrow-left" /> Sales</Button>
          <Button variant="primary" size="md" fullWidth onClick={() => {
            setSaved(null);
            setItems(firstStock ? [{ stockId: firstStock.id, name: firstStock.name, qty: 1, price: firstStock.sellPrice }] : [{ stockId: '', name: '', qty: 1, price: 0 }]);
            setCust(''); setDisc(0);
          }}><i className="ti ti-plus" /> New sale</Button>
        </div>
      </div>
    </div>
  );

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div>
      <Section title="Customer">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 4 }}>Customer name</label>
            <input className={styles.fullInput} placeholder="Walk-in customer" value={cust} onChange={e => setCust(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 4 }}>Phone</label>
            <input className={styles.fullInput} type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        {(isAdmin() || users.length > 1) && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 4 }}>
              Salesperson * {errors.sp && <span style={{ color: 'var(--danger)', fontWeight: 400 }}>— {errors.sp}</span>}
            </label>
            <Select value={sp} onChange={e => { setSp(e.target.value); setErrors(p => ({ ...p, sp: '' })); }}>
              <option value="">Select</option>
              {[...users, ...(isAdmin() && !users.find(u => u.uid === currentUser.uid) ? [currentUser] : [])]
                .filter((u, i, arr) => arr.findIndex(x => x.uid === u.uid) === i)
                .map(u => <option key={u.uid} value={u.uid}>{u.name}</option>)}
            </Select>
          </div>
        )}
      </Section>

      <Section title="Items sold">
        <div className={styles.itemColHeads}>
          <span style={{ flex: 2 }}>Stock item</span>
          <span style={{ width: 64, textAlign: 'center' }}>₹ Price</span>
          <span style={{ width: 44, textAlign: 'center' }}>Qty</span>
          <span style={{ minWidth: 60, textAlign: 'right' }}>Amount</span>
          <span style={{ width: 28 }}></span>
        </div>
        {items.map((it, i) => (
          <ItemRow key={i} item={it} index={i} onChange={changeItem} onRemove={removeItem} stock={stock} />
        ))}
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

      <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
        {saving
          ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
          : <><i className="ti ti-receipt" /> Save sale</>
        }
      </Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
