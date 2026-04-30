import axiosInstance from './axiosConfig';

export const adminApi = {
  getStats: () => axiosInstance.get('/admin/stats'),
  getUsers: (params) => axiosInstance.get('/admin/users', { params }),
  blockUser: (id) => axiosInstance.put(`/admin/users/${id}/block`),
  unblockUser: (id) => axiosInstance.put(`/admin/users/${id}/unblock`),
  getCategories: () => axiosInstance.get('/admin/categories'),
  createCategory: (data) => axiosInstance.post('/admin/categories', data),
  updateCategory: (id, data) => axiosInstance.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosInstance.delete(`/admin/categories/${id}`),
  getReviews: () => axiosInstance.get('/admin/reviews'),
  blockReview: (id) => axiosInstance.put(`/admin/reviews/${id}/block`),
  approveReview: (id) => axiosInstance.put(`/admin/reviews/${id}/approve`),
  getDisputes: () => axiosInstance.get('/admin/disputes'),
  resolveDispute: (id, data) => axiosInstance.put(`/admin/disputes/${id}/resolve`, data),
};