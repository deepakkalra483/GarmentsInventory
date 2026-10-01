import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import styles from './layout.module.css';

export default function AppShell() {
  return (
    <div className={styles.shell}>
      <TopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
