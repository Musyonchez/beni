'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Product } from '@/api/products';

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#2E7D32;border:2px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FlyTo({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  map.setView([center.lat, center.lng], 13);
  return null;
}

interface Props {
  center: { lat: number; lng: number };
  products: Product[];
  onSelect: (p: Product) => void;
}

export default function MapView({ center, products, onSelect }: Props) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={13} className="flex-1 w-full h-[calc(100vh-56px)]">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
      <FlyTo center={center} />
      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {products.map(p => (
        <Marker key={p._id} position={[p.location.coordinates[1], p.location.coordinates[0]]}
          eventHandlers={{ click: () => onSelect(p) }}>
          <Popup>
            <strong>{p.title}</strong><br />KES {p.price.toLocaleString()}/{p.unit}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
