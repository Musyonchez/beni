import client from './client';

export interface OrderItem {
  product: string;
  title: string;
  price: number;
  unit: string;
  quantity: number;
}

export interface Order {
  _id: string;
  buyer: { _id: string; name: string; phone: string } | string;
  farmer: { _id: string; name: string; phone: string } | string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  notes?: string;
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
}

export const placeOrder = (data: {
  items: { productId: string; quantity: number }[];
  deliveryAddress: string;
  notes?: string;
}) => client.post<Order>('/orders', data);

export const getMyOrders = () => client.get<Order[]>('/orders/my');
export const getFarmerOrders = () => client.get<Order[]>('/orders/farmer');
export const getOrder = (id: string) => client.get<Order>(`/orders/${id}`);
export const cancelOrder = (id: string) => client.put<Order>(`/orders/${id}/cancel`);
export const updateOrderStatus = (id: string, status: string) =>
  client.put<Order>(`/orders/${id}/status`, { status });
