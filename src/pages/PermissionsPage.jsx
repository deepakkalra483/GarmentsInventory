import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Section, Avatar, Toggle, Button, Alert } from '../components/ui';
import styles from './pages.module.css';

const ALL_PERMS = [
  { key: 'sales',        label: 'Sales',              sub: 'Create and view bills' },
  { key: 'returns',      label: 'Returns',            sub: 'Process customer returns' },
  { key: 'purchase',     label: 'Purchase',           sub: 'Record vendor purchases' },
  { key: 'inventory',    label: 'Inventory / stock',  sub: 'View and edit stock levels' },
  { key: 'reports',      label: 'Reports',            sub: 'View sales & performance reports' },
  { key: 'discount',     label: 'Give discounts',     sub: 'Apply discounts without approval' },
  { key: 'viewAllBills', label: 'View all bills',     sub: "See other salespersons' bills too" },
];

export default function PermissionsPage() {
  const { userId } = useParams();                    // userId is now a Firebase UID
  const { users, getUserPerms, updatePerms } = useAuth();
  const navigate = useNavigate();

  const user = users.find(u => u.uid === userId);
  const [localPerms, setLocalPerms] = useState(getUserPerms(userId));
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  if (!user) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
      User not found.
    </div>
  );

  const toggle = (key) => setLocalPerms(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    await updatePerms(userId, localPerms);
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/admin'), 800);
  };

  const initials = user.initials || user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div>
      <Alert variant="info" icon="ti-info-circle">
        Changes apply immediately — {user.name.split(' ')[0]} will see updated access on next page load.
      </Alert>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 12 }}>
        <Avatar initials={initials} bg="#EFF6FF" fg="#1D4ED8" size={46} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{user.email} · Fashion Palace</div>
        </div>
      </div>

      <Section title="Access permissions">
        {ALL_PERMS.map(p => (
          <div key={p.key} className={styles.permRow}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{p.sub}</div>
            </div>
            <Toggle on={!!localPerms[p.key]} onToggle={() => toggle(p.key)} />
          </div>
        ))}
      </Section>

      {saved
        ? <Button variant="success" size="lg" fullWidth disabled><i className="ti ti-check" /> Saved!</Button>
        : <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : <><i className="ti ti-check" /> Save permissions</>}
          </Button>
      }
      <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/admin')} style={{ marginTop: 8 }}>Cancel</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
