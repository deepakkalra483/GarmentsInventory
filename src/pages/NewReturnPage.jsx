import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Button, Alert } from '../components/ui';
import { RETURN_REASONS, REFUND_MODES } from '../data/staticData';
import styles from './pages.module.css';

export default function NewReturnPage() {
  const { isAdmin } = useAuth();
  const { addReturn } = useApp();
  const navigate = useNavigate();
  const [bill, setBill]   = useState('');
  const [cust, setCust]   = useState('');
  const [item, setItem]   = useState('');
  const [amt, setAmt]     = useState('');
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [mode, setMode]   = useState(REFUND_MODES[0]);
  const [errors, setErrors] = useState({});
  const [done, setDone]   = useState(null);

  const refundAmt = Number(amt) || 0;
  const needsApproval = !isAdmin() && refundAmt > 500;

  const handleSave = () => {
    const errs = {};
    if (!bill) errs.bill = 'Enter bill number';
    if (!item) errs.item = 'Enter item details';
    if (!amt)  errs.amt  = 'Enter refund amount';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const id = addReturn({ billId: bill, customerName: cust || 'Customer', sp: '—', time: '—', reason, items: [{ name: item, qty: 1, price: refundAmt }], mode, refundAmt, approved: !needsApproval, notes: '' });
    setDone({ id, refundAmt, needsApproval });
  };

  if (done) return (
    <div>
      <div className={styles.receiptCard}>
        <div className={`${styles.receiptHead} ${styles.receiptDanger}`}>
          <i className="ti ti-arrow-back-up" style={{ fontSize: 40 }} />
          <div className={styles.receiptTitle}>Return processed</div>
          <div className={styles.receiptSub}>Return #{done.id} · 29 Sep 2026</div>
        </div>
        <div style={{ padding: 16 }}>
          {[['Bill no.', bill], ['Customer', cust || 'Customer'], ['Item', item], ['Reason', reason], ['Mode', mode]].map(([l, v]) => (
            <div key={l} className={styles.rRow}><span className={styles.rLabel}>{l}</span><span className={styles.rVal}>{v}</span></div>
          ))}
          <div className={styles.rTotal}><span>Refund</span><span style={{ color: 'var(--danger)' }}>−₹{done.refundAmt.toLocaleString('en-IN')}</span></div>
          {done.needsApproval
            ? <Alert variant="warning" icon="ti-clock" style={{ marginTop: 12 }}>Needs Mani's approval.</Alert>
            : <Alert variant="success" icon="ti-circle-check" style={{ marginTop: 12 }}>Approved automatically.</Alert>
          }
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/returns')}><i className="ti ti-arrow-left" /> Returns</Button>
          <Button variant="danger" size="md" fullWidth onClick={() => { setDone(null); setBill(''); setCust(''); setItem(''); setAmt(''); }}><i className="ti ti-plus" /> New return</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Section title="Return details">
        <Field label="Bill number *" error={errors.bill}><Input placeholder="1042" value={bill} onChange={e => { setBill(e.target.value); setErrors(p => ({...p, bill:''})); }} /></Field>
        <Field label="Customer name"><Input placeholder="Customer name" value={cust} onChange={e => setCust(e.target.value)} /></Field>
        <Field label="Item returned *" error={errors.item}><Input placeholder="Men's T-Shirt (M) × 1" value={item} onChange={e => { setItem(e.target.value); setErrors(p => ({...p, item:''})); }} /></Field>
        <Field label="Refund amount ₹ *" error={errors.amt}><Input type="number" placeholder="300" value={amt} onChange={e => { setAmt(e.target.value); setErrors(p => ({...p, amt:''})); }} /></Field>
      </Section>

      <Section title="Return reason">
        <div className={styles.reasonChips}>
          {RETURN_REASONS.map(r => <button key={r} className={`${styles.reasonChip} ${reason === r ? styles.reasonChipActive : ''}`} onClick={() => setReason(r)}>{r}</button>)}
        </div>
      </Section>

      <Section title="Resolve by">
        <div className={styles.refundModes}>
          {REFUND_MODES.map(m => <button key={m} className={`${styles.refundMode} ${mode === m ? styles.refundModeActive : ''}`} onClick={() => setMode(m)}>{m}</button>)}
        </div>
        {needsApproval && <Alert variant="warning" icon="ti-alert-circle" style={{ marginTop: 10 }}>Returns above ₹500 need Mani's approval.</Alert>}
      </Section>

      <Button variant="danger" size="lg" fullWidth onClick={handleSave}><i className="ti ti-check" /> Process return</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
