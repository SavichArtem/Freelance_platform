import axiosInstance from './axiosConfig';

export const reviewsApi = {
  create: (data) => axiosInstance.post('/reviews', data),
  checkOrder: (orderId) => axiosInstance.get(`/reviews/check/${orderId}`),
};