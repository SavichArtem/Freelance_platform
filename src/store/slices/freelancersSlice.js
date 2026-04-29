import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { freelancersApi } from '../../api/freelancersApi';

export const fetchFreelancersByCategory = createAsyncThunk(
  'freelancers/fetchByCategory',
  async ({ categoryId, params }, { rejectWithValue }) => {
    try {
      const response = await freelancersApi.getByCategory(categoryId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки фрилансеров');
    }
  }
);

export const searchFreelancers = createAsyncThunk(
  'freelancers/search',
  async (params, { rejectWithValue }) => {
    try {
      const response = await freelancersApi.search(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка поиска');
    }
  }
);

const freelancersSlice = createSlice({
  name: 'freelancers',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearFreelancers: (state) => {
      state.items = [];
      state.total = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancersByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreelancersByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.freelancers;
        state.total = action.payload.total;
      })
      .addCase(fetchFreelancersByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchFreelancers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFreelancers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.freelancers;
        state.total = action.payload.total;
      })
      .addCase(searchFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFreelancers } = freelancersSlice.actions;
export default freelancersSlice.reducer;