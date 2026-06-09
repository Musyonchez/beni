'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { getNearbyProducts, Product } from '@/api/products';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function MapPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        getNearbyProducts({ lat, lng, radius: 20 })
          .then(res => setProducts(res.data))
          .catch(() => setError('Failed to load nearby products.'));
      },
      () => setError('Location access denied. Please allow location in your browser.')
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">

        {/* Error banner */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm shadow-lg flex flex-col items-center gap-2 max-w-sm text-center">
            <span>⚠ {error}</span>
            <Link href="/browse" className="text-green-700 font-medium hover:underline text-xs">Browse all products instead →</Link>
          </div>
        )}

        {/* Loading overlay */}
        {!coords && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/70">
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Spinner />
              <p className="text-sm">Getting your location...</p>
            </div>
          </div>
        )}

        {/* Product count badge */}
        {coords && products.length > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow border">
            📍 {products.length} listing{products.length !== 1 ? 's' : ''} nearby
          </div>
        )}

        {coords && <MapView center={coords} products={products} onSelect={setSelected} />}

        {/* Selected product popup */}
        {selected && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg overflow-hidden w-72">
            {selected.images?.[0] && (
              <img src={selected.images[0]} alt={selected.title} className="w-full h-28 object-cover" />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{selected.title}</p>
                  <p className="text-sm text-gray-400">{selected.locationName}</p>
                  <p className="text-green-700 font-bold mt-1">KES {selected.price.toLocaleString()}/{selected.unit}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">✕</button>
              </div>
              <Link href={`/products/${selected._id}`}
                className="mt-3 block text-center bg-green-700 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-800">
                View Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
