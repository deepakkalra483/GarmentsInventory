import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, USERS } from '../context/AuthContext';
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
  const { userId } = useParams();
  const { getUserPerms, updatePerms } = useAuth();
  const navigate = useNavigate();
  const user = USERS[userId];
  const [localPerms, setLocalPerms] = useState(getUserPerms(userId));
  const [saved, setSaved] = useState(false);

  if (!user) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>User not found.</div>;

  const toggle = (key) => setLocalPerms(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    updatePerms(userId, localPerms);
    setSaved(true);
    setTimeout(() => navigate('/admin'), 800);
  };

  return (
    <div>
      <Alert variant="info" icon="ti-info-circle">
        Changes apply the next time {user.name.split(' ')[0]} signs in.
      </Alert>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 12 }}>
        <Avatar initials={user.initials} bg={user.bg} fg={user.fg} size={46} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Salesperson · Mani Garments</div>
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
        : <Button variant="primary" size="lg" fullWidth onClick={handleSave}><i className="ti ti-check" /> Save permissions</Button>
      }
      <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/admin')} style={{ marginTop: 8 }}>Cancel</Button>
      <div style={{ height: 8 }} />
    </div>
  );
}
