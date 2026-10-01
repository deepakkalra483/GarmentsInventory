import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Button, Alert } from '../components/ui';
import { RETURN_REASONS, REFUND_MODES, CATALOGUE } from '../data/staticData';
import styles from './pages.module.css';

export default function BillReturnPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { getBill, addReturn } = useApp();
  const navigate = useNavigate();
  const bill = getBill(id);

  const [selected, setSelected] = useState({});
  const [qtys, setQtys]         = useState({});
  const [reason, setReason]     = useState(RETURN_REASONS[0]);
  const [mode, setMode]         = useState(REFUND_MODES[0]);
  const [exchItem, setExchItem] = useState(CATALOGUE[0].name);
  const [notes, setNotes]       = useState('');
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(null);

  if (!bill) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>Bill not found.</div>;

  const toggle = (i) => setSelected(prev => ({ ...prev, [i]: !prev[i] }));
  const getQty = (i) => qtys[i] || 1;
  const setQty = (i, v) => setQtys(prev => ({ ...prev, [i]: Math.max(1, Math.min(bill.items[i].qty, v)) }));

  const refundAmt = bill.items.reduce((s, it, i) => selected[i] ? s + it.price * getQty(i) : s, 0);
  const needsApproval = !isAdmin() && refundAmt > 500;

  const handleConfirm = () => {
    if (!Object.values(selected).some(Boolean)) { setError('Select at least one item to return'); return; }
    setError('');
    const retItems = bill.items.filter((_, i) => selected[i]).map((it, origI) => {
      const idx = bill.items.indexOf(it);
      return { name: it.name, qty: getQty(idx), price: it.price };
    });
    const retId = addReturn({ billId: id, customerName: bill.name, sp: bill.sp, time: '—', reason, items: retItems, mode, refundAmt, approved: !needsApproval, notes });
    setDone({ retId, refundAmt, needsApproval, retItems });
  };

  if (done) return (
    <div>
      <div className={styles.receiptCard}>
        <div className={`${styles.receiptHead} ${styles.receiptDanger}`}>
          <i className="ti ti-arrow-back-up" style={{ fontSize: 40 }} />
          <div className={styles.receiptTitle}>Return processed</div>
          <div className={styles.receiptSub}>Return #{done.retId} · 29 Sep 2026</div>
        </div>
        <div style={{ padding: 16 }}>
          {[['Customer', bill.name], ['Original bill', `#${id}`], ['Reason', reason], ['Resolution', mode]].map(([l, v]) => (
            <div key={l} className={styles.rRow}><span className={styles.rLabel}>{l}</span><span className={styles.rVal}>{v}</span></div>
          ))}
          <div className={styles.rItems}>
            {done.retItems.map((it, i) => <div key={i} className={styles.rItem}><span>{it.name} ×{it.qty}</span><span style={{ color: 'var(--danger)' }}>−₹{(it.price * it.qty).toLocaleString('en-IN')}</span></div>)}
          </div>
          <div className={styles.rTotal}><span>Refund</span><span style={{ color: 'var(--danger)' }}>−₹{done.refundAmt.toLocaleString('en-IN')}</span></div>
          {done.needsApproval
            ? <Alert variant="warning" icon="ti-clock" style={{ marginTop: 12 }}>Amount exceeds ₹500 — flagged for Mani's approval.</Alert>
            : <Alert variant="success" icon="ti-circle-check" style={{ marginTop: 12 }}>Return approved automatically.</Alert>
          }
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate(`/sales/${id}`)}><i className="ti ti-file-invoice" /> View bill</Button>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/sales')}><i className="ti ti-receipt" /> All sales</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Original bill</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{bill.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Bill #{bill.id} · {bill.date}</div>
          </div>
        </div>
      </div>

      <Section>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>Select items to return</div>
        {bill.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => toggle(i)}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${selected[i] ? 'var(--danger)' : 'var(--border2)'}`, background: selected[i] ? 'var(--danger)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selected[i] && <i className="ti ti-check" style={{ fontSize: 13, color: '#fff' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>Sold qty: {it.qty} · ₹{it.price.toLocaleString('en-IN')} each</div>
            </div>
            {selected[i] && (
              <select
                className={styles.smallSelect}
                value={getQty(i)}
                onClick={e => e.stopPropagation()}
                onChange={e => setQty(i, parseInt(e.target.value))}
              >
                {Array.from({ length: it.qty }, (_, k) => <option key={k + 1} value={k + 1}>{k + 1}</option>)}
              </select>
            )}
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, padding: '12px 0 0', color: 'var(--danger)' }}>
          <span>Refund amount</span><span>₹{refundAmt.toLocaleString('en-IN')}</span>
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 6 }}>{error}</div>}
      </Section>

      <Section title="Return reason">
        <div className={styles.reasonChips}>
          {RETURN_REASONS.map(r => (
            <button key={r} className={`${styles.reasonChip} ${reason === r ? styles.reasonChipActive : ''}`} onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>
      </Section>

      <Section title="Resolve by">
        <div className={styles.refundModes}>
          {REFUND_MODES.map(m => (
            <button key={m} className={`${styles.refundMode} ${mode === m ? styles.refundModeActive : ''}`} onClick={() => setMode(m)}>{m}</button>
          ))}
        </div>
        {mode === 'Exchange' && (
          <Field label="Exchange with" style={{ marginTop: 12 }}>
            <select className={styles.fullSelect} value={exchItem} onChange={e => setExchItem(e.target.value)}>
              {CATALOGUE.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Notes" style={{ marginTop: 10 }}>
          <Input placeholder="Any extra details…" value={notes} onChange={e => setNotes(e.target.value)} />
        </Field>
        {needsApproval && <Alert variant="warning" icon="ti-alert-circle" style={{ marginTop: 10 }}>Returns above ₹500 need Mani's approval.</Alert>}
      </Section>

      <Button variant="danger" size="lg" fullWidth onClick={handleConfirm}><i className="ti ti-check" /> Confirm return</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
