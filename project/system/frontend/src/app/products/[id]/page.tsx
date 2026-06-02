'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getProduct, Product } from '@/api/products';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(id).then(res => setProduct(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      farmerId: typeof product.farmer === 'object' ? product.farmer._id : product.farmer as any,
      title: product.title,
      price: product.price,
      unit: product.unit,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div></div>;
  if (!product) return <div className="min-h-screen"><Navbar /><p className="text-center py-20 text-gray-400">Product not found</p></div>;

  const farmer = typeof product.farmer === 'object' ? product.farmer : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="text-green-700 text-sm mb-4 hover:underline">← Back</button>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-bold text-gray-800">{product.title}</h1>
              <span className="text-green-700 font-bold text-lg">KES {product.price}/{product.unit}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{product.locationName} · {product.category}</p>
            <p className="text-gray-600 mt-4 text-sm leading-relaxed">{product.description}</p>
            <p className="text-sm text-gray-400 mt-2">{product.quantity} {product.unit} available</p>

            {farmer && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-700 text-sm">Farmer: {farmer.name}</p>
                <p className="text-sm text-gray-500">{farmer.phone}</p>
                {farmer.isVerified && <span className="text-xs text-green-600 font-medium">✓ Verified Farmer</span>}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-lg text-green-700 hover:bg-green-50">−</button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 text-lg text-green-700 hover:bg-green-50">+</button>
              </div>
              <button onClick={handleAdd}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-white transition-colors ${added ? 'bg-green-500' : 'bg-green-700 hover:bg-green-800'}`}>
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
