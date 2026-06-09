import type { Metadata } from 'next';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = { title: 'Farmer Dashboard' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="farmer">{children}</AuthGuard>;
}
