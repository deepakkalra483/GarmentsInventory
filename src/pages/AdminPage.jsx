import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, USERS } from '../context/AuthContext';
import { Section, Avatar, Toggle, Button } from '../components/ui';
import { TEAM_TARGETS } from '../data/staticData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './pages.module.css';

const STORE_SETTINGS = [
  { id: 'approveDiscount',  label: 'Require approval for large discounts',  sub: 'Discounts above ₹200 need your approval', on: true  },
  { id: 'approveReturns',   label: 'Require approval for returns > ₹500',   sub: 'Salesperson must notify you first',         on: true  },
  { id: 'viewAllBills',     label: 'Allow staff to view all bills',          sub: 'Off = each person sees only their own',     on: false },
  { id: 'autoLowStock',     label: 'Auto low-stock alert',                   sub: 'Alert when item falls below threshold',     on: true  },
];

const REPORTS = [
  { icon: 'ti-chart-bar',    label: 'Daily sales report',    sub: 'Revenue, bills, salesperson breakdown' },
  { icon: 'ti-users',        label: 'Team performance',      sub: 'Per-person sales vs targets' },
  { icon: 'ti-arrow-back-up',label: 'Returns summary',       sub: 'Returns, reasons, refund amounts' },
  { icon: 'ti-truck',        label: 'Purchase ledger',       sub: 'Vendor-wise purchases and dues' },
];

const chartData = Object.entries(TEAM_TARGETS).map(([uid, t]) => ({
  name: USERS[uid].name.split(' ')[0],
  sales: t.today,
  target: t.target,
}));

export default function AdminPage() {
  const { logout, perms } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = React.useState(
    Object.fromEntries(STORE_SETTINGS.map(s => [s.id, s.on]))
  );

  return (
    <div>
      {/* Sales chart */}
      <Section title="Today's team sales">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]} name="Sales">
              {chartData.map((_, i) => <Cell key={i} fill="var(--accent)" />)}
            </Bar>
            <Bar dataKey="target" radius={[6, 6, 0, 0]} name="Target" fill="var(--surface2)" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Staff & permissions */}
      <Section title="Staff and permissions">
        {Object.values(USERS).filter(u => u.id !== 'admin').map(u => {
          const userPerms = perms[u.id] || {};
          const activeCount = Object.values(userPerms).filter(Boolean).length;
          return (
            <div key={u.id} className={styles.userRow}>
              <Avatar initials={u.initials} bg={u.bg} fg={u.fg} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>
                  Salesperson · {activeCount} permission{activeCount !== 1 ? 's' : ''}
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/permissions/${u.id}`)}
                className={styles.permBtn}
              >
                Permissions
              </button>
            </div>
          );
        })}
        <Button variant="secondary" size="md" fullWidth style={{ marginTop: 10 }}>
          <i className="ti ti-user-plus" /> Add staff member
        </Button>
      </Section>

      {/* Store settings */}
      <Section title="Store settings">
        {STORE_SETTINGS.map(s => (
          <div key={s.id} className={styles.permRow}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s.sub}</div>
            </div>
            <Toggle on={settings[s.id]} onToggle={() => setSettings(p => ({ ...p, [s.id]: !p[s.id] }))} />
          </div>
        ))}
      </Section>

      {/* Reports */}
      <Section title="Reports">
        {REPORTS.map(r => (
          <div key={r.label} className={styles.reportRow}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${r.icon}`} style={{ fontSize: 18, color: 'var(--accent)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{r.sub}</div>
            </div>
            <i className="ti ti-chevron-right" style={{ fontSize: 16, color: 'var(--text3)' }} />
          </div>
        ))}
      </Section>

      <Button variant="secondary" size="lg" fullWidth onClick={logout}>
        <i className="ti ti-logout" /> Sign out
      </Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
