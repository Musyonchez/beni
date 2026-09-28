'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';

const BASE_TABS = [
  { href: '/dashboard', label: 'Find a Tutor' },
  { href: '/dashboard/tutor', label: 'Become a Tutor' },
  { href: '/dashboard/requests', label: 'Request Help' },
  { href: '/dashboard/sessions', label: 'My Sessions' },
] as const;

export function TopNav({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = isAdmin ? [...BASE_TABS, { href: '/dashboard/admin', label: 'Admin' }] : BASE_TABS;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <h1 className="text-base font-semibold text-slate-900">Peer Tutoring & Study Group Matcher</h1>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            {name}
            {isAdmin ? ' (admin)' : ''}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex max-w-4xl flex-wrap gap-2 px-4 pb-3">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              pathname === tab.href
                ? 'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white'
                : 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50'
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
