// Data Access Layer: the actual authorization boundary (proxy.ts only does
// a cheap optimistic redirect). Every Server Action and protected page goes
// through one of these before touching data, per the Next.js Authentication
// guide's recommended pattern (Data Access Layer + Data Transfer Objects).

import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getSessionPayload } from './session';
import { db } from './db';

export const verifySession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) {
    redirect('/login');
  }
  return { userId: session.userId, isAdmin: Boolean(session.isAdmin) };
});

// Non-redirecting variant, for pages that behave differently when logged
// out (e.g. "/") instead of always requiring auth.
export const getOptionalSession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) return null;
  return { userId: session.userId, isAdmin: Boolean(session.isAdmin) };
});

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// Explicit allow-list (a DTO, per the Next.js Authentication guide's
// recommendation) rather than destructuring passwordHash away, so it's
// obvious at a glance exactly what leaves the server.
function toSafeUser(user: (typeof db.users)[number]): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
}

export const getCurrentUser = cache(async (): Promise<SafeUser> => {
  const session = await verifySession();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) redirect('/login');
  return toSafeUser(user);
});

export const requireAdmin = cache(async () => {
  const session = await verifySession();
  if (!session.isAdmin) redirect('/dashboard');
  return session;
});
