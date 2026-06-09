'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

function validatePhone(phone: string) {
  return /^0[17]\d{8}$/.test(phone);
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'buyer' });
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'phone') {
      setPhoneError(value && !validatePhone(value) ? 'Use format 07XXXXXXXX (10 digits)' : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(form.phone)) { setPhoneError('Use format 07XXXXXXXX (10 digits)'); return; }
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
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">Join FarmLink as a buyer or farmer</p>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Full name" required value={form.name} onChange={set('name')}
              className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            <input type="email" placeholder="Email" required value={form.email} onChange={set('email')}
              className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            <div>
              <input type="tel" placeholder="Phone (07XXXXXXXX)" required value={form.phone} onChange={set('phone')}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${phoneError ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
            </div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={set('password')}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 pr-12" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex rounded-lg border overflow-hidden text-sm">
              {['buyer', 'farmer'].map(role => (
                <button key={role} type="button"
                  className={`flex-1 py-2.5 font-medium transition-colors ${form.role === role ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setForm(prev => ({ ...prev, role }))}>
                  {role === 'buyer' ? '🛒 Buyer' : '🌾 Farmer'}
                </button>
              ))}
            </div>
            <button type="submit" disabled={loading || !!phoneError}
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
