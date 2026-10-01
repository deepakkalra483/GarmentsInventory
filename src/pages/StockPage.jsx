import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SearchBar, Card, Pill, Chip, Button, EmptyState, LockedBanner } from '../components/ui';
import { getStockStatus, CATEGORIES } from '../data/staticData';
import styles from './pages.module.css';

const FILTERS = ['All', ...CATEGORIES.slice(0, 6)];

export default function StockPage() {
  const { isAdmin, hasPerm } = useAuth();
  const { stock } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  if (!hasPerm('inventory')) return (
    <LockedBanner title="Inventory access not enabled" sub="Ask Mani (Admin) to grant you stock access." />
  );

  const filtered = stock.filter(s => {
    const matchQ = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.sku.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === 'All' || s.category === filter;
    return matchQ && matchF;
  });

  const lowCount = stock.filter(s => s.qty <= s.lowAlert).length;

  return (
    <div>
      {lowCount > 0 && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 16, color: 'var(--warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--warning-text)', fontWeight: 500 }}>{lowCount} item{lowCount > 1 ? 's' : ''} low on stock</span>
        </div>
      )}

      <SearchBar placeholder="Search item, SKU…" value={query} onChange={e => setQuery(e.target.value)} />

      <div className={styles.chipRow}>
        {FILTERS.map(f => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="ti-package" title="No items found" sub="Try adjusting your search or filter" />
        : filtered.map(s => {
          const { label, cls } = getStockStatus(s.qty, s.lowAlert);
          return (
            <Card key={s.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 11, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ti ti-shirt" style={{ fontSize: 22, color: 'var(--accent)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>SKU-{s.sku} · {s.sizes} · {s.fabric}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{s.vendor}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: cls === 'red' ? 'var(--danger)' : cls === 'amber' ? 'var(--warning)' : 'var(--text)' }}>
                    {s.qty}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>pcs</div>
                  <Pill variant={cls}>{label}</Pill>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)' }}>
                <span>Buy: <strong style={{ color: 'var(--text)' }}>₹{s.buyPrice}</strong></span>
                <span>Sell: <strong style={{ color: 'var(--accent)' }}>₹{s.sellPrice}</strong></span>
                <span>Alert at: <strong style={{ color: 'var(--text)' }}>{s.lowAlert} pcs</strong></span>
              </div>
            </Card>
          );
        })
      }

      {isAdmin() && (
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/stock/new')} style={{ marginTop: 4 }}>
          <i className="ti ti-plus" /> Add garment
        </Button>
      )}
      <div style={{ height: 8 }} />
    </div>
  );
}
