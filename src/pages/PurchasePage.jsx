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
  const unpaid = purchases.filter(p => p.payStatus === 'Unpaid' || p.payStatus === 'Credit / unpaid');
  const unpaidAmt = unpaid.reduce((s, p) => s + (calcPurchaseTotal(p.items, p.gst, p.freight) - p.paidAmt), 0);

  return (
    <div>
      <div className={styles.metricGrid}>
        <MetricCard label="This month" value={`₹${monthlyTotal.toLocaleString('en-IN')}`} sub={`${purchases.length} orders`} />
        <MetricCard label="Unpaid" value={`₹${unpaidAmt.toLocaleString('en-IN')}`} sub={`${unpaid.length} vendors`} />
      </div>

      <Section title="Recent purchases">
        {purchases.length === 0
          ? <EmptyState icon="ti-truck" title="No purchases yet" sub="Add vendor purchases to track them here" />
          : purchases.map(p => {
            const total = calcPurchaseTotal(p.items, p.gst, p.freight);
            const due   = total - p.paidAmt;
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
                  {due > 0 && <div style={{ fontSize: 12, color: 'var(--danger-text)' }}>Due: ₹{due.toLocaleString('en-IN')}</div>}
                </div>
              </Card>
            );
          })
        }
      </Section>

      <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/purchase/new')}>
        <i className="ti ti-plus" /> New purchase
      </Button>
    </div>
  );
}
