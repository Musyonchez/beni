'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-6">Welcome back to FarmLink</p>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email" placeholder="Email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 pr-12"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit" disabled={loading}
              className="bg-green-700 text-white rounded-lg py-2.5 font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-500">
            No account?{' '}
            <Link href="/register" className="text-green-700 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
