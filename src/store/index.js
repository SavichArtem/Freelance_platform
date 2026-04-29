import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSlice';
import freelancersReducer from './slices/freelancersSlice';
import freelancerReducer from './slices/freelancerSlice';
import filtersReducer from './slices/filtersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    freelancers: freelancersReducer,
    freelancer: freelancerReducer,
    filters: filtersReducer,
  },
});