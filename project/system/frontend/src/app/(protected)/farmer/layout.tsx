import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Farmer Dashboard' };
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
