'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { getProduct, Product } from '@/api/products';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const CATEGORY_ICON: Record<string, string> = {
  vegetables: '🥦', fruits: '🍎', grains: '🌾', livestock: '🐄', inputs: '🌱',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(id).then(res => setProduct(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!user) { router.push('/login'); return; }
    if (!product) return;
    addItem({
      productId: product._id,
      farmerId: typeof product.farmer === 'object' ? product.farmer._id : product.farmer as any,
      title: product.title,
      category: product.category,
      price: product.price,
      unit: product.unit,
      quantity,
      maxQuantity: product.quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-center py-20"><Spinner /></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center py-20 text-gray-400">
        <span className="text-5xl mb-3">😕</span>
        <p className="font-medium">Product not found</p>
        <button onClick={() => router.push('/browse')} className="mt-3 text-sm text-green-700 hover:underline">Back to Browse</button>
      </div>
    </div>
  );

  const farmer = typeof product.farmer === 'object' ? product.farmer : null;
  const images = product.images?.length ? product.images : [];
  const isLowStock = product.quantity > 0 && product.quantity < 5;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.back()} className="text-green-700 text-sm hover:underline">← Back</button>
          <a href="/browse" className="text-sm text-gray-400 hover:text-green-700 hover:underline">Browse all products</a>
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">

          {/* Image gallery */}
          {images.length > 0 ? (
            <div>
              <img src={images[selectedImage]} alt={product.title} className="w-full h-64 object-cover" />
              {images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-green-700' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-green-50 flex items-center justify-center text-7xl">
              {CATEGORY_ICON[product.category] ?? '🌿'}
            </div>
          )}

          <div className="p-6">
            {/* Title + price */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-gray-800">{product.title}</h1>
              <span className="text-green-700 font-bold text-lg shrink-0">KES {product.price.toLocaleString()}/{product.unit}</span>
            </div>

            {/* Location + category badge */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-gray-500 text-sm">{product.locationName}</span>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                {CATEGORY_ICON[product.category]} {product.category}
              </span>
            </div>

            <p className="text-gray-600 mt-4 text-sm leading-relaxed">{product.description}</p>

            {/* Stock indicator */}
            <p className={`text-sm mt-2 font-medium ${isLowStock ? 'text-orange-500' : 'text-gray-400'}`}>
              {isLowStock ? `⚠ Only ${product.quantity} ${product.unit} left` : `${product.quantity} ${product.unit} available`}
            </p>

            {/* Farmer card */}
            {farmer && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm shrink-0">
                  {farmer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{farmer.name}</p>
                  <p className="text-sm text-gray-500">{farmer.phone}</p>
                  {farmer.isVerified && <span className="text-xs text-green-600 font-medium">✓ Verified Farmer</span>}
                </div>
              </div>
            )}

            {/* Quantity + add to cart */}
            <div className="mt-6 flex items-center gap-4">
              {product.quantity > 0 ? (
                <>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-lg text-green-700 hover:bg-green-50">−</button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                      className="px-3 py-2 text-lg text-green-700 hover:bg-green-50">+</button>
                  </div>
                  <button onClick={handleAdd}
                    className={`flex-1 py-2.5 rounded-lg font-semibold text-white transition-colors ${added ? 'bg-green-500' : 'bg-green-700 hover:bg-green-800'}`}>
                    {added ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                </>
              ) : (
                <div className="flex-1 py-2.5 rounded-lg font-semibold text-center bg-gray-100 text-gray-400 cursor-not-allowed">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
