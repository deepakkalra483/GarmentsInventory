import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Select, Button } from '../components/ui';
import { CATEGORIES, GENDERS, VENDORS } from '../data/staticData';
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

export default function NewStockPage() {
  const { addStockItem } = useApp();
  const navigate = useNavigate();

  const [name, setName]         = useState('');
  const [category, setCat]      = useState('T-Shirt');
  const [gender, setGender]     = useState('Men');
  const [fabric, setFabric]     = useState('');
  const [sku, setSku]           = useState('');
  const [selSizes, setSelSizes] = useState([]);
  const [qty, setQty]           = useState('');
  const [lowAlert, setLowAlert] = useState('10');
  const [buyPrice, setBuy]      = useState('');
  const [sellPrice, setSell]    = useState('');
  const [vendor, setVendor]     = useState('');
  const [errors, setErrors]     = useState({});
  const [done, setDone]         = useState(false);

  const sizes = SIZE_SETS[category] || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const toggleSize = (s) =>
    setSelSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    const errs = {};
    if (!name)     errs.name = 'Enter garment name';
    if (!qty)      errs.qty  = 'Enter quantity';
    if (!sellPrice) errs.sell = 'Enter selling price';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    addStockItem({
      name, category, gender, fabric,
      sku: sku || `${category.slice(0,1).toUpperCase()}${String(Date.now()).slice(-3)}`,
      sizes: selSizes.length ? selSizes.join(' / ') : 'Free size',
      qty: Number(qty), lowAlert: Number(lowAlert) || 10,
      buyPrice: Number(buyPrice) || 0, sellPrice: Number(sellPrice),
      vendor,
    });
    setDone(true);
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <i className="ti ti-circle-check" style={{ fontSize: 56, color: 'var(--success)' }} />
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>Item added!</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>{name} has been added to your inventory.</div>
      <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/stock')} style={{ marginTop: 24 }}>
        <i className="ti ti-package" /> View stock
      </Button>
      <Button variant="secondary" size="md" fullWidth onClick={() => { setDone(false); setName(''); setQty(''); setSell(''); setSelSizes([]); }} style={{ marginTop: 8 }}>
        <i className="ti ti-plus" /> Add another
      </Button>
    </div>
  );

  return (
    <div>
      <Section title="Basic info">
        <Field label="Garment name *" error={errors.name}>
          <Input placeholder="Men's polo T-shirt" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})); }} />
        </Field>
        <div className={styles.frow}>
          <Field label="Category">
            <Select value={category} onChange={e => { setCat(e.target.value); setSelSizes([]); }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Gender">
            <Select value={gender} onChange={e => setGender(e.target.value)}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Fabric / material">
          <Input placeholder="Cotton, Polyester, Rayon…" value={fabric} onChange={e => setFabric(e.target.value)} />
        </Field>
        <Field label="SKU / item code" hint="Leave blank to auto-generate">
          <Input placeholder="e.g. T001" value={sku} onChange={e => setSku(e.target.value)} />
        </Field>
      </Section>

      <Section title="Sizes available">
        <div className={styles.sizeGrid}>
          {sizes.map(s => (
            <button
              key={s}
              className={`${styles.sizeBtn} ${selSizes.includes(s) ? styles.sizeBtnActive : ''}`}
              onClick={() => toggleSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
          {selSizes.length ? selSizes.join(', ') : 'No sizes selected — will default to Free size'}
        </div>
      </Section>

      <Section title="Stock and pricing">
        <div className={styles.frow}>
          <Field label="Opening qty *" error={errors.qty}>
            <Input type="number" placeholder="0" min="0" value={qty} onChange={e => { setQty(e.target.value); setErrors(p => ({...p, qty: ''})); }} />
          </Field>
          <Field label="Low stock alert">
            <Input type="number" placeholder="10" min="0" value={lowAlert} onChange={e => setLowAlert(e.target.value)} />
          </Field>
        </div>
        <div className={styles.frow}>
          <Field label="Purchase price ₹">
            <Input type="number" placeholder="0" value={buyPrice} onChange={e => setBuy(e.target.value)} />
          </Field>
          <Field label="Selling price ₹ *" error={errors.sell}>
            <Input type="number" placeholder="0" value={sellPrice} onChange={e => { setSell(e.target.value); setErrors(p => ({...p, sell: ''})); }} />
          </Field>
        </div>
        <Field label="Vendor / supplier">
          <Select value={vendor} onChange={e => setVendor(e.target.value)}>
            <option value="">Select vendor</option>
            {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        </Field>
      </Section>

      <Button variant="primary" size="lg" fullWidth onClick={handleSave}><i className="ti ti-check" /> Save to stock</Button>
      <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/stock')} style={{ marginTop: 8 }}>Cancel</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
