import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, USERS } from '../context/AuthContext';
import { Field, Input, Select, Button, Alert } from '../components/ui';
import styles from './pages.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = () => {
    const errs = {};
    if (!userId) errs.user = 'Select your account';
    else {
      const result = login(userId, pin);
      if (!result.success) errs.pin = result.error;
      else { navigate('/'); return; }
    }
    setErrors(errs);
  };

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginInner}>
        <div className={styles.loginLogo}>
          <div className={styles.logoBox}>
            <i className="ti ti-shirt" style={{ fontSize: 30, color: 'var(--accent)' }} />
          </div>
          <div className={styles.logoTitle}>Mani Garments</div>
          <div className={styles.logoSub}>Business Management App</div>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.loginCardTitle}>Sign in</div>

          <Field label="Your account" error={errors.user}>
            <Select value={userId} onChange={e => { setUserId(e.target.value); setErrors({}); }}>
              <option value="">Select your name</option>
              {Object.values(USERS).map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role === 'admin' ? 'Admin / Owner' : 'Salesperson'}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="PIN" error={errors.pin}>
            <Input
              type="password"
              placeholder="4-digit PIN"
              maxLength={4}
              inputMode="numeric"
              value={pin}
              onChange={e => { setPin(e.target.value); setErrors({}); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </Field>

          <Button variant="primary" size="lg" fullWidth onClick={handleLogin}>
            <i className="ti ti-login" /> Sign in
          </Button>

          <Alert variant="info" icon="ti-info-circle" style={{ marginTop: 14 }}>
            <div style={{ lineHeight: 1.7 }}>
              <strong>Demo PINs:</strong><br />
              Mani (Admin) → <strong>1234</strong>&nbsp;&nbsp;
              Raju → <strong>1111</strong>&nbsp;&nbsp;
              Sunita → <strong>2222</strong>&nbsp;&nbsp;
              Deepak → <strong>3333</strong>
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}
