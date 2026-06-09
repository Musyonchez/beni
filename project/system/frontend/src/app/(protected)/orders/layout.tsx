import type { Metadata } from 'next';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = { title: 'My Orders' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="buyer">{children}</AuthGuard>;
}
