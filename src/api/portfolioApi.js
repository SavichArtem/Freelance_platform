import axiosInstance from './axiosConfig';

export const portfolioApi = {
  add: (data) => axiosInstance.post('/portfolio', data),
  update: (id, data) => axiosInstance.put(`/portfolio/${id}`, data),
  delete: (id) => axiosInstance.delete(`/portfolio/${id}`),
};