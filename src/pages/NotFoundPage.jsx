import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', background: 'var(--bg)' }}>
      <i className="ti ti-mood-sad" style={{ fontSize: 52, color: 'var(--text3)' }} />
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 14 }}>Page not found</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>The page you're looking for doesn't exist.</div>
      <Button variant="primary" size="lg" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
        <i className="ti ti-home" /> Go home
      </Button>
    </div>
  );
}
