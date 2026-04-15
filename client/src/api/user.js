import api from './client';

export const getProfileRequest = () => api.get('/user/profile');
export const updateAstrologyDataRequest = (payload) => api.put('/user/astrology-data', payload);
