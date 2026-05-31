import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { getNearbyProducts, Product } from '../../api/products';

export default function MapViewScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to show nearby farmers.');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      setRegion({ latitude, longitude, latitudeDelta: 0.15, longitudeDelta: 0.15 });

      try {
        const res = await getNearbyProducts(latitude, longitude, 10);
        setProducts(res.data);
      } catch {
        Alert.alert('Error', 'Could not load nearby listings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Finding nearby farmers…</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Location not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {products.map(product => (
          <Marker
            key={product._id}
            coordinate={{
              latitude: product.location.coordinates[1],
              longitude: product.location.coordinates[0],
            }}
            title={product.title}
            description={`KES ${product.price}/${product.unit} · ${product.farmer?.name}`}
            pinColor="#2E7D32"
            onPress={() => setSelected(product)}
          />
        ))}
      </MapView>

      {/* Count badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{products.length} listing{products.length !== 1 ? 's' : ''} nearby</Text>
      </View>

      {/* Selected product card */}
      {selected && (
        <View style={styles.previewCard}>
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={1}>{selected.title}</Text>
            <Text style={styles.previewSub}>{selected.locationName} · KES {selected.price}/{selected.unit}</Text>
            <Text style={styles.previewFarmer}>{selected.farmer?.name}</Text>
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => navigation.navigate('ProductDetail', { id: selected._id })}
            >
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666' },
  badge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  previewCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  previewInfo: { flex: 1 },
  previewTitle: { fontWeight: '700', fontSize: 15, color: '#222' },
  previewSub: { fontSize: 12, color: '#666', marginTop: 2 },
  previewFarmer: { fontSize: 12, color: '#2E7D32', marginTop: 2 },
  previewActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewBtn: { backgroundColor: '#2E7D32', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  viewBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  closeBtn: { padding: 6 },
  closeBtnText: { color: '#999', fontSize: 16 },
});
