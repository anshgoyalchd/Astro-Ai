import api from './client';

export const loginRequest = (payload) => api.post('/auth/login', payload);
export const registerRequest = (payload) => api.post('/auth/register', payload);
export const meRequest = () => api.get('/auth/me');
export const forgotPasswordRequest = (payload) => api.post('/auth/forgot-password', payload);
export const resetPasswordRequest = (payload) => api.post('/auth/reset-password', payload);
export const verifyEmailRequest = (payload) => api.post('/auth/verify-email', payload);
export const resendVerificationRequest = () => api.post('/auth/resend-verification');
