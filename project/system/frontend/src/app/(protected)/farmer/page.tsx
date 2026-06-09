'use client';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const COMING_SOON = [
  { icon: '🌿', title: 'My Listings', desc: 'Create and manage your product listings. Set prices, quantities, and availability.' },
  { icon: '📦', title: 'Incoming Orders', desc: 'View and manage orders from buyers. Confirm, mark ready, or update delivery status.' },
  { icon: '💰', title: 'Earnings', desc: 'Track your sales history and total revenue across all completed orders.' },
];

export default function FarmerPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'F'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name ?? 'Farmer'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Farmer Dashboard · {user?.email}</p>
          </div>
        </div>

        {/* Coming soon cards */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Dashboard Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COMING_SOON.map(s => (
            <div key={s.title} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
              <span className="text-3xl">{s.icon}</span>
              <h3 className="font-semibold text-gray-800">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              <span className="mt-auto inline-block text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full w-fit">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
