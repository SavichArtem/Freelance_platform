import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/adminApi';

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.getStats();
    return response.data;
  } catch (error) {
    return rejectWithValue('Ошибка загрузки статистики');
  }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const response = await adminApi.getUsers(params);
    return response.data;
  } catch (error) {
    return rejectWithValue('Ошибка загрузки пользователей');
  }
});

export const blockUser = createAsyncThunk('admin/blockUser', async (id, { rejectWithValue }) => {
  try {
    const response = await adminApi.blockUser(id);
    return { id, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Ошибка блокировки');
  }
});

export const unblockUser = createAsyncThunk('admin/unblockUser', async (id, { rejectWithValue }) => {
  try {
    const response = await adminApi.unblockUser(id);
    return { id, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Ошибка разблокировки');
  }
});

export const fetchAdminCategories = createAsyncThunk('admin/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.getCategories();
    return response.data;
  } catch (error) {
    return rejectWithValue('Ошибка загрузки категорий');
  }
});

export const createCategory = createAsyncThunk('admin/createCategory', async (data, { rejectWithValue }) => {
  try {
    const response = await adminApi.createCategory(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Ошибка создания категории');
  }
});

export const updateCategory = createAsyncThunk('admin/updateCategory', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await adminApi.updateCategory(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Ошибка обновления категории');
  }
});

export const deleteCategory = createAsyncThunk('admin/deleteCategory', async (id, { rejectWithValue }) => {
  try {
    await adminApi.deleteCategory(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Ошибка удаления категории');
  }
});

export const fetchAdminReviews = createAsyncThunk('admin/fetchReviews', async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.getReviews();
    return response.data;
  } catch (error) {
    return rejectWithValue('Ошибка загрузки отзывов');
  }
});

export const blockReview = createAsyncThunk('admin/blockReview', async (id, { rejectWithValue }) => {
  try {
    const response = await adminApi.blockReview(id);
    return { id, message: response.data.message };
  } catch (error) {
    return rejectWithValue('Ошибка блокировки отзыва');
  }
});

export const approveReview = createAsyncThunk('admin/approveReview', async (id, { rejectWithValue }) => {
  try {
    const response = await adminApi.approveReview(id);
    return { id, message: response.data.message };
  } catch (error) {
    return rejectWithValue('Ошибка одобрения отзыва');
  }
});

export const fetchAdminDisputes = createAsyncThunk('admin/fetchDisputes', async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.getDisputes();
    return response.data;
  } catch (error) {
    return rejectWithValue('Ошибка загрузки споров');
  }
});

export const resolveDispute = createAsyncThunk('admin/resolveDispute', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await adminApi.resolveDispute(id, data);
    return { id, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Ошибка решения спора');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    categories: [],
    reviews: [],
    disputes: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
    clearAdminMessage: (state) => { state.message = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => { state.users = action.payload.users; })
      .addCase(blockUser.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload.id);
        if (user) user.status = 'blocked';
        state.message = action.payload.message;
      })
      .addCase(blockUser.rejected, (state, action) => { state.error = action.payload; })
      .addCase(unblockUser.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload.id);
        if (user) user.status = 'active';
        state.message = action.payload.message;
      })
      .addCase(unblockUser.rejected, (state, action) => { state.error = action.payload; })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => { state.categories = action.payload.categories; })
      .addCase(createCategory.fulfilled, (state) => { state.message = 'Категория создана'; })
      .addCase(createCategory.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateCategory.fulfilled, (state) => { state.message = 'Категория обновлена'; })
      .addCase(updateCategory.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deleteCategory.fulfilled, (state) => { state.message = 'Категория удалена'; })
      .addCase(deleteCategory.rejected, (state, action) => { state.error = action.payload; })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => { state.reviews = action.payload.reviews; })
      .addCase(blockReview.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r.id === action.payload.id);
        if (review) review.status = 'blocked';
        state.message = action.payload.message;
      })
      .addCase(approveReview.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r.id === action.payload.id);
        if (review) review.status = 'active';
        state.message = action.payload.message;
      })
      .addCase(fetchAdminDisputes.fulfilled, (state, action) => { state.disputes = action.payload.disputes; })
      .addCase(resolveDispute.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.disputes = state.disputes.filter(d => d.id !== action.payload.id);
      })
      .addCase(resolveDispute.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearAdminError, clearAdminMessage } = adminSlice.actions;
export default adminSlice.reducer;