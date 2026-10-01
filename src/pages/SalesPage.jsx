import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SearchBar, Card, Pill, Chip, Button, EmptyState } from '../components/ui';
import { calcBillTotal, getPayStatusCls } from '../data/staticData';
import styles from './pages.module.css';

const FILTERS = ['All', 'Today', 'This week', 'Paid', 'Credit'];

export default function SalesPage() {
  const { currentUser, isAdmin, hasPerm } = useAuth();
  const { bills } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const base = isAdmin() || hasPerm('viewAllBills')
    ? bills
    : bills.filter(b => b.spId === currentUser.id);

  const filtered = base.filter(b => {
    const matchQ = !query || b.name.toLowerCase().includes(query.toLowerCase()) || b.id.includes(query);
    const matchF =
      filter === 'All'       ? true :
      filter === 'Today'     ? b.date === '29 Sep 2026' :
      filter === 'This week' ? true :
      filter === 'Paid'      ? !['Credit'].includes(b.pay) :
      filter === 'Credit'    ? b.pay === 'Credit' : true;
    return matchQ && matchF;
  });

  return (
    <div>
      <SearchBar placeholder="Search by bill, customer…" value={query} onChange={e => setQuery(e.target.value)} />

      <div className={styles.chipRow}>
        {FILTERS.map(f => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="ti-receipt-off" title="No bills found" sub="Try adjusting your search or filter" />
        : filtered.map(b => {
          const total = calcBillTotal(b.items, b.discount);
          const cls = getPayStatusCls(b.pay);
          return (
            <Card key={b.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Bill #{b.id} · {b.sp} · {b.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>₹{total.toLocaleString('en-IN')}</div>
                  {b.hasReturn && <Pill variant="red" style={{ marginTop: 2, display: 'inline-block' }}>Partial return</Pill>}
                </div>
              </div>

              <div className={styles.pillRow}>
                {b.items.slice(0, 3).map((it, i) => (
                  <Pill key={i} variant="blue">{it.name.split('(')[0].trim()} ×{it.qty}</Pill>
                ))}
                {b.items.length > 3 && <Pill variant="grey">+{b.items.length - 3} more</Pill>}
                <Pill variant={cls}>{b.pay}</Pill>
                {b.discount > 0 && <Pill variant="purple">−₹{b.discount} disc</Pill>}
              </div>

              <div className={styles.billActions}>
                <button className={styles.billActionBtn} onClick={() => navigate(`/sales/${b.id}`)}>
                  <i className="ti ti-file-invoice" /> View bill
                </button>
                {hasPerm('returns') && (
                  <button className={`${styles.billActionBtn} ${styles.billActionDanger}`} onClick={() => navigate(`/sales/${b.id}/return`)}>
                    <i className="ti ti-arrow-back-up" /> Return
                  </button>
                )}
                {isAdmin() && (
                  <button className={`${styles.billActionBtn} ${styles.billActionSuccess}`} onClick={() => navigate(`/sales/${b.id}/edit`)}>
                    <i className="ti ti-edit" /> Edit
                  </button>
                )}
              </div>
            </Card>
          );
        })
      }

      <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/sales/new')} style={{ marginTop: 8 }}>
        <i className="ti ti-plus" /> New sale
      </Button>
    </div>
  );
}
