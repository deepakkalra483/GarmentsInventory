import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Field, Input, Button, Alert } from '../components/ui';
import { auth } from '../firebase/firebase';
import styles from './pages.module.css';

export default function LoginPage() {
  const { login, seedAdminProfile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    if (result.success) {
      // Seed admin profile on very first login if Firestore doc is missing
      if (auth.currentUser) await seedAdminProfile(auth.currentUser);
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
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

          {error && (
            <Alert variant="danger" icon="ti-alert-circle" style={{ marginBottom: 12 }}>
              {error}
            </Alert>
          )}

          <Field label="Email">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="email"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
          </Field>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
          >
            {loading
              ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
              : <><i className="ti ti-login" /> Sign in</>
            }
          </Button>

          <Alert variant="info" icon="ti-info-circle" style={{ marginTop: 14 }}>
            <div style={{ lineHeight: 1.7 }}>
              Use your registered email and password to sign in.
              <br />Contact admin if you forgot your password.
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}
