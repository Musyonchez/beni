import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../api/orders';

export default function CartScreen({ navigation }: any) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Required', 'Please enter a delivery address');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Empty cart', 'Add items before placing an order');
      return;
    }

    const farmerIds = [...new Set(items.map((i) => i.farmerId))];
    if (farmerIds.length > 1) {
      Alert.alert(
        'Mixed farmers',
        'All items must be from the same farmer. Please clear your cart and shop from one farmer at a time.'
      );
      return;
    }

    setPlacing(true);
    try {
      await placeOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
        notes: notes.trim() || undefined,
      });
      clearCart();
      Alert.alert('Order placed!', 'Your order has been sent to the farmer.', [
        { text: 'View Orders', onPress: () => navigation.navigate('OrdersTab') },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Browse products and tap "Add to Cart"</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.price}>KES {item.price}/{item.unit}</Text>
            </View>
            <View style={styles.qty}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  item.quantity > 1
                    ? updateQuantity(item.productId, item.quantity - 1)
                    : removeItem(item.productId)
                }
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtotal}>KES {item.price * item.quantity}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>KES {total}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Delivery address *"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Notes to farmer (optional)"
              value={notes}
              onChangeText={setNotes}
            />
            <TouchableOpacity
              style={[styles.orderBtn, placing && styles.orderBtnDisabled]}
              onPress={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.orderBtnText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#555' },
  emptySubtext: { marginTop: 8, color: '#999' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#222' },
  price: { fontSize: 12, color: '#888', marginTop: 2 },
  qty: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 18, color: '#2E7D32', lineHeight: 22 },
  qtyNum: { marginHorizontal: 8, fontSize: 15, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  subtotal: { fontSize: 14, fontWeight: '700', color: '#2E7D32', minWidth: 70, textAlign: 'right' },
  separator: { height: 1, backgroundColor: '#eee' },
  footer: { padding: 16 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  orderBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
