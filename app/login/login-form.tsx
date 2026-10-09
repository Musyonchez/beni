'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/app/actions/auth';

// Mirrors the accounts created by scripts/seed.mjs.
const DEMO_PASSWORD = 'Demo1234!';
const DEMO_ACCOUNTS = [
  { email: 'admin@demo.test', label: 'Demo Admin (admin)' },
  { email: 'amina@demo.test', label: 'Amina Wanjiru (tutor)' },
  { email: 'brian@demo.test', label: 'Brian Otieno (tutor)' },
  { email: 'carol@demo.test', label: 'Carol Njeri (tutor + tutee)' },
  { email: 'david@demo.test', label: 'David Kimani (tutor + tutee)' },
  { email: 'esther@demo.test', label: 'Esther Achieng (tutee)' },
];

export function LoginForm({ showDemoAccounts = false }: { showDemoAccounts?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function pickDemo(value: string) {
    setEmail(value);
    setPassword(value ? DEMO_PASSWORD : '');
  }

  return (
    <form action={action} className="mt-4 space-y-3">
      {showDemoAccounts && (
        <details className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">Demo accounts</summary>
          <p className="mt-2 text-slate-500">
            Password for all: <code className="font-mono text-slate-700">{DEMO_PASSWORD}</code>
          </p>
          <select
            className="field-input"
            value={DEMO_ACCOUNTS.some((a) => a.email === email) ? email : ''}
            onChange={(e) => pickDemo(e.target.value)}
          >
            <option value="">Pick an account to fill the form…</option>
            {DEMO_ACCOUNTS.map((a) => (
              <option key={a.email} value={a.email}>
                {a.label} — {a.email}
              </option>
            ))}
          </select>
        </details>
      )}
      <label className="block text-sm font-medium text-slate-600">
        Email
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
        />
      </label>
      <label className="block text-sm font-medium text-slate-600">
        Password
        <input
          type="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
        />
      </label>
      {state?.error && <p className="banner-error">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
