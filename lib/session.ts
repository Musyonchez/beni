import 'server-only';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secretKey = process.env.SESSION_SECRET || 'dev-secret-change-me';
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload extends JWTPayload {
  userId: number;
  isAdmin: boolean;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ['HS256'] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: number, isAdmin: boolean): Promise<void> {
  const token = await encrypt({ userId, isAdmin });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
}
