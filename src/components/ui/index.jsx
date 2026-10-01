import React from 'react';
import styles from './ui.module.css';

/* ── Badge ── */
export function Badge({ variant = 'blue', children }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>;
}

/* ── Pill ── */
export function Pill({ variant = 'grey', children }) {
  return <span className={`${styles.pill} ${styles[`pill_${variant}`]}`}>{children}</span>;
}

/* ── Button ── */
export function Button({ variant = 'primary', size = 'md', fullWidth, children, className, ...props }) {
  return (
    <button
      className={[
        styles.btn,
        styles[`btn_${variant}`],
        styles[`btn_${size}`],
        fullWidth ? styles.btn_full : '',
        className || '',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Icon Button ── */
export function IconButton({ children, ...props }) {
  return <button className={styles.iconBtn} {...props}>{children}</button>;
}

/* ── Card ── */
export function Card({ children, className, onClick, ...props }) {
  return (
    <div
      className={[styles.card, onClick ? styles.cardClickable : '', className || ''].join(' ')}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Section ── */
export function Section({ title, children, className }) {
  return (
    <div className={[styles.section, className || ''].join(' ')}>
      {title && <div className={styles.sectionTitle}>{title}</div>}
      {children}
    </div>
  );
}

/* ── Metric Card ── */
export function MetricCard({ label, value, sub, variant, icon }) {
  return (
    <div className={`${styles.metric} ${variant ? styles[`metric_${variant}`] : ''}`}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
      {sub && <div className={styles.metricSub}>{sub}</div>}
    </div>
  );
}

/* ── Form Field ── */
export function Field({ label, error, hint, children }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.fieldLabel}>{label}</label>}
      {children}
      {hint && <div className={styles.fieldHint}>{hint}</div>}
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
}

/* ── Input ── */
export function Input({ ...props }) {
  return <input className={styles.input} {...props} />;
}

/* ── Select ── */
export function Select({ children, ...props }) {
  return <select className={styles.input} {...props}>{children}</select>;
}

/* ── Textarea ── */
export function Textarea({ ...props }) {
  return <textarea className={styles.textarea} {...props} />;
}

/* ── SearchBar ── */
export function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className={styles.searchBar}>
      <i className="ti ti-search" />
      <input
        type="text"
        placeholder={placeholder || 'Search…'}
        value={value}
        onChange={onChange}
        className={styles.searchInput}
      />
    </div>
  );
}

/* ── Toggle ── */
export function Toggle({ on, onToggle }) {
  return (
    <button
      className={`${styles.toggle} ${on ? styles.toggleOn : styles.toggleOff}`}
      onClick={onToggle}
      aria-label="Toggle"
    />
  );
}

/* ── Avatar ── */
export function Avatar({ initials, bg, fg, size = 36 }) {
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className={styles.empty}>
      <i className={`ti ${icon}`} style={{ fontSize: 40, color: 'var(--text3)' }} />
      <div className={styles.emptyTitle}>{title}</div>
      {sub && <div className={styles.emptySub}>{sub}</div>}
      {action}
    </div>
  );
}

/* ── Locked Banner ── */
export function LockedBanner({ title, sub }) {
  return (
    <div className={styles.lockedBanner}>
      <i className="ti ti-lock" style={{ fontSize: 20, color: 'var(--danger)', flexShrink: 0 }} />
      <div>
        <div className={styles.lockedTitle}>{title}</div>
        {sub && <div className={styles.lockedSub}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Alert ── */
export function Alert({ variant = 'info', icon, children }) {
  return (
    <div className={`${styles.alert} ${styles[`alert_${variant}`]}`}>
      {icon && <i className={`ti ${icon}`} style={{ fontSize: 16, flexShrink: 0 }} />}
      <div style={{ fontSize: 12 }}>{children}</div>
    </div>
  );
}

/* ── Progress Bar ── */
export function ProgressBar({ pct, color }) {
  return (
    <div className={styles.progWrap}>
      <div className={styles.progFill} style={{ width: `${Math.min(100, pct)}%`, background: color || 'var(--accent)' }} />
    </div>
  );
}

/* ── Divider ── */
export function Divider() {
  return <div className={styles.divider} />;
}

/* ── Chip (filter) ── */
export function Chip({ active, onClick, children }) {
  return (
    <button className={`${styles.chip} ${active ? styles.chipActive : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

/* ── Confirm receipt head ── */
export function ReceiptHead({ variant = 'success', icon, title, sub }) {
  return (
    <div className={`${styles.receiptHead} ${styles[`receiptHead_${variant}`]}`}>
      <i className={`ti ${icon}`} style={{ fontSize: 38 }} />
      <div className={styles.receiptTitle}>{title}</div>
      {sub && <div className={styles.receiptSub}>{sub}</div>}
    </div>
  );
}
