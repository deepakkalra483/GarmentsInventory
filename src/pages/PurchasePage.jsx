import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MetricCard, Section, Card, Pill, Button, EmptyState } from '../components/ui';
import { calcPurchaseTotal } from '../data/staticData';
import styles from './pages.module.css';

const STATUS_CLS = { 'Paid': 'green', 'Partial': 'amber', 'Unpaid': 'red', 'Paid full': 'green', 'Credit / unpaid': 'red' };

export default function PurchasePage() {
  const { purchases } = useApp();
  const navigate = useNavigate();

  const monthlyTotal = purchases.reduce((s, p) => s + calcPurchaseTotal(p.items, p.gst, p.freight), 0);

  // Due = any purchase that is not fully paid
  const hasDue = (p) => p.payStatus === 'Partial' || p.payStatus === 'Credit / unpaid' || p.payStatus === 'Unpaid';
  const dueAmt = (p) => Math.max(0, calcPurchaseTotal(p.items, p.gst, p.freight) - (Number(p.paidAmt) || 0));

  const unpaidList = purchases.filter(hasDue);
  const unpaidAmt  = unpaidList.reduce((s, p) => s + dueAmt(p), 0);

  return (
    <div>
      {/* ── NEW PURCHASE button at top ── */}
      <Button variant="primary" size="md" fullWidth onClick={() => navigate('/purchase/new')} style={{ marginBottom: 12 }}>
        <i className="ti ti-plus" /> New purchase
      </Button>

      <div className={styles.metricGrid}>
        <MetricCard label="This month" value={`₹${monthlyTotal.toLocaleString('en-IN')}`} sub={`${purchases.length} orders`} />
        <MetricCard label="Due to vendors" value={`₹${unpaidAmt.toLocaleString('en-IN')}`} sub={`${unpaidList.length} pending`} />
      </div>

      <Section title="Recent purchases">
        {purchases.length === 0
          ? <EmptyState icon="ti-truck" title="No purchases yet" sub="Add vendor purchases to track them here" />
          : purchases.map(p => {
            const total = calcPurchaseTotal(p.items, p.gst, p.freight);
            const cls   = STATUS_CLS[p.payStatus] || 'grey';
            return (
              <Card key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{p.vendor}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{p.date} · Invoice #{p.invoiceNo}</div>
                  </div>
                  <Pill variant={cls}>{p.payStatus}</Pill>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>
                  {p.items.map(it => `${it.name} ×${it.qty}`).join(' · ')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)' }}>₹{total.toLocaleString('en-IN')}</div>
                  {hasDue(p) && dueAmt(p) > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--danger-text)', fontWeight: 600 }}>Due: ₹{dueAmt(p).toLocaleString('en-IN')}</div>
                  )}
                </div>
              </Card>
            );
          })
        }
      </Section>
    </div>
  );
}
