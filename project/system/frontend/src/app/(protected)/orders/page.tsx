'use client';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { cancelOrder, getMyOrders, Order } from '@/api/orders';
import { initiatePayment } from '@/api/payments';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  ready: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payMsg, setPayMsg] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

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
    try {
      await cancelOrder(id);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
    } catch (e: any) {
      setPayMsg(prev => ({ ...prev, [id]: { ok: false, text: e?.response?.data?.message ?? 'Failed to cancel' } }));
    } finally {
      setConfirmCancel(null);
    }
  };

  const handlePay = async (id: string) => {
    setPayingId(id);
    setPayMsg(prev => { const n = { ...prev }; delete n[id]; return n; });
    try {
      const res = await initiatePayment(id);
      setPayMsg(prev => ({ ...prev, [id]: { ok: true, text: res.data.message ?? 'STK push sent to your phone' } }));
    } catch (e: any) {
      setPayMsg(prev => ({ ...prev, [id]: { ok: false, text: e?.response?.data?.message ?? 'Payment failed' } }));
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
          {orders.length > 0 && <span className="text-sm text-gray-400">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>}
        </div>

        {loading && <div className="flex justify-center py-20"><Spinner /></div>}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-center justify-between">
            {error}
            <button onClick={fetchOrders} className="ml-2 underline font-medium">Retry</button>
          </div>
        )}

        {!loading && orders.length === 0 && !error && (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <span className="text-5xl mb-3">📦</span>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Place an order from your cart to see it here</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const farmer = typeof order.farmer === 'object' ? order.farmer : null;
            const msg = payMsg[order._id];
            return (
              <div key={order._id} className="bg-white rounded-xl shadow p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800 text-sm">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {farmer && <p className="text-xs text-gray-400 mb-0.5">Farmer: {farmer.name} · {farmer.phone}</p>}
                <p className="text-xs text-gray-400 mb-3">{timeAgo(order.createdAt)}</p>

                {/* Items */}
                <div className="divide-y border rounded-lg mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-gray-700">{item.title} × {item.quantity} {item.unit}</span>
                      <span className="text-gray-500">KES {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Inline pay/cancel message */}
                {msg && (
                  <p className={`text-sm mb-2 font-medium ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {msg.ok ? '✓ ' : '✕ '}{msg.text}
                  </p>
                )}

                {/* Footer: total + actions */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-green-700">Total: KES {order.total}</span>
                  <div className="flex items-center gap-3 flex-wrap">
                    {order.paymentStatus === 'paid' && (
                      <span className="text-green-600 text-sm font-semibold">✓ Paid</span>
                    )}
                    {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
                      <button onClick={() => handlePay(order._id)} disabled={payingId === order._id}
                        className="px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 disabled:opacity-60">
                        {payingId === order._id ? 'Sending...' : 'Pay via M-Pesa'}
                      </button>
                    )}

                    {/* Inline cancel confirm */}
                    {order.status === 'pending' && confirmCancel !== order._id && (
                      <button onClick={() => setConfirmCancel(order._id)} className="text-red-500 text-xs font-medium hover:underline">
                        Cancel
                      </button>
                    )}
                    {confirmCancel === order._id && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">Cancel order?</span>
                        <button onClick={() => handleCancel(order._id)} className="text-red-600 font-semibold hover:underline">Yes</button>
                        <button onClick={() => setConfirmCancel(null)} className="text-gray-400 hover:underline">No</button>
                      </div>
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
