'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { getProducts, Product } from '@/api/products';

const CATEGORIES: { label: string; value: string; icon: string }[] = [
  { label: 'All', value: 'All', icon: '🛒' },
  { label: 'Vegetables', value: 'vegetables', icon: '🥦' },
  { label: 'Fruits', value: 'fruits', icon: '🍎' },
  { label: 'Grains', value: 'grains', icon: '🌾' },
  { label: 'Livestock', value: 'livestock', icon: '🐄' },
  { label: 'Inputs', value: 'inputs', icon: '🌱' },
];

const CATEGORY_ICON: Record<string, string> = {
  vegetables: '🥦', fruits: '🍎', grains: '🌾', livestock: '🐄', inputs: '🌱',
};

export default function BrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async (cat: string, p: number, replace = false) => {
    try {
      const params = { page: p, limit: 12, ...(cat !== 'All' && { category: cat }) };
      const res = await getProducts(params);
      setProducts(prev => replace ? res.data.products : [...prev, ...res.data.products]);
      setHasMore(p < res.data.pages);
      setTotal(res.data.total ?? res.data.products.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(category, 1, true);
  }, [category, fetchProducts]);

  const filtered = search.trim()
    ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Search + category chips */}
        <div className="mb-5 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:max-w-sm border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => { setSearch(''); setCategory(cat.value); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat.value ? 'bg-green-700 text-white border-green-700' : 'border-green-700 text-green-700 hover:bg-green-50'}`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <span className="text-5xl mb-3">🔍</span>
            <p className="font-medium">No products found</p>
            {search && <button onClick={() => setSearch('')} className="mt-2 text-sm text-green-700 hover:underline">Clear search</button>}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : `${total} listing${total !== 1 ? 's' : ''}`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map(p => (
                <Link key={p._id} href={`/products/${p._id}`}
                  className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden group">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200" />
                  ) : (
                    <div className="w-full h-36 bg-green-50 flex items-center justify-center text-4xl">
                      {CATEGORY_ICON[p.category] ?? '🌿'}
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{p.locationName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-green-700 font-bold text-sm">KES {p.price.toLocaleString()}/{p.unit}</p>
                      {p.quantity < 5 && p.quantity > 0 && (
                        <span className="text-xs text-orange-500 font-medium">Low stock</span>
                      )}
                    </div>
                    {p.farmer?.isVerified && <span className="text-xs text-green-600">✓ Verified</span>}
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && !search && (
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
