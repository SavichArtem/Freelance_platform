import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
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
    fetchStatsSuccess(state, action) {
      state.stats = action.payload;
    },
    fetchUsersSuccess(state, action) {
      state.users = action.payload.users;
    },
    blockUserSuccess(state, action) {
      state.message = action.payload.message;
    },
    unblockUserSuccess(state, action) {
      state.message = action.payload.message;
    },
    fetchCategoriesSuccess(state, action) {
      state.categories = action.payload.categories;
    },
    createCategorySuccess(state) {
      state.message = "Категория создана";
    },
    updateCategorySuccess(state) {
      state.message = "Категория обновлена";
    },
    deleteCategorySuccess(state) {
      state.message = "Категория удалена";
    },
    fetchReviewsSuccess(state, action) {
      state.reviews = action.payload.reviews;
    },
    blockReviewSuccess(state) {
      state.message = "Отзыв заблокирован";
    },
    approveReviewSuccess(state) {
      state.message = "Отзыв одобрен";
    },
    fetchDisputesSuccess(state, action) {
      state.disputes = action.payload.disputes;
    },
    resolveDisputeSuccess(state, action) {
      state.message = action.payload.message;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearMessage(state) {
      state.message = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchStatsSuccess,
  fetchUsersSuccess,
  blockUserSuccess,
  unblockUserSuccess,
  fetchCategoriesSuccess,
  createCategorySuccess,
  updateCategorySuccess,
  deleteCategorySuccess,
  fetchReviewsSuccess,
  blockReviewSuccess,
  approveReviewSuccess,
  fetchDisputesSuccess,
  resolveDisputeSuccess,
  setError,
  clearMessage,
  clearError,
} = adminSlice.actions;
export default adminSlice.reducer;
