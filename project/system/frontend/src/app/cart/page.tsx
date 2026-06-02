'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/api/orders';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { setError('Delivery address is required'); return; }
    const farmerIds = [...new Set(items.map(i => i.farmerId))];
    if (farmerIds.length > 1) { setError('All items must be from the same farmer. Clear cart and shop from one farmer.'); return; }
    setPlacing(true);
    setError('');
    try {
      await placeOrder({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })), deliveryAddress: address, notes: notes || undefined });
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
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm mt-1">Browse products and add items to your cart</p>
        <button onClick={() => router.push('/browse')} className="mt-4 px-6 py-2 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-800">Browse Products</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Your Cart</h1>
        <div className="bg-white rounded-xl shadow divide-y mb-4">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{item.title}</p>
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
              <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between mb-4 pb-3 border-b">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-green-700 text-lg">KES {total}</span>
          </div>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <form onSubmit={handleOrder} className="flex flex-col gap-3">
            <textarea placeholder="Delivery address *" required value={address} onChange={e => setAddress(e.target.value)}
              className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none h-20" />
            <input type="text" placeholder="Notes to farmer (optional)" value={notes} onChange={e => setNotes(e.target.value)}
              className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            <button type="submit" disabled={placing}
              className="bg-green-700 text-white rounded-lg py-3 font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors">
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
