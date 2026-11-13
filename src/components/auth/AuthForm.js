'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Shared login and sign-up form. mode: 'login' | 'signup'.
export default function AuthForm({ mode }) {
  const router = useRouter();
  const isSignup = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.');
        setBusy(false);
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check that it is running.');
      setBusy(false);
    }
  }

  return (
    <form className="sys-panel" onSubmit={onSubmit} style={{ gap: 16 }}>
      <div className="sys-field">
        <label className="sys-label" htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          className="sys-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="sys-field">
        <label className="sys-label" htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          className="sys-input"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
          minLength={isSignup ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isSignup && <span className="sys-small sys-muted">At least 8 characters.</span>}
      </div>

      {error && (
        <p role="alert" className="sys-small" style={{ color: '#ff8a98' }}>
          {error}
        </p>
      )}

      <button type="submit" className="sys-btn sys-btn--primary" disabled={busy}>
        {busy ? 'Working…' : isSignup ? 'Create account' : 'Log in'}
      </button>
    </form>
  );
}
