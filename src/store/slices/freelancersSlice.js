import { createSlice } from "@reduxjs/toolkit";

const freelancersSlice = createSlice({
  name: "freelancers",
  initialState: { items: [], total: 0, loading: false, error: null },
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess(state, action) {
      state.loading = false;
      state.items = action.payload.freelancers;
      state.total = action.payload.total;
    },
    fetchFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearFreelancers(state) {
      state.items = [];
      state.total = 0;
      state.error = null;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, clearFreelancers } =
  freelancersSlice.actions;
export default freelancersSlice.reducer;
