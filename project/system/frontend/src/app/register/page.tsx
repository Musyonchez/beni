'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'buyer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center py-16">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-green-700 mb-1">FarmLink</h1>
        <p className="text-gray-500 text-sm mb-6">Create your account</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Full name" required value={form.name} onChange={set('name')}
            className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
          <input type="email" placeholder="Email" required value={form.email} onChange={set('email')}
            className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
          <input type="tel" placeholder="Phone (07XXXXXXXX)" required value={form.phone} onChange={set('phone')}
            className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
          <input type="password" placeholder="Password" required value={form.password} onChange={set('password')}
            className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
          <div className="flex rounded-lg border overflow-hidden text-sm">
            {['buyer', 'farmer'].map(role => (
              <button key={role} type="button"
                className={`flex-1 py-2.5 font-medium transition-colors ${form.role === role ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setForm(prev => ({ ...prev, role }))}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="bg-green-700 text-white rounded-lg py-2.5 font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          Have an account?{' '}
          <Link href="/login" className="text-green-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
