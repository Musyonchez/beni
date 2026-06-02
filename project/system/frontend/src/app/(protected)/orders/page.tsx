'use client';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { cancelOrder, getMyOrders, Order } from '@/api/orders';
import { initiatePayment } from '@/api/payments';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  ready: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setError('');
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Failed to cancel');
    }
  };

  const handlePay = async (id: string) => {
    setPayingId(id);
    try {
      const res = await initiatePayment(id);
      alert(res.data.message);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">My Orders</h1>
        {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>}
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error} <button onClick={fetchOrders} className="ml-2 underline">Retry</button></div>}
        {!loading && orders.length === 0 && !error && (
          <p className="text-center text-gray-400 py-20">No orders yet</p>
        )}
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const farmer = typeof order.farmer === 'object' ? order.farmer : null;
            return (
              <div key={order._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800 text-sm">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                {farmer && <p className="text-xs text-gray-400 mb-1">Farmer: {farmer.name} · {farmer.phone}</p>}
                <p className="text-xs text-gray-400 mb-3">{new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="divide-y border rounded-lg mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-gray-700">{item.title} × {item.quantity} {item.unit}</span>
                      <span className="text-gray-500">KES {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-700">Total: KES {order.total}</span>
                  <div className="flex items-center gap-3">
                    {order.paymentStatus === 'paid' && <span className="text-green-600 text-sm font-semibold">✓ Paid</span>}
                    {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
                      <button onClick={() => handlePay(order._id)} disabled={payingId === order._id}
                        className="px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 disabled:opacity-60">
                        {payingId === order._id ? 'Sending...' : 'Pay via M-Pesa'}
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button onClick={() => handleCancel(order._id)} className="text-red-500 text-xs font-medium hover:underline">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
