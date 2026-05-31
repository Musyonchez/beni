import client from './client';

export interface Product {
  _id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  images: string[];
  locationName: string;
  location: { type: string; coordinates: [number, number] };
  isAvailable: boolean;
  createdAt: string;
  farmer: {
    _id: string;
    name: string;
    profilePhoto?: string;
    isVerified: boolean;
    avgRating: number;
    reviewCount?: number;
    phone?: string;
    locationName?: string;
  };
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export const getProducts = (params?: {
  category?: string;
  page?: number;
  limit?: number;
}) => client.get<ProductsResponse>('/products', { params });

export const getNearbyProducts = (lat: number, lng: number, radius = 10) =>
  client.get<Product[]>('/products/nearby', { params: { lat, lng, radius } });

export const getProduct = (id: string) =>
  client.get<Product>(`/products/${id}`);

export const getMyProducts = () =>
  client.get<Product[]>('/products/my');

export const createProduct = (data: Partial<Product>) =>
  client.post<Product>('/products', data);

export const updateProduct = (id: string, data: Partial<Product>) =>
  client.put<Product>(`/products/${id}`, data);

export const deleteProduct = (id: string) =>
  client.delete(`/products/${id}`);
