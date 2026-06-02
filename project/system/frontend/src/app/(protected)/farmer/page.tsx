'use client';
import Navbar from '@/components/Navbar';

export default function FarmerPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-lg font-semibold">Farmer Dashboard</p>
        <p className="text-sm mt-1">Coming soon — product management and order handling</p>
      </div>
    </div>
  );
}
