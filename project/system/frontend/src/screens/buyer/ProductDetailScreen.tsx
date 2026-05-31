import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getProduct, Product } from '../../api/products';
import { useCart } from '../../context/CartContext';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getProduct(id)
      .then(res => setProduct(res.data))
      .catch(() => Alert.alert('Error', 'Could not load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      farmerId: product.farmer._id,
      title: product.title,
      price: product.price,
      unit: product.unit,
      quantity,
    });
    Alert.alert('Added to cart', `${quantity} ${product.unit} of ${product.title} added.`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Image */}
      {product.images?.[0] ? (
        <Image source={{ uri: product.images[0] }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Title & price */}
        <View style={styles.row}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>KES {product.price}/{product.unit}</Text>
        </View>

        <Text style={styles.location}>📍 {product.locationName}</Text>

        {/* Availability */}
        <View style={[styles.badge, { backgroundColor: product.isAvailable ? '#e8f5e9' : '#fce4ec' }]}>
          <Text style={{ color: product.isAvailable ? '#2E7D32' : '#c62828', fontSize: 12 }}>
            {product.isAvailable ? `In stock — ${product.quantity} ${product.unit} available` : 'Out of stock'}
          </Text>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        {/* Farmer card */}
        <TouchableOpacity
          style={styles.farmerCard}
          onPress={() => navigation.navigate('FarmerProfile', { id: product.farmer._id })}
        >
          {product.farmer.profilePhoto ? (
            <Image source={{ uri: product.farmer.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{product.farmer.name[0]}</Text>
            </View>
          )}
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>
              {product.farmer.name}
              {product.farmer.isVerified && <Text style={styles.verified}> ✓</Text>}
            </Text>
            {product.farmer.avgRating > 0 && (
              <Text style={styles.rating}>
                ★ {product.farmer.avgRating.toFixed(1)} ({product.farmer.reviewCount} reviews)
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Quantity selector */}
        {product.isAvailable && (
          <>
            <Text style={styles.label}>Quantity ({product.unit})</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(q => Math.min(product.quantity, q + 1))}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtotal}>
              Subtotal: KES {(product.price * quantity).toLocaleString()}
            </Text>

            <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 240 },
  imagePlaceholder: { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#999' },
  body: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', color: '#222', flex: 1, marginRight: 8 },
  price: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  location: { fontSize: 13, color: '#888', marginBottom: 10 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  description: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 16 },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { backgroundColor: '#c8e6c9', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  farmerInfo: { flex: 1, marginLeft: 10 },
  farmerName: { fontSize: 15, fontWeight: '600', color: '#222' },
  verified: { color: '#2E7D32' },
  rating: { fontSize: 12, color: '#f5a623', marginTop: 2 },
  chevron: { fontSize: 22, color: '#ccc' },
  label: { fontSize: 14, color: '#444', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 20, color: '#2E7D32', lineHeight: 22 },
  qtyValue: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, minWidth: 32, textAlign: 'center' },
  subtotal: { fontSize: 15, color: '#444', marginBottom: 16 },
  addBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
