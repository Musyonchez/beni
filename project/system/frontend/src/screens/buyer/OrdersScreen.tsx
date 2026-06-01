import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { cancelOrder, getMyOrders, Order } from '../../api/orders';
import { initiatePayment } from '../../api/payments';

const STATUS_COLOR: Record<string, string> = {
  pending: '#f57c00',
  confirmed: '#1565c0',
  ready: '#6a1b9a',
  delivered: '#2e7d32',
  cancelled: '#c62828',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setError(null);
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to load orders';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = (id: string) => {
    Alert.alert('Cancel order?', 'This cannot be undone.', [
      { text: 'No' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(id);
            setOrders((prev) =>
              prev.map((o) => (o._id === id ? { ...o, status: 'cancelled' } : o))
            );
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? 'Failed to cancel');
          }
        },
      },
    ]);
  };

  const handlePay = async (id: string) => {
    setPayingId(id);
    try {
      const res = await initiatePayment(id);
      Alert.alert('M-Pesa', res.data.message);
    } catch (e: any) {
      Alert.alert('Payment Error', e?.response?.data?.message ?? 'Failed to initiate payment');
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2E7D32" />;

  if (error) return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: '#c62828' }]}>{error}</Text>
      <TouchableOpacity onPress={fetchOrders} style={{ marginTop: 12 }}>
        <Text style={{ color: '#2E7D32', fontWeight: '600' }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
      contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      }
      renderItem={({ item }) => {
        const farmer = typeof item.farmer === 'object' ? item.farmer : null;
        const isPaying = payingId === item._id;
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] }]}>
                <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            {farmer && (
              <Text style={styles.meta}>Farmer: {farmer.name} · {farmer.phone}</Text>
            )}
            <Text style={styles.meta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            {item.items.map((i, idx) => (
              <Text key={idx} style={styles.itemLine}>
                {i.title} × {i.quantity} {i.unit} — KES {i.price * i.quantity}
              </Text>
            ))}
            <View style={styles.cardFooter}>
              <Text style={styles.total}>Total: KES {item.total}</Text>
              <View style={styles.actions}>
                {item.paymentStatus === 'unpaid' && item.status !== 'cancelled' && (
                  <TouchableOpacity
                    style={[styles.payBtn, isPaying && styles.btnDisabled]}
                    onPress={() => handlePay(item._id)}
                    disabled={isPaying}
                  >
                    {isPaying
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.payBtnText}>Pay via M-Pesa</Text>
                    }
                  </TouchableOpacity>
                )}
                {item.paymentStatus === 'paid' && (
                  <Text style={styles.paidBadge}>✓ Paid</Text>
                )}
                {item.status === 'pending' && (
                  <TouchableOpacity onPress={() => handleCancel(item._id)}>
                    <Text style={styles.cancelBtn}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#888', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { fontWeight: '700', fontSize: 14, color: '#222' },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 12, color: '#888', marginBottom: 4 },
  itemLine: { fontSize: 13, color: '#444', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
  total: { fontWeight: '700', fontSize: 14, color: '#2E7D32' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBtn: {
    backgroundColor: '#4caf50',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  paidBadge: { color: '#2e7d32', fontSize: 13, fontWeight: '700' },
  cancelBtn: { color: '#c62828', fontSize: 13, fontWeight: '600' },
});
