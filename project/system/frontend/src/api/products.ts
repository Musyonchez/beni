import client from './client';

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  images: string[];
  locationName: string;
  location: { type: string; coordinates: [number, number] };
  isAvailable: boolean;
  farmer: { _id: string; name: string; phone: string; isVerified?: boolean; avgRating?: number };
}

export const getProducts = (params?: Record<string, any>) =>
  client.get<{ products: Product[]; total: number; pages: number }>('/products', { params });

export const getNearbyProducts = (params: { lng: number; lat: number; radius?: number }) =>
  client.get<Product[]>('/products/nearby', { params });

export const getProduct = (id: string) => client.get<Product>(`/products/${id}`);

export const getMyProducts = () => client.get<Product[]>('/products/my');

export const createProduct = (data: Partial<Product>) => client.post<Product>('/products', data);

export const updateProduct = (id: string, data: Partial<Product>) =>
  client.put<Product>(`/products/${id}`, data);

export const deleteProduct = (id: string) => client.delete(`/products/${id}`);
