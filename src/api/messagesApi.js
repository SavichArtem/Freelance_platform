import axiosInstance from './axiosConfig';

export const messagesApi = {
  getChats: () => axiosInstance.get('/messages/chats'),
  getUserMessages: (userId) => axiosInstance.get(`/messages/user/${userId}`),
  getOrderMessages: (orderId) => axiosInstance.get(`/messages/order/${orderId}`),
  sendToUser: (userId, data) => axiosInstance.post(`/messages/user/${userId}`, data),
  sendToOrder: (orderId, data) => axiosInstance.post(`/messages/order/${orderId}`, data),
};