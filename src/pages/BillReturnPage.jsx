import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Field, Input, Button, Alert } from '../components/ui';
import { RETURN_REASONS, REFUND_MODES } from '../data/staticData';
import styles from './pages.module.css';

export default function BillReturnPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { getBill, addReturn, stock } = useApp();
  const navigate = useNavigate();
  const bill = getBill(id);

  const [selected, setSelected] = useState({});
  const [qtys, setQtys]         = useState({});
  const [reason, setReason]     = useState(RETURN_REASONS[0]);
  const [mode, setMode]         = useState(REFUND_MODES[0]);
  // exchange item picked from live stock
  const [exchStockId, setExchStockId] = useState(stock[0]?.id || '');
  const [notes, setNotes]       = useState('');
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(null);
  const [saving, setSaving]     = useState(false);

  if (!bill) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>Bill not found.</div>;

  const toggle   = (i) => setSelected(prev => ({ ...prev, [i]: !prev[i] }));
  const getQty   = (i) => qtys[i] || 1;
  const setQty   = (i, v) => setQtys(prev => ({ ...prev, [i]: Math.max(1, Math.min(bill.items[i].qty, v)) }));

  // Refund = sum of returned items at their sold price
  const refundAmt    = bill.items.reduce((s, it, i) => selected[i] ? s + it.price * getQty(i) : s, 0);
  const needsApproval = !isAdmin() && refundAmt > 500;

  // Net bill total after this return  (previous returns + this return)
  const prevReturned  = bill.returnedAmt || 0;
  const netAfterReturn = Math.max(0, (bill._total || 0) - prevReturned - refundAmt);

  const handleConfirm = async () => {
    if (!Object.values(selected).some(Boolean)) { setError('Select at least one item to return'); return; }
    setError('');
    setSaving(true);

    const retItems = bill.items
      .filter((_, i) => selected[i])
      .map((it, _, arr) => {
        const origIdx = bill.items.indexOf(it);
        return {
          stockId: it.stockId || null,
          name:    it.name,
          qty:     getQty(origIdx),
          price:   it.price,
        };
      });

    const exchItem = mode === 'Exchange'
      ? stock.find(s => s.id === exchStockId)?.name || ''
      : '';

    const retId = await addReturn({
      billId:       id,
      customerName: bill.name,
      sp:           bill.sp,
      time:         new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      reason,
      items:        retItems,
      mode,
      exchItem,
      refundAmt,
      approved:     !needsApproval,
      notes,
    });

    setSaving(false);
    setDone({ retId, refundAmt, needsApproval, retItems });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) return (
    <div>
      <div className={styles.receiptCard}>
        <div className={`${styles.receiptHead} ${styles.receiptDanger}`}>
          <i className="ti ti-arrow-back-up" style={{ fontSize: 40 }} />
          <div className={styles.receiptTitle}>Return processed</div>
          <div className={styles.receiptSub}>
            Return #{done.retId} · Bill #{id}
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {[['Customer', bill.name], ['Original bill', `#${id}`], ['Reason', reason], ['Resolution', mode]].map(([l, v]) => (
            <div key={l} className={styles.rRow}><span className={styles.rLabel}>{l}</span><span className={styles.rVal}>{v}</span></div>
          ))}
          <div className={styles.rItems}>
            {done.retItems.map((it, i) => (
              <div key={i} className={styles.rItem}>
                <span>{it.name} ×{it.qty}</span>
                <span style={{ color: 'var(--danger)' }}>−₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className={styles.rTotal}><span>Refund</span><span style={{ color: 'var(--danger)' }}>−₹{done.refundAmt.toLocaleString('en-IN')}</span></div>

          {done.needsApproval
            ? <Alert variant="warning" icon="ti-clock" style={{ marginTop: 12 }}>Amount exceeds ₹500 — flagged for admin approval.</Alert>
            : <Alert variant="success" icon="ti-circle-check" style={{ marginTop: 12 }}>Return approved. Bill & stock updated.</Alert>
          }
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate(`/sales/${id}`)}><i className="ti ti-file-invoice" /> View bill</Button>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/sales')}><i className="ti ti-receipt" /> All sales</Button>
        </div>
      </div>
    </div>
  );

  // ── Bill summary at top ─────────────────────────────────────────────────────
  const billTotal = bill._total ?? bill.items?.reduce((s, it) => s + it.price * it.qty, 0) - (bill.discount || 0);

  return (
    <div>
      {/* Original bill info */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Original bill</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{bill.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Bill #{bill.id} · {bill.date} · {bill.sp}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>₹{billTotal?.toLocaleString('en-IN') || '—'}</div>
            {prevReturned > 0 && <div style={{ fontSize: 11, color: 'var(--danger)' }}>−₹{prevReturned.toLocaleString('en-IN')} returned</div>}
          </div>
        </div>
      </div>

      {/* Select items */}
      <Section>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>Select items to return</div>
        {bill.items.map((it, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
            onClick={() => toggle(i)}
          >
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

        {refundAmt > 0 && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--danger-bg, #fef2f2)', border: '1px solid var(--danger-border, #fecaca)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, color: 'var(--danger)' }}>
              <span>Refund amount</span><span>₹{refundAmt.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
              <span>Bill total after return</span><span>₹{netAfterReturn.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
        {error && <div style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 6 }}>{error}</div>}
      </Section>

      {/* Reason */}
      <Section title="Return reason">
        <div className={styles.reasonChips}>
          {RETURN_REASONS.map(r => (
            <button key={r} className={`${styles.reasonChip} ${reason === r ? styles.reasonChipActive : ''}`} onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>
      </Section>

      {/* Resolution */}
      <Section title="Resolve by">
        <div className={styles.refundModes}>
          {REFUND_MODES.map(m => (
            <button key={m} className={`${styles.refundMode} ${mode === m ? styles.refundModeActive : ''}`} onClick={() => setMode(m)}>{m}</button>
          ))}
        </div>
        {mode === 'Exchange' && (
          <Field label="Exchange with" style={{ marginTop: 12 }}>
            <select className={styles.fullSelect} value={exchStockId} onChange={e => setExchStockId(e.target.value)}>
              <option value="">— Select item —</option>
              {stock.filter(s => s.qty > 0).map(s => (
                <option key={s.id} value={s.id}>{s.name} · ₹{s.sellPrice} · {s.qty} in stock</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Notes" style={{ marginTop: 10 }}>
          <Input placeholder="Any extra details…" value={notes} onChange={e => setNotes(e.target.value)} />
        </Field>
        {needsApproval && <Alert variant="warning" icon="ti-alert-circle" style={{ marginTop: 10 }}>Returns above ₹500 need admin approval.</Alert>}
      </Section>

      <Button variant="danger" size="lg" fullWidth onClick={handleConfirm} disabled={saving}>
        {saving
          ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
          : <><i className="ti ti-check" /> Confirm return</>
        }
      </Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
