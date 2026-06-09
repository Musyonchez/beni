'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from './Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  role?: 'buyer' | 'farmer';
}

export default function AuthGuard({ children, role }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (role && user.role !== role) {
      router.replace(user.role === 'farmer' ? '/farmer' : '/browse');
    }
  }, [user, loading, role, router]);

  if (loading || !user || (role && user.role !== role)) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );

  return <>{children}</>;
}
