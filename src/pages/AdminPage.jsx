import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEFAULT_PERMS } from '../context/AuthContext';
import { Section, Avatar, Toggle, Button, Field, Input, Alert } from '../components/ui';
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

// ── Add staff modal ──────────────────────────────────────────────────────────
function AddStaffModal({ onClose, onCreate }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  const handleCreate = async () => {
    if (!name.trim())     { setError('Enter staff name.'); return; }
    if (!email.trim())    { setError('Enter email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    const result = await onCreate({ name: name.trim(), email: email.trim(), password, permissions: { ...DEFAULT_PERMS } });
    setLoading(false);
    if (result.success) { setDone(true); setTimeout(onClose, 1500); }
    else setError(result.error);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 999,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '20px 20px 0 0',
        padding: 20, width: '100%', maxWidth: 480,
        boxShadow: '0 -4px 30px rgba(0,0,0,.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Add staff member</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
        </div>

        {done ? (
          <Alert variant="success" icon="ti-circle-check">Account created! Staff can now sign in.</Alert>
        ) : (
          <>
            {error && <Alert variant="danger" icon="ti-alert-circle" style={{ marginBottom: 10 }}>{error}</Alert>}
            <Field label="Full name">
              <Input placeholder="e.g. Raju Kumar" value={name} onChange={e => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" placeholder="raju@manigarments.com" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>
            <Field label="Password" hint="Staff will use this to sign in. Min 6 characters.">
              <Input type="password" placeholder="Set a password" value={password} onChange={e => setPassword(e.target.value)} />
            </Field>
            <Button variant="primary" size="lg" fullWidth onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating…' : <><i className="ti ti-user-plus" /> Create account</>}
            </Button>
            <Button variant="secondary" size="md" fullWidth onClick={onClose} style={{ marginTop: 8 }}>Cancel</Button>
          </>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { logout, users, createStaffUser } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = React.useState(
    Object.fromEntries(STORE_SETTINGS.map(s => [s.id, s.on]))
  );
  const [showAdd, setShowAdd] = useState(false);

  const staff = users.filter(u => u.role !== 'admin');

  // Chart data from staff users (falls back to empty)
  const chartData = staff.map(u => {
    const t = TEAM_TARGETS[u.uid] || TEAM_TARGETS[u.id] || { today: 0, target: 0 };
    return { name: u.name.split(' ')[0], sales: t.today, target: t.target };
  });

  return (
    <div>
      {/* Sales chart */}
      {chartData.length > 0 && (
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
      )}

      {/* Staff & permissions */}
      <Section title="Staff and permissions">
        {staff.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
            No staff accounts yet. Add your first staff member below.
          </div>
        )}
        {staff.map(u => {
          const permsObj   = u.permissions || {};
          const activeCount = Object.values(permsObj).filter(Boolean).length;
          const initials   = u.initials || u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
          return (
            <div key={u.uid} className={styles.userRow}>
              <Avatar initials={initials} bg="#EFF6FF" fg="#1D4ED8" size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>
                  {u.email} · {activeCount} permission{activeCount !== 1 ? 's' : ''}
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/permissions/${u.uid}`)}
                className={styles.permBtn}
              >
                Permissions
              </button>
            </div>
          );
        })}
        <Button variant="secondary" size="md" fullWidth style={{ marginTop: 10 }} onClick={() => setShowAdd(true)}>
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

      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onCreate={createStaffUser}
        />
      )}
    </div>
  );
}
