'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { getMyProducts, createProduct, updateProduct, deleteProduct, Product } from '@/api/products';
import { getFarmerOrders, updateOrderStatus, Order } from '@/api/orders';

type Tab = 'listings' | 'orders' | 'earnings';

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'livestock', 'inputs'];
const UNITS = ['kg', 'crate', 'bunch', 'piece', 'litre'];

const CAT_EMOJI: Record<string, string> = {
  vegetables: '🥦', fruits: '🍎', grains: '🌾', livestock: '🐄', inputs: '🌱',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  ready: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'ready',
  ready: 'delivered',
};

const NEXT_LABEL: Record<string, string> = {
  pending: 'Confirm Order',
  confirmed: 'Mark as Ready',
  ready: 'Mark Delivered',
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

const EMPTY_FORM = {
  title: '', category: 'vegetables', unit: 'kg', price: '', quantity: '',
  description: '', locationName: '', lat: '', lng: '',
};

export default function FarmerPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');

  // --- Listings ---
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodError, setProdError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // --- Orders ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [advancing, setAdvancing] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setProdLoading(true);
    setProdError('');
    try {
      const res = await getMyProducts();
      setProducts(res.data);
    } catch {
      setProdError('Failed to load listings.');
    } finally {
      setProdLoading(false);
    }
  }

  async function loadOrders() {
    if (ordersLoaded) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await getFarmerOrders();
      setOrders(res.data);
      setOrdersLoaded(true);
    } catch {
      setOrdersError('Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    if ((t === 'orders' || t === 'earnings') && !ordersLoaded) loadOrders();
  }

  // --- Form helpers ---
  const setF = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditId(p._id);
    setForm({
      title: p.title,
      category: p.category,
      unit: p.unit,
      price: String(p.price),
      quantity: String(p.quantity),
      description: p.description,
      locationName: p.locationName ?? '',
      lat: String(p.location?.coordinates?.[1] ?? ''),
      lng: String(p.location?.coordinates?.[0] ?? ''),
    });
    setFormError('');
    setShowForm(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const payload: any = {
      title: form.title.trim(),
      category: form.category,
      unit: form.unit,
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description.trim(),
      locationName: form.locationName.trim(),
    };
    if (form.lat && form.lng) {
      payload.location = { type: 'Point', coordinates: [Number(form.lng), Number(form.lat)] };
    }
    if (!payload.title || !payload.description || !payload.price || !payload.quantity) {
      setFormError('Title, description, price, and quantity are required.');
      return;
    }
    setFormSaving(true);
    try {
      if (editId) {
        const res = await updateProduct(editId, payload);
        setProducts(prev => prev.map(p => p._id === editId ? res.data : p));
      } else {
        const res = await createProduct(payload);
        setProducts(prev => [res.data, ...prev]);
      }
      setShowForm(false);
      setEditId(null);
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Save failed. Try again.');
    } finally {
      setFormSaving(false);
    }
  }

  async function toggleAvailable(p: Product) {
    const updated = { ...p, isAvailable: !p.isAvailable };
    setProducts(prev => prev.map(x => x._id === p._id ? updated : x));
    try {
      await updateProduct(p._id, { isAvailable: !p.isAvailable });
    } catch {
      setProducts(prev => prev.map(x => x._id === p._id ? p : x));
    }
  }

  async function confirmDelete(id: string) {
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch {
      setProdError('Delete failed. Try again.');
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  }

  async function advanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setAdvancing(order._id);
    try {
      const res = await updateOrderStatus(order._id, next);
      setOrders(prev => prev.map(o => o._id === order._id ? res.data : o));
    } catch {
      setOrdersError('Status update failed.');
    } finally {
      setAdvancing(null);
    }
  }

  // --- Earnings computed ---
  const delivered = orders.filter(o => o.status === 'delivered');
  const revenue = delivered.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const activeCount = orders.filter(o => o.status === 'confirmed' || o.status === 'ready').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6">
          {(['listings', 'orders', 'earnings'] as Tab[]).map(t => {
            const labels: Record<Tab, string> = { listings: '🌿 My Listings', orders: '📦 Orders', earnings: '💰 Earnings' };
            return (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: MY LISTINGS ── */}
        {tab === 'listings' && (
          <div>
            {/* Add button + form toggle */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">
                {products.length > 0 ? `${products.length} listing${products.length !== 1 ? 's' : ''}` : 'My Listings'}
              </h2>
              <button
                onClick={showForm && !editId ? () => setShowForm(false) : openAdd}
                className="bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
              >
                {showForm && !editId ? '✕ Cancel' : '+ Add Listing'}
              </button>
            </div>

            {/* Add / Edit Form */}
            {showForm && (
              <form onSubmit={submitForm} className="bg-white rounded-xl shadow p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <h3 className="sm:col-span-2 font-semibold text-gray-700 text-base">
                  {editId ? 'Edit Listing' : 'New Listing'}
                </h3>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Title *</label>
                  <input value={form.title} onChange={setF('title')} placeholder="e.g. Fresh Tomatoes"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Category</label>
                  <select value={form.category} onChange={setF('category')}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Price (KES) *</label>
                  <input type="number" min="0" value={form.price} onChange={setF('price')} placeholder="e.g. 80"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Unit</label>
                  <select value={form.unit} onChange={setF('unit')}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Quantity *</label>
                  <input type="number" min="0" value={form.quantity} onChange={setF('quantity')} placeholder="e.g. 50"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Location Name</label>
                  <input value={form.locationName} onChange={setF('locationName')} placeholder="e.g. Kiambu, Nairobi"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Latitude</label>
                  <input type="number" step="any" value={form.lat} onChange={setF('lat')} placeholder="e.g. -1.2921"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Longitude</label>
                  <input type="number" step="any" value={form.lng} onChange={setF('lng')} placeholder="e.g. 36.8219"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Description *</label>
                  <textarea value={form.description} onChange={setF('description')} rows={3} placeholder="Describe your product..."
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                </div>

                {formError && (
                  <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
                )}

                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={formSaving}
                    className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60 transition-colors">
                    {formSaving ? 'Saving…' : editId ? 'Save Changes' : 'Create Listing'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                    className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Product list */}
            {prodLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : prodError ? (
              <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{prodError}</div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">🌱</div>
                <p className="font-medium text-gray-600">No listings yet.</p>
                <p className="text-sm mt-1">Click <strong>+ Add Listing</strong> to create your first product.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {products.map(p => (
                  <div key={p._id} className="bg-white rounded-xl shadow px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-2xl shrink-0">{CAT_EMOJI[p.category] ?? '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 truncate">{p.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isAvailable ? 'Live' : 'Hidden'}
                        </span>
                        {p.quantity < 5 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">Low stock</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        KES {p.price.toLocaleString()}/{p.unit} · {p.quantity} {p.unit} left
                        {p.locationName ? ` · 📍 ${p.locationName}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleAvailable(p)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          p.isAvailable ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}>
                        {p.isAvailable ? 'Hide' : 'Go Live'}
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
                        Edit
                      </button>
                      {deleteConfirm === p._id ? (
                        <span className="flex items-center gap-1 text-xs">
                          <span className="text-gray-600">Sure?</span>
                          <button onClick={() => confirmDelete(p._id)} disabled={deleting === p._id}
                            className="text-red-600 font-semibold hover:underline disabled:opacity-60">
                            {deleting === p._id ? '…' : 'Yes'}
                          </button>
                          <span className="text-gray-400">/</span>
                          <button onClick={() => setDeleteConfirm(null)} className="text-gray-500 hover:underline">No</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p._id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-4">
              {ordersLoaded ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : 'Incoming Orders'}
            </h2>

            {ordersLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : ordersError ? (
              <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{ordersError}</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-medium text-gray-600">No orders yet.</p>
                <p className="text-sm mt-1">Orders from buyers will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map(order => {
                  const buyer = typeof order.buyer === 'object' ? order.buyer : null;
                  const nextStatus = NEXT_STATUS[order.status];
                  return (
                    <div key={order._id} className="bg-white rounded-xl shadow p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div>
                          <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? ''}`}>
                            {order.status}
                          </span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
                      </div>

                      {buyer && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{buyer.name}</span>
                          {buyer.phone && <span className="text-gray-400"> · {buyer.phone}</span>}
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mb-3">
                        <span>📍 {order.deliveryAddress}</span>
                        {order.notes && <span className="ml-2 text-gray-400">· "{order.notes}"</span>}
                      </div>

                      <div className="border-t border-gray-100 pt-3 mb-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-0.5">
                            <span className="text-gray-700">{item.title} × {item.quantity} {item.unit}</span>
                            <span className="text-gray-600 font-medium">KES {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-gray-100">
                          <span>Total</span>
                          <span>KES {order.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {nextStatus && (
                        <button
                          onClick={() => advanceStatus(order)}
                          disabled={advancing === order._id}
                          className="bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
                        >
                          {advancing === order._id ? 'Updating…' : NEXT_LABEL[order.status]}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EARNINGS ── */}
        {tab === 'earnings' && (
          <div>
            {ordersLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : ordersError ? (
              <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{ordersError}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">KES {revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{delivered.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Active</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending</p>
                  </div>
                </div>

                {delivered.length === 0 ? (
                  <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                    <div className="text-4xl mb-3">💰</div>
                    <p className="font-medium text-gray-600">No completed orders yet.</p>
                    <p className="text-sm mt-1">Revenue will appear here once orders are delivered.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700 text-sm">Completed Orders</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {delivered.map(order => {
                        const buyer = typeof order.buyer === 'object' ? order.buyer : null;
                        return (
                          <div key={order._id} className="px-5 py-3 flex items-center justify-between gap-3">
                            <div>
                              <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                              {buyer && <span className="ml-2 text-sm text-gray-700">{buyer.name}</span>}
                              <span className="ml-2 text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                              </span>
                              <span className="text-sm font-semibold text-gray-800">KES {order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
