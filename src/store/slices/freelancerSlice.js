import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { freelancersApi } from '../../api/freelancersApi';

export const fetchFreelancerById = createAsyncThunk(
  'freelancer/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await freelancersApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки профиля');
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