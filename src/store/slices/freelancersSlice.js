import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockFreelancers } from '../mockData';

export const fetchFreelancersByCategory = createAsyncThunk(
  'freelancers/fetchByCategory',
  async ({ categoryId, params }, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered;
          
          if (categoryId) {
            switch (Number(categoryId)) {
              case 1: // Веб-разработка
                filtered = [mockFreelancers[0]];
                break;
              case 2: // Дизайн
                filtered = [mockFreelancers[1]];
                break;
              case 3: // Копирайтинг
                filtered = [mockFreelancers[2]];
                break;
              default:
                filtered = [];
            }
          } else {
            filtered = mockFreelancers;
          }

          // Сортировка
          if (params?.sortBy) {
            switch (params.sortBy) {
              case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
              case 'price_asc':
                filtered.sort((a, b) => a.minPrice - b.minPrice);
                break;
              case 'price_desc':
                filtered.sort((a, b) => b.minPrice - a.minPrice);
                break;
              default:
                break;
            }
          }

          resolve({ freelancers: filtered, total: filtered.length });
        }, 300);
      });
    } catch (error) {
      return rejectWithValue('Ошибка загрузки фрилансеров');
    }
  }
);

export const searchFreelancers = createAsyncThunk(
  'freelancers/search',
  async (params, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          let results = [...mockFreelancers];

          if (params?.query) {
            const query = params.query.toLowerCase();
            results = results.filter(f =>
              f.login.toLowerCase().includes(query) ||
              f.Freelancer?.description?.toLowerCase().includes(query)
            );
          }

          if (params?.sortBy) {
            switch (params.sortBy) {
              case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
              case 'price_asc':
                results.sort((a, b) => a.minPrice - b.minPrice);
                break;
              case 'price_desc':
                results.sort((a, b) => b.minPrice - a.minPrice);
                break;
              default:
                break;
            }
          }

          resolve({ freelancers: results, total: results.length });
        }, 300);
      });
    } catch (error) {
      return rejectWithValue('Ошибка поиска');
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
        state.items = action.payload.freelancers || action.payload;
        state.total = action.payload.total || action.payload.length;
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
        state.items = action.payload.freelancers || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(searchFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFreelancers } = freelancersSlice.actions;
export default freelancersSlice.reducer;