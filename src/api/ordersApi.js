import axiosInstance from './axiosConfig';

export const ordersApi = {
  getAll: (params) => axiosInstance.get('/orders', { params }),
  getById: (id) => axiosInstance.get(`/orders/${id}`),
  complete: (id) => axiosInstance.put(`/orders/${id}/complete`),
  returnMoney: (id) => axiosInstance.put(`/orders/${id}/return`),
  openDispute: (id, data) => axiosInstance.put(`/orders/${id}/dispute`, data),
};