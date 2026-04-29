import axiosInstance from './axiosConfig';

export const categoriesApi = {
  getAll: () => axiosInstance.get('/categories'),
  getById: (id) => axiosInstance.get(`/categories/${id}`),
  getWithFreelancers: (id, params) => axiosInstance.get(`/categories/${id}/freelancers`, { params }),
};