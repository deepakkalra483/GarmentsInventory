import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Pill, Button } from '../components/ui';
import { calcBillTotal, getPayStatusCls } from '../data/staticData';
import styles from './pages.module.css';

export default function ViewBillPage() {
  const { id } = useParams();
  const { isAdmin, hasPerm } = useAuth();
  const { getBill, returns } = useApp();
  const navigate = useNavigate();
  const bill = getBill(id);
  if (!bill) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>Bill not found.</div>;

  // Gross total of original sale
  const grossTotal = bill._total ?? calcBillTotal(bill.items, bill.discount);

  // Total refunded on this bill
  const returnedAmt = bill.returnedAmt || 0;

  // Net amount customer actually paid (after returns)
  const netTotal = Math.max(0, grossTotal - returnedAmt);

  const cls         = getPayStatusCls(bill.pay);
  const billReturns = returns.filter(r => r.billId === id);

  return (
    <div>
      {/* Hero */}
      <div className={`${styles.billHero} ${styles.billHeroBlue}`}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Bill #{bill.id}</div>

        {/* If there were returns, show strikethrough gross + net */}
        {returnedAmt > 0 ? (
          <>
            <div style={{ fontSize: 14, textDecoration: 'line-through', opacity: 0.5, marginBottom: 2 }}>
              ₹{grossTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>₹{netTotal.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.75 }}>
              after −₹{returnedAmt.toLocaleString('en-IN')} return
            </div>
          </>
        ) : (
          <div style={{ fontSize: 32, fontWeight: 800 }}>₹{grossTotal.toLocaleString('en-IN')}</div>
        )}

        <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Pill variant={cls}>{bill.pay}</Pill>
          {bill.hasReturn && <Pill variant="red">Has return</Pill>}
        </div>
      </div>

      <Section>
        {[['Customer', bill.name], ['Date & time', `${bill.date} · ${bill.time}`], ['Salesperson', bill.sp], ['Payment mode', bill.pay]].map(([l, v]) => (
          <div key={l} className={styles.rRow}><span className={styles.rLabel}>{l}</span><span className={styles.rVal}>{v}</span></div>
        ))}

        <div style={{ margin: '12px 0 4px', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Items sold</div>
        <div className={styles.rItems}>
          {bill.items.map((it, i) => (
            <div key={i} className={styles.rItem}><span>{it.name} ×{it.qty}</span><span>₹{(it.price * it.qty).toLocaleString('en-IN')}</span></div>
          ))}
          {bill.discount > 0 && <div className={styles.rItem}><span>Discount</span><span style={{ color: 'var(--success)' }}>−₹{bill.discount.toLocaleString('en-IN')}</span></div>}
        </div>

        {/* Totals breakdown */}
        <div className={styles.rTotal}><span>Gross total</span><span style={{ color: 'var(--accent)' }}>₹{grossTotal.toLocaleString('en-IN')}</span></div>
        {returnedAmt > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', color: 'var(--danger)' }}>
              <span>Total returned</span><span>−₹{returnedAmt.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, padding: '8px 0 0', borderTop: '1px solid var(--border2)', marginTop: 4 }}>
              <span>Net total</span><span style={{ color: 'var(--accent)' }}>₹{netTotal.toLocaleString('en-IN')}</span>
            </div>
          </>
        )}
      </Section>

      {/* Returns section */}
      {billReturns.length > 0 && (
        <Section title={`Returns (${billReturns.length})`}>
          {billReturns.map(r => (
            <div key={r.id} style={{ background: 'var(--danger-bg)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>Return #{r.id}</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>−₹{r.refundAmt.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--danger-text)', marginTop: 3 }}>{r.reason} · {r.mode} · {r.date}</div>
              {r.items?.map((it, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>↩ {it.name} ×{it.qty}</div>
              ))}
            </div>
          ))}
        </Section>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {hasPerm('returns') && (
          <Button variant="danger" size="md" fullWidth onClick={() => navigate(`/sales/${id}/return`)}>
            <i className="ti ti-arrow-back-up" /> Return / refund
          </Button>
        )}
        {isAdmin() && (
          <Button variant="success" size="md" fullWidth onClick={() => navigate(`/sales/${id}/edit`)}>
            <i className="ti ti-edit" /> Edit bill
          </Button>
        )}
      </div>
      <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/sales')}><i className="ti ti-arrow-left" /> Back to sales</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
