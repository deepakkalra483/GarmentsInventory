import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge } from '../ui';
import styles from './layout.module.css';

const PAGE_META = {
  '/':                 { title: 'Dashboard',   sub: 'Today, 29 Sep 2026' },
  '/sales':            { title: 'Sales',        sub: 'All transactions' },
  '/sales/new':        { title: 'New Sale',     sub: '', back: '/sales' },
  '/returns':          { title: 'Returns',      sub: 'Customer returns' },
  '/returns/new':      { title: 'New Return',   sub: '', back: '/returns' },
  '/purchase':         { title: 'Purchase',     sub: 'Vendor orders' },
  '/purchase/new':     { title: 'New Purchase', sub: '', back: '/purchase' },
  '/stock':            { title: 'Stock',        sub: 'Inventory' },
  '/stock/new':        { title: 'Add Garment',  sub: '', back: '/stock' },
  '/admin':            { title: 'Admin Panel',  sub: 'Owner controls' },
};

export default function TopBar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  let meta = PAGE_META[pathname];
  if (!meta) {
    const parts = pathname.split('/');
    if (parts[1] === 'sales' && parts[2] && parts[3] === 'return') meta = { title: 'Return', sub: 'From bill #'+parts[2], back: `/sales/${parts[2]}` };
    else if (parts[1] === 'sales' && parts[2] && parts[3] === 'edit')   meta = { title: 'Edit Bill', sub: '#'+parts[2], back: `/sales/${parts[2]}` };
    else if (parts[1] === 'sales' && parts[2])   meta = { title: 'Bill #'+parts[2], sub: 'Invoice detail', back: '/sales' };
    else if (parts[1] === 'admin' && parts[2] === 'permissions') meta = { title: 'Permissions', sub: '', back: '/admin' };
    else meta = { title: 'Mani Garments', sub: '' };
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        {meta.back && (
          <button className={styles.backBtn} onClick={() => navigate(meta.back)} aria-label="Back">
            <i className="ti ti-arrow-left" style={{ fontSize: 18 }} />
          </button>
        )}
        <div>
          <div className={styles.topbarTitle}>{meta.title}</div>
          {meta.sub && <div className={styles.topbarSub}>{meta.sub}</div>}
        </div>
      </div>
      <div className={styles.topbarRight}>
        <Badge variant={isAdmin() ? 'admin' : 'blue'}>
          {isAdmin() ? <><i className="ti ti-shield" style={{ fontSize: 11 }} /> Admin</> : 'Sales'}
        </Badge>
        <div
          title="Tap to sign out"
          onClick={logout}
          style={{ cursor: 'pointer' }}
        >
          <Avatar
            initials={currentUser?.initials}
            bg={currentUser?.bg}
            fg={currentUser?.fg}
            size={34}
          />
        </div>
      </div>
    </header>
  );
}
