import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockFreelancers } from '../mockData';

export const fetchFreelancerById = createAsyncThunk(
  'freelancer/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const freelancer = mockFreelancers.find(f => f.id === Number(id));
          if (freelancer) {
            resolve(freelancer);
          } else {
            reject(new Error('Фрилансер не найден'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue('Ошибка загрузки профиля фрилансера');
    }
  }
);

const freelancerSlice = createSlice({
  name: 'freelancer',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearFreelancer: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreelancerById.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchFreelancerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFreelancer } = freelancerSlice.actions;
export default freelancerSlice.reducer;