import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Select, Button, Alert } from '../components/ui';
import { CATEGORIES, GENDERS, VENDORS, PURCHASE_STATUSES, calcPurchaseTotal } from '../data/staticData';
import styles from './pages.module.css';

const SIZE_SETS = {
  'T-Shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Lower':   ['S', 'M', 'L', 'XL', 'XXL'],
  'Saree':   ['Free size'],
  'Kurta':   ['S', 'M', 'L', 'XL', 'XXL'],
  'Jacket':  ['S', 'M', 'L', 'XL', '2Y', '4Y', '6Y', '8Y'],
  'Shirt':   ['S', 'M', 'L', 'XL', 'XXL'],
  'Jeans':   ['28', '30', '32', '34', '36', '38'],
  'Dress':   ['XS', 'S', 'M', 'L', 'XL'],
};

export default function NewPurchasePage() {
  const { addPurchase, stock } = useApp();
  const navigate = useNavigate();

  // ── Vendor / invoice fields ────────────────────────────────────────────────
  const [vendor, setVendor]       = useState('');
  const [invNo, setInvNo]         = useState('');
  const [date, setDate]           = useState(
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [delivery, setDelivery]   = useState('');
  const [gst, setGst]             = useState(5);
  const [freight, setFreight]     = useState(0);
  const [payStatus, setPayStatus] = useState('Paid full');
  const [paidAmt, setPaidAmt]     = useState('');
  const [errors, setErrors]       = useState({});
  const [done, setDone]           = useState(null);
  const [saving, setSaving]       = useState(false);

  // ── Per-item (garment) fields ──────────────────────────────────────────────
  // Each item = same fields as Add Stock + qty (purchased qty)
  const newItem = () => ({
    // identity – user fills these
    name: '', category: 'T-Shirt', gender: 'Men', fabric: '', sku: '',
    selSizes: [],
    qty: '', lowAlert: '',
    buyPrice: '', sellPrice: '',
    // link to existing stock (if found)
    stockId: '',  // filled automatically when name matches existing stock
    isNew: true,  // will create a new stock doc if true
  });

  const [items, setItems] = useState([newItem()]);

  const sizes = (cat) => SIZE_SETS[cat] || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const changeItem = (idx, patch) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));

  const toggleSize = (idx, s) =>
    setItems(prev => prev.map((it, i) =>
      i === idx
        ? { ...it, selSizes: it.selSizes.includes(s) ? it.selSizes.filter(x => x !== s) : [...it.selSizes, s] }
        : it
    ));

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  // Auto-link to existing stock when user types a name
  const handleNameChange = (idx, val) => {
    const match = stock.find(s => s.name.toLowerCase() === val.toLowerCase());
    if (match) {
      changeItem(idx, {
        name: val, stockId: match.id, isNew: false,
        category: match.category || items[idx].category,
        gender: match.gender || items[idx].gender,
        fabric: match.fabric || '',
        sellPrice: String(match.sellPrice || ''),
        buyPrice: String(match.buyPrice || ''),
      });
    } else {
      changeItem(idx, { name: val, stockId: '', isNew: true });
    }
    setErrors(p => ({ ...p, items: '' }));
  };

  const sub   = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.buyPrice || 0), 0);
  const total = calcPurchaseTotal(
    items.map(it => ({ qty: Number(it.qty || 0), rate: Number(it.buyPrice || 0) })),
    gst, freight
  );

  const handleSave = async () => {
    const errs = {};
    if (!vendor) errs.vendor = 'Select a vendor';
    if (!invNo)  errs.invNo  = 'Enter invoice number';
    if (items.length === 0) errs.items = 'Add at least one item';
    if (items.some(it => !it.name.trim())) errs.items = 'Enter name for each item';
    if (items.some(it => !(Number(it.qty) > 0))) errs.items = 'Enter quantity for each item';
    if (items.some(it => !it.sellPrice))   errs.items = 'Enter selling price for each item';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    // Build purchase items payload
    const purchaseItems = items.map(it => ({
      name:      it.name.trim(),
      stockId:   it.stockId || null,
      isNew:     it.isNew,
      qty:       Number(it.qty) || 0,
      rate:      Number(it.buyPrice) || 0,   // purchase price
      sellPrice: Number(it.sellPrice) || 0,
      // stock fields (used when isNew=true or updating existing)
      category:  it.category,
      gender:    it.gender,
      fabric:    it.fabric,
      sku:       it.sku || `${it.category.slice(0,1)}${String(Date.now()).slice(-3)}`,
      sizes:     it.selSizes.length ? it.selSizes.join(' / ') : 'Free size',
      lowAlert:  Number(it.lowAlert) || 10,
    }));

    const id = await addPurchase({
      vendor, invoiceNo: invNo, date, delivery, items: purchaseItems,
      gst: Number(gst), freight: Number(freight),
      payStatus,
      paidAmt: Number(paidAmt) || (payStatus === 'Paid full' ? total : 0),
    });
    setSaving(false);
    setDone({ id, vendor, invNo, total, payStatus, items: purchaseItems });
  };

  // ── Success screen ─────────────────────────────────────────────────────────
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
            {done.items.map((it, i) => (
              <div key={i} className={styles.rItem}>
                <span>{it.name} ×{it.qty} {it.isNew ? <span style={{ color: 'var(--accent)', fontSize: 10 }}>(New stock)</span> : <span style={{ color: 'var(--success)', fontSize: 10 }}>(Added to existing)</span>}</span>
                <span>₹{(it.qty * it.rate).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className={styles.rTotal}><span>Grand total</span><span style={{ color: 'var(--warning)' }}>₹{done.total.toLocaleString('en-IN')}</span></div>
          <Alert variant="success" icon="ti-package" style={{ marginTop: 12 }}>
            Stock updated for {done.items.length} item{done.items.length > 1 ? 's' : ''} — inventory is current.
          </Alert>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/purchase')}><i className="ti ti-arrow-left" /> Purchases</Button>
          <Button variant="primary" size="md" fullWidth onClick={() => { setDone(null); setVendor(''); setInvNo(''); setItems([newItem()]); }}><i className="ti ti-plus" /> New</Button>
        </div>
      </div>
    </div>
  );

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Vendor / invoice */}
      <Section title="Vendor & invoice">
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
        <Field label="Expected delivery"><Input placeholder="e.g. 05 Oct 2026" value={delivery} onChange={e => setDelivery(e.target.value)} /></Field>
      </Section>

      {/* Items */}
      <Section title="Items purchased">
        <Alert variant="info" icon="ti-info-circle" style={{ marginBottom: 12 }}>
          Each item will be added to (or update) your stock automatically on save.
        </Alert>
        {errors.items && <div style={{ fontSize: 12, color: 'var(--danger-text)', marginBottom: 8 }}>{errors.items}</div>}

        {items.map((it, i) => {
          const existingStock = it.stockId ? stock.find(s => s.id === it.stockId) : null;
          return (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 12, background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Item {i + 1}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {existingStock
                    ? <span style={{ fontSize: 11, background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Existing · {existingStock.qty} in stock</span>
                    : it.name ? <span style={{ fontSize: 11, background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>New item</span> : null
                  }
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 18, lineHeight: 1 }}>×</button>
                  )}
                </div>
              </div>

              {/* Name */}
              <Field label="Garment name *">
                <Input
                  placeholder="e.g. Men's T-Shirt"
                  value={it.name}
                  onChange={e => handleNameChange(i, e.target.value)}
                  list={`stock-names-${i}`}
                />
                <datalist id={`stock-names-${i}`}>
                  {stock.map(s => <option key={s.id} value={s.name} />)}
                </datalist>
              </Field>

              <div className={styles.frow}>
                <Field label="Category">
                  <Select value={it.category} onChange={e => changeItem(i, { category: e.target.value, selSizes: [] })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Gender">
                  <Select value={it.gender} onChange={e => changeItem(i, { gender: e.target.value })}>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </Select>
                </Field>
              </div>

              <Field label="Fabric / material">
                <Input placeholder="Cotton, Rayon…" value={it.fabric} onChange={e => changeItem(i, { fabric: e.target.value })} />
              </Field>

              {/* Sizes */}
              <Field label="Sizes">
                <div className={styles.sizeGrid} style={{ marginTop: 4 }}>
                  {sizes(it.category).map(s => (
                    <button
                      key={s}
                      className={`${styles.sizeBtn} ${it.selSizes.includes(s) ? styles.sizeBtnActive : ''}`}
                      onClick={() => toggleSize(i, s)}
                    >{s}</button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  {it.selSizes.length ? it.selSizes.join(', ') : 'Free size'}
                </div>
              </Field>

              {/* Qty + prices */}
              <div className={styles.frow}>
                <Field label="Qty purchased *">
                  <Input
                    type="number" min="1"
                    placeholder="e.g. 50"
                    value={it.qty}
                    onChange={e => changeItem(i, { qty: e.target.value })}
                  />
                </Field>
                <Field label="Low stock alert">
                  <Input
                    type="number" min="0"
                    placeholder="e.g. 10"
                    value={it.lowAlert}
                    onChange={e => changeItem(i, { lowAlert: e.target.value })}
                  />
                </Field>
              </div>
              <div className={styles.frow}>
                <Field label="Purchase price ₹">
                  <Input type="number" placeholder="0" value={it.buyPrice} onChange={e => changeItem(i, { buyPrice: e.target.value })} />
                </Field>
                <Field label="Selling price ₹ *">
                  <Input type="number" placeholder="0" value={it.sellPrice} onChange={e => changeItem(i, { sellPrice: e.target.value })} />
                </Field>
              </div>
              <Field label="SKU / item code" hint="Leave blank to auto-generate">
                <Input placeholder="e.g. T001" value={it.sku} onChange={e => changeItem(i, { sku: e.target.value })} />
              </Field>

              {/* Preview */}
              {it.name && it.buyPrice && (
                <div style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--surface2)', borderRadius: 8, padding: '6px 10px', marginTop: 4 }}>
                  {Number(it.qty)} pcs × ₹{Number(it.buyPrice)} = <strong style={{ color: 'var(--accent)' }}>₹{(Number(it.qty) * Number(it.buyPrice)).toLocaleString('en-IN')}</strong>
                  {existingStock && <span> · After purchase: <strong style={{ color: 'var(--success)' }}>{existingStock.qty + Number(it.qty)} pcs</strong></span>}
                </div>
              )}
            </div>
          );
        })}

        <button className={styles.addItemBtn} onClick={() => setItems(prev => [...prev, newItem()])}>
          <i className="ti ti-plus" /> Add another item
        </button>
      </Section>

      {/* Bill summary */}
      <Section title="Bill summary">
        <div className={styles.sRow}><span>Subtotal</span><span>₹{sub.toLocaleString('en-IN')}</span></div>
        <div className={styles.sRow}><span>GST %</span><input type="number" min="0" value={gst} onChange={e => setGst(e.target.value)} className={styles.inlineInput} /></div>
        <div className={styles.sRow}><span>Freight ₹</span><input type="number" min="0" value={freight} onChange={e => setFreight(e.target.value)} className={styles.inlineInput} /></div>
        <div className={`${styles.sRow} ${styles.sRowTotal}`}><span>Grand total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </Section>

      {/* Payment */}
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

      <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
        {saving ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><i className="ti ti-truck" /> Save purchase &amp; update stock</>}
      </Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
