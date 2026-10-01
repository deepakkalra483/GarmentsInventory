import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, USERS } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { MetricCard, Section, Card, Pill, ProgressBar, Avatar, Button } from '../components/ui';
import { calcBillTotal, TEAM_TARGETS, getPayStatusCls, ATTENDANCE } from '../data/staticData';
import styles from './pages.module.css';

export default function DashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const { bills, returns, stock } = useApp();
  const navigate = useNavigate();

  const todayBills = bills.filter(b => b.date === '29 Sep 2026');
  const myBills = isAdmin() ? todayBills : todayBills.filter(b => b.spId === currentUser.id);
  const todaySales = todayBills.reduce((s, b) => s + calcBillTotal(b.items, b.discount), 0);
  const todayReturns = returns.filter(r => r.date === '29 Sep 2026').length;
  const lowStock = stock.filter(s => s.qty <= s.lowAlert);

  const myStats = TEAM_TARGETS[currentUser.id];

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
        Good morning, {currentUser.name.split(' ')[0]} 👋
      </p>

      <div className={styles.metricGrid}>
        <MetricCard label="Today's Sales" value={`₹${todaySales.toLocaleString('en-IN')}`} sub="↑ 12% vs yesterday" variant="blue" />
        <MetricCard label={isAdmin() ? 'Total Bills' : 'My Bills'} value={isAdmin() ? todayBills.length : myBills.length} sub="today" />
        {isAdmin()
          ? <MetricCard label="Stock Items" value={stock.length} sub={`${lowStock.length} low/critical`} />
          : <MetricCard label="My Target" value={`₹${myStats?.today?.toLocaleString('en-IN') || 0}`} sub={`of ₹${myStats?.target?.toLocaleString('en-IN') || 0}`} />
        }
        <MetricCard label="Returns" value={todayReturns} sub="today" />
      </div>

      {lowStock.length > 0 && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 16, color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning-text)' }}>Low stock alert</div>
            <div style={{ fontSize: 12, color: 'var(--warning-text)', marginTop: 2 }}>
              {lowStock.slice(0, 2).map(s => `${s.name} (${s.qty} left)`).join(' · ')}
              {lowStock.length > 2 && ` · +${lowStock.length - 2} more`}
            </div>
          </div>
        </div>
      )}

      {isAdmin() && (
        <Section title="Team performance today">
          {Object.entries(TEAM_TARGETS).map(([uid, t]) => {
            const u = USERS[uid];
            const pct = Math.round((t.today / t.target) * 100);
            return (
              <div key={uid} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Avatar initials={u.initials} bg={u.bg} fg={u.fg} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      ₹{t.today.toLocaleString('en-IN')} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text2)' }}>{t.bills} bills</span>
                    </span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {!isAdmin() && myStats && (
        <Section title="My performance">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              ₹{myStats.today.toLocaleString('en-IN')} / ₹{myStats.target.toLocaleString('en-IN')}
            </span>
          </div>
          <ProgressBar pct={Math.round((myStats.today / myStats.target) * 100)} />
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>
            {myStats.bills} bills today · {Math.round((myStats.today / myStats.target) * 100)}% of daily target
          </div>
        </Section>
      )}

      <Section title="Recent activity">
        {bills.slice(0, 4).map(b => {
          const total = calcBillTotal(b.items, b.discount);
          const cls = getPayStatusCls(b.pay);
          return (
            <Card key={b.id} onClick={() => navigate(`/sales/${b.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Bill #{b.id} · {b.sp} · {b.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>₹{total.toLocaleString('en-IN')}</div>
                  <Pill variant={cls} style={{ marginTop: 3, display: 'inline-block' }}>{b.pay}</Pill>
                </div>
              </div>
            </Card>
          );
        })}
        <Button variant="ghost" size="sm" fullWidth onClick={() => navigate('/sales')} style={{ marginTop: 4 }}>
          View all sales →
        </Button>
      </Section>

      {isAdmin() && (
        <Section title="Attendance today">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                <th style={{ textAlign: 'left', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>Name</th>
                <th style={{ textAlign: 'center', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>In</th>
                <th style={{ textAlign: 'center', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>Out</th>
                <th style={{ textAlign: 'right', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE.map(a => (
                <tr key={a.id}>
                  <td style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{a.name.split(' ')[0]}</td>
                  <td style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', textAlign: 'center', color: 'var(--text2)' }}>{a.checkIn}</td>
                  <td style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', textAlign: 'center', color: 'var(--text2)' }}>{a.checkOut}</td>
                  <td style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                    <Pill variant={a.status === 'present' ? 'green' : 'red'}>{a.status === 'present' ? 'Present' : 'Absent'}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </div>
  );
}
