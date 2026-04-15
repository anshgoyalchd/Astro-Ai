import api from './client';

export const listChatsRequest = () => api.get('/chat/sessions');
export const createChatRequest = (payload = {}) => api.post('/chat/sessions', payload);
export const getChatRequest = (chatId) => api.get(`/chat/sessions/${chatId}`);
export const sendMessageRequest = (chatId, message) => api.post(`/chat/sessions/${chatId}/message`, { message });
export const deleteChatRequest = (chatId) => api.delete(`/chat/sessions/${chatId}`);
export const downloadReportRequest = (chatId) => api.get(`/chat/sessions/${chatId}/report-pdf`, { responseType: 'blob' });
