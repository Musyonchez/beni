import client from './client';

export const initiatePayment = (orderId: string) =>
  client.post<{ message: string; checkoutRequestId: string }>('/payments/initiate', { orderId });

export const getPaymentStatus = (orderId: string) =>
  client.get<{ paymentStatus: string; orderStatus: string }>(`/payments/status/${orderId}`);
