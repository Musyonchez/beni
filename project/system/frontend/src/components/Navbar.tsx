'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const link = (href: string, label: string) => (
    <Link href={href} onClick={close}
      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${path === href ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-800'}`}>
      {label}
    </Link>
  );

  const navLinks = (
    <>
      {user?.role === 'buyer' && (
        <>
          {link('/browse', 'Browse')}
          {link('/map', 'Nearby')}
          <Link href="/cart" onClick={close}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors relative ${path === '/cart' ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-800'}`}>
            Cart
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{items.length}</span>
            )}
          </Link>
          {link('/orders', 'Orders')}
        </>
      )}
      {user?.role === 'farmer' && (
        <>
          {link('/browse', 'Browse')}
          {link('/farmer', 'Dashboard')}
        </>
      )}
      {user && link('/account', 'Account')}
      {user ? (
        <button onClick={() => { logout(); close(); }}
          className="px-3 py-2 rounded text-sm font-medium text-green-100 hover:bg-green-800 transition-colors text-left">
          Logout
        </button>
      ) : (
        <>
          {link('/browse', 'Browse')}
          {link('/login', 'Login')}
          {link('/register', 'Register')}
        </>
      )}
    </>
  );

  return (
    <nav className="bg-green-700 text-white px-4 py-3 shadow relative">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">🌿 FarmLink</Link>
        <div className="hidden sm:flex items-center gap-1">
          {navLinks}
        </div>
        <button className="sm:hidden text-green-100 hover:bg-green-800 rounded p-2 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>
      </div>
      {open && (
        <div className="sm:hidden flex flex-col gap-1 pt-2 pb-1">
          {navLinks}
        </div>
      )}
    </nav>
  );
}
