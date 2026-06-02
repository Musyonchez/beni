'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'farmer') router.replace('/farmer');
    else if (user?.role === 'admin') router.replace('/admin');
    else if (user?.role === 'buyer') router.replace('/browse');
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <span className="font-bold text-xl tracking-tight">🌿 FarmLink</span>
        <div className="flex gap-2">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-green-100 hover:bg-green-800 rounded transition-colors">Login</Link>
          <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-white text-green-700 rounded hover:bg-green-50 transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-green-700 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Fresh from the Farm,<br />Direct to You</h1>
        <p className="text-green-100 text-lg max-w-xl mx-auto mb-8">
          FarmLink connects Kenyan farmers directly with buyers — no middlemen, fair prices, fresh produce.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/browse" className="px-6 py-3 bg-white text-green-700 font-semibold rounded-full hover:bg-green-50 transition-colors">
            Browse Products
          </Link>
          <Link href="/register" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-green-800 transition-colors">
            Join as Farmer
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Why FarmLink?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: '🌾', title: 'Direct from Farmers', desc: 'Buy straight from verified farmers across Kenya. No middlemen, better prices for everyone.' },
            { icon: '📍', title: 'Find Nearby Produce', desc: 'Use our map to discover fresh listings close to you and support local farmers in your area.' },
            { icon: '💳', title: 'Pay via M-Pesa', desc: 'Seamless, secure payments using M-Pesa — Kenya\'s most trusted mobile money platform.' },
          ].map(f => (
            <div key={f.title} className="text-center p-6 rounded-xl bg-gray-50">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-50 py-14 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Ready to get started?</h2>
        <p className="text-gray-500 mb-6">Join thousands of farmers and buyers already using FarmLink.</p>
        <Link href="/register" className="px-8 py-3 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 border-t">
        © {new Date().getFullYear()} FarmLink · Connecting farmers and buyers in Kenya
      </footer>
    </div>
  );
}
