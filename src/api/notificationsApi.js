import axiosInstance from './axiosConfig';

export const notificationsApi = {
  getAll: () => axiosInstance.get('/notifications'),
  markRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.put('/notifications/read-all'),
  deleteAll: () => axiosInstance.delete('/notifications'),
};