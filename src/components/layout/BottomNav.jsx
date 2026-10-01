import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './layout.module.css';

const ALL_TABS = [
  { to: '/',        icon: 'ti-layout-dashboard', label: 'Home',     always: true },
  { to: '/sales',   icon: 'ti-receipt',           label: 'Sales',    always: true },
  { to: '/returns', icon: 'ti-arrow-back-up',     label: 'Returns',  always: true },
  { to: '/purchase',icon: 'ti-truck',             label: 'Purchase', perm: 'purchase' },
  { to: '/stock',   icon: 'ti-package',           label: 'Stock',    perm: 'inventory' },
  { to: '/admin',   icon: 'ti-settings',          label: 'Admin',    adminOnly: true },
];

export default function BottomNav() {
  const { isAdmin, hasPerm } = useAuth();

  const tabs = ALL_TABS.filter(t => {
    if (t.adminOnly) return isAdmin();
    if (t.perm)      return isAdmin() || hasPerm(t.perm);
    return true;
  });

  return (
    <nav className={styles.nav}>
      {tabs.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) =>
            [styles.navBtn, isActive ? styles.navBtnActive : ''].join(' ')
          }
        >
          <i className={`ti ${t.icon}`} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
