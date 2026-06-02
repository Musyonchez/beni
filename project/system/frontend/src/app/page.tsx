'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role === 'farmer') router.replace('/farmer');
    else if (user.role === 'admin') router.replace('/admin');
    else router.replace('/browse');
  }, [user, loading, router]);

  return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>;
}
