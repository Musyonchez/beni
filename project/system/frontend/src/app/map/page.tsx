'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getNearbyProducts, Product } from '@/api/products';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function MapPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        getNearbyProducts({ lat, lng, radius: 20000 })
          .then(res => setProducts(res.data))
          .catch(() => setError('Failed to load nearby products'));
      },
      () => setError('Location access denied. Please allow location in your browser.')
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm shadow">{error}</div>}
        {!coords && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/70">
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Getting your location...</p>
            </div>
          </div>
        )}
        {coords && <MapView center={coords} products={products} onSelect={setSelected} />}
        {selected && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg p-4 w-72">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{selected.title}</p>
                <p className="text-sm text-gray-400">{selected.locationName}</p>
                <p className="text-green-700 font-bold mt-1">KES {selected.price}/{selected.unit}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-lg">✕</button>
            </div>
            <Link href={`/products/${selected._id}`}
              className="mt-3 block text-center bg-green-700 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-800">
              View Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
