import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Section, Card, Pill, Button, EmptyState, LockedBanner } from '../components/ui';
import styles from './pages.module.css';

export default function ReturnsPage() {
  const { hasPerm } = useAuth();
  const { returns } = useApp();
  const navigate = useNavigate();

  if (!hasPerm('returns')) return (
    <LockedBanner title="Returns access not enabled" sub="Ask Mani (Admin) to grant you returns permission." />
  );

  return (
    <div>
      <Section title="Recent returns">
        {returns.length === 0
          ? <EmptyState icon="ti-arrow-back-up" title="No returns yet" sub="Processed returns will appear here" />
          : returns.map(r => (
            <Card key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.customerName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    Return #{r.id} · {r.reason} · {r.sp} · {r.date}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)' }}>−₹{r.refundAmt.toLocaleString('en-IN')}</div>
              </div>
              <div className={styles.pillRow}>
                {r.items.map((it, i) => <Pill key={i} variant="blue">{it.name} ×{it.qty}</Pill>)}
                <Pill variant={r.mode === 'Cash refund' ? 'red' : r.mode === 'Exchange' ? 'amber' : 'purple'}>{r.mode}</Pill>
                <Pill variant={r.approved ? 'green' : 'amber'}>{r.approved ? 'Approved' : 'Pending approval'}</Pill>
              </div>
            </Card>
          ))
        }
      </Section>
      <Button variant="danger" size="lg" fullWidth onClick={() => navigate('/returns/new')}>
        <i className="ti ti-arrow-back-up" /> Process new return
      </Button>
    </div>
  );
}
