import api from './client';

export const createOrderRequest = (planType) => api.post('/payment/create-order', { planType });
export const verifyPaymentRequest = (payload) => api.post('/payment/verify', payload);
