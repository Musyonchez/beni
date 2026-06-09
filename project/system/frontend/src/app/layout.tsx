import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: {
    default: 'FarmLink — Fresh from the Farm, Direct to You',
    template: '%s — FarmLink',
  },
  description: 'FarmLink connects Kenyan farmers directly with buyers. Browse fresh produce, pay via M-Pesa, and support local farmers.',
  openGraph: {
    title: 'FarmLink — Fresh from the Farm, Direct to You',
    description: 'FarmLink connects Kenyan farmers directly with buyers. Browse fresh produce, pay via M-Pesa, and support local farmers.',
    siteName: 'FarmLink',
    locale: 'en_KE',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
