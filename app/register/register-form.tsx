'use client';

import { useActionState } from 'react';
import { registerAction } from '@/app/actions/auth';

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <form action={action} className="mt-4 space-y-3">
      <label className="block text-sm font-medium text-slate-600">
        Name
        <input type="text" name="name" required className="field-input" />
      </label>
      <label className="block text-sm font-medium text-slate-600">
        Email
        <input type="email" name="email" required className="field-input" />
      </label>
      <label className="block text-sm font-medium text-slate-600">
        Password
        <input type="password" name="password" minLength={6} required className="field-input" />
      </label>
      {state?.error && <p className="banner-error">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
