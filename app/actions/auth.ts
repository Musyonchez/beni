'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db, save, nextId } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';
import { LoginSchema, RegisterSchema } from '@/lib/validation';

export type AuthFormState = { error: string } | undefined;

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { name, email, password } = parsed.data;

  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { error: 'That email is already registered.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nextId('users'),
    name,
    email,
    passwordHash,
    // Bootstrap: the first account created becomes admin, so there's no
    // separate seed script needed to get an admin user.
    isAdmin: db.users.length === 0,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save();

  await createSession(user.id, user.isAdmin);
  redirect('/dashboard');
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { email, password } = parsed.data;

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { error: 'Invalid email or password.' };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: 'Invalid email or password.' };

  await createSession(user.id, user.isAdmin);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
