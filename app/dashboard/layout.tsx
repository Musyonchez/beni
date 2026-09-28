import type { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/dal';
import { TopNav } from '@/components/top-nav';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <TopNav name={user.name} isAdmin={user.isAdmin} />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
