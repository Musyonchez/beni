'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/api/orders';

const CATEGORY_ICON: Record<string, string> = {
  vegetables: '🥦', fruits: '🍎', grains: '🌾', livestock: '🐄', inputs: '🌱',
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const farmerIds = [...new Set(items.map(i => i.farmerId))];
  const multipleFarmers = farmerIds.length > 1;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { setError('Delivery address is required'); return; }
    if (multipleFarmers) { setError('All items must be from the same farmer. Remove items from other farmers to continue.'); return; }
    setPlacing(true);
    setError('');
    try {
      await placeOrder({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: address,
        notes: notes || undefined,
      });
      clearCart();
      router.push('/orders');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <span className="text-6xl mb-4">🛒</span>
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm mt-1">Browse products and add items to your cart</p>
        <button onClick={() => router.push('/browse')} className="mt-5 px-6 py-2.5 bg-green-700 text-white rounded-full text-sm font-semibold hover:bg-green-800">
          Browse Products
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Your Cart</h1>
          <span className="text-sm text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Multi-farmer warning */}
        {multipleFarmers && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm">
            ⚠ Items from {farmerIds.length} different farmers — remove items until only one farmer remains to place an order.
          </div>
        )}

        <div className="bg-white rounded-xl shadow divide-y mb-4">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-3 p-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-xl shrink-0">
                {CATEGORY_ICON[item.category] ?? '🌿'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{item.title}</p>
                <p className="text-xs text-gray-400">KES {item.price}/{item.unit}</p>
              </div>
              <div className="flex items-center border rounded-lg overflow-hidden text-sm">
                <button onClick={() => item.quantity > 1 ? updateQuantity(item.productId, item.quantity - 1) : removeItem(item.productId)}
                  className="px-2.5 py-1.5 text-green-700 hover:bg-green-50">−</button>
                <span className="px-3 py-1.5 font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-2.5 py-1.5 text-green-700 hover:bg-green-50">+</button>
              </div>
              <span className="text-green-700 font-bold text-sm w-20 text-right">KES {item.price * item.quantity}</span>
              <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 text-base ml-1">✕</button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between mb-4 pb-3 border-b">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-green-700 text-lg">KES {total}</span>
          </div>
          {error && <p className="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded-lg">{error}</p>}
          <form onSubmit={handleOrder} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Delivery Address *</label>
              <textarea placeholder="e.g. Kimathi Street, Nairobi CBD" required value={address} onChange={e => setAddress(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none h-20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Notes to Farmer</label>
              <input type="text" placeholder="Optional — any special instructions" value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <button type="submit" disabled={placing || multipleFarmers}
              className="bg-green-700 text-white rounded-lg py-3 font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors mt-1">
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
