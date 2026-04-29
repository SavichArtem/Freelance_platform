import axiosInstance from './axiosConfig';

export const freelancersApi = {
  getByCategory: (categoryId, params) => 
    axiosInstance.get(`/categories/${categoryId}/freelancers`, { params }),
  search: (params) => 
    axiosInstance.get('/freelancers/search', { params }),
  getById: (id) => 
    axiosInstance.get(`/freelancers/${id}`),
};