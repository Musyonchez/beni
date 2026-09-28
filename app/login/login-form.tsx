'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="mt-4 space-y-3">
      <label className="block text-sm font-medium text-slate-600">
        Email
        <input type="email" name="email" required className="field-input" />
      </label>
      <label className="block text-sm font-medium text-slate-600">
        Password
        <input type="password" name="password" required className="field-input" />
      </label>
      {state?.error && <p className="banner-error">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
