import client from './client';

export const initiatePayment = (orderId: string) =>
  client.post<{ message: string; checkoutRequestId: string }>('/payments/initiate', { orderId });
