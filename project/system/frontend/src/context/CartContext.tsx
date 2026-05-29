import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  productId: string;
  farmerId: string;
  title: string;
  price: number;
  unit: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('cart').then((stored) => {
      if (stored) setItems(JSON.parse(stored));
    });
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    AsyncStorage.setItem('cart', JSON.stringify(next));
  };

  const addItem = (item: CartItem) => {
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      persist(
        items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      persist([...items, item]);
    }
  };

  const removeItem = (productId: string) => {
    persist(items.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    persist(items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  };

  const clearCart = () => persist([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
