import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Pill, Button, Alert } from '../components/ui';
import { calcBillTotal, getPayStatusCls } from '../data/staticData';
import styles from './pages.module.css';

export default function ViewBillPage() {
  const { id } = useParams();
  const { isAdmin, hasPerm } = useAuth();
  const { getBill, returns } = useApp();
  const navigate = useNavigate();
  const bill = getBill(id);
  if (!bill) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>Bill not found.</div>;

  const total = calcBillTotal(bill.items, bill.discount);
  const cls   = getPayStatusCls(bill.pay);
  const billReturns = returns.filter(r => r.billId === id);

  return (
    <div>
      {/* Hero */}
      <div className={`${styles.billHero} ${styles.billHeroBlue}`}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Bill #{bill.id}</div>
        <div style={{ fontSize: 32, fontWeight: 800 }}>₹{total.toLocaleString('en-IN')}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Pill variant={cls}>{bill.pay}</Pill>
          {bill.hasReturn && <Pill variant="red">Partial return</Pill>}
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
        <div className={styles.rTotal}><span>Grand total</span><span style={{ color: 'var(--accent)' }}>₹{total.toLocaleString('en-IN')}</span></div>
      </Section>

      {billReturns.length > 0 && (
        <Section title="Returns on this bill">
          {billReturns.map(r => (
            <div key={r.id} style={{ background: 'var(--danger-bg)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>Return #{r.id}</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>−₹{r.refundAmt.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--danger-text)', marginTop: 3 }}>{r.reason} · {r.mode} · {r.date}</div>
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
