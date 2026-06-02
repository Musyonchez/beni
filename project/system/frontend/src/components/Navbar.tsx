'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const path = usePathname();

  const link = (href: string, label: string) => (
    <Link href={href} className={`px-3 py-2 rounded text-sm font-medium transition-colors ${path === href ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-800'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="bg-green-700 text-white px-4 py-3 flex items-center justify-between shadow">
      <Link href="/" className="font-bold text-lg tracking-tight">🌿 FarmLink</Link>
      <div className="flex items-center gap-1">
        {user?.role === 'buyer' && (
          <>
            {link('/browse', 'Browse')}
            {link('/map', 'Nearby')}
            <Link href="/cart" className={`px-3 py-2 rounded text-sm font-medium transition-colors relative ${path === '/cart' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-800'}`}>
              Cart
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{items.length}</span>
              )}
            </Link>
            {link('/orders', 'Orders')}
          </>
        )}
        {user?.role === 'farmer' && link('/farmer', 'Dashboard')}
        {user ? (
          <button onClick={logout} className="ml-2 px-3 py-2 rounded text-sm font-medium text-green-100 hover:bg-green-800 transition-colors">
            Logout
          </button>
        ) : (
          <>
            {link('/browse', 'Browse')}
            {link('/login', 'Login')}
            {link('/register', 'Register')}
          </>
        )}
      </div>
    </nav>
  );
}
