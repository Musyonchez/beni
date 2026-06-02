'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getProducts, Product } from '@/api/products';

const CATEGORIES = ['All', 'vegetables', 'fruits', 'grains', 'livestock', 'inputs'];

export default function BrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (cat: string, p: number, replace = false) => {
    try {
      const params = { page: p, limit: 12, ...(cat !== 'All' && { category: cat }) };
      const res = await getProducts(params);
      setProducts(prev => replace ? res.data.products : [...prev, ...res.data.products]);
      setHasMore(p < res.data.pages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(category, 1, true);
  }, [category, fetchProducts]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat ? 'bg-green-700 text-white border-green-700' : 'border-green-700 text-green-700 hover:bg-green-50'}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No listings found</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map(p => (
                <Link key={p._id} href={`/products/${p._id}`}
                  className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
                  )}
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{p.locationName}</p>
                    <p className="text-green-700 font-bold text-sm mt-1">KES {p.price}/{p.unit}</p>
                    {p.farmer?.isVerified && <span className="text-xs text-green-600">✓ Verified</span>}
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button onClick={() => { const next = page + 1; setPage(next); fetchProducts(category, next); }}
                  className="px-6 py-2 border border-green-700 text-green-700 rounded-full text-sm font-medium hover:bg-green-50 transition-colors">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
