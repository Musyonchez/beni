import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getProducts, Product } from '../../api/products';

const CATEGORIES = ['All', 'vegetables', 'fruits', 'grains', 'livestock', 'inputs'];

export default function HomeFeedScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (cat: string, p: number, refresh = false) => {
    try {
      const params = { page: p, limit: 10, ...(cat !== 'All' && { category: cat }) };
      const res = await getProducts(params);
      const fetched = res.data.products;
      setProducts(prev => (p === 1 || refresh ? fetched : [...prev, ...fetched]));
      setHasMore(p < res.data.pages);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(category, 1);
  }, [category, fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts(category, 1, true);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchProducts(category, next);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { id: item._id })}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>{item.locationName}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>KES {item.price}/{item.unit}</Text>
          {item.farmer?.isVerified && <Text style={styles.verified}>✓ Verified</Text>}
        </View>
        {item.farmer?.avgRating > 0 && (
          <Text style={styles.rating}>★ {item.farmer.avgRating.toFixed(1)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && page === 1 ? (
        <ActivityIndicator style={styles.loader} size="large" color="#2E7D32" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={styles.empty}>No listings found</Text>}
          ListFooterComponent={
            hasMore && page > 1 ? <ActivityIndicator color="#2E7D32" style={{ marginVertical: 12 }} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  categories: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', maxHeight: 56 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D32',
    marginRight: 8,
    height: 32,
  },
  chipActive: { backgroundColor: '#2E7D32' },
  chipText: { color: '#2E7D32', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  loader: { flex: 1, marginTop: 40 },
  list: { padding: 8 },
  row: { justifyContent: 'space-between', paddingHorizontal: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { width: '100%', height: 110 },
  imagePlaceholder: { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#999', fontSize: 12 },
  cardBody: { padding: 8 },
  cardTitle: { fontWeight: '600', fontSize: 14, color: '#222', marginBottom: 2 },
  cardLocation: { fontSize: 11, color: '#888', marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
  verified: { fontSize: 10, color: '#2E7D32' },
  rating: { fontSize: 11, color: '#f5a623', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
});
