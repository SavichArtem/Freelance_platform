import { createSlice } from "@reduxjs/toolkit";

const freelancerSlice = createSlice({
  name: "freelancer",
  initialState: { profile: null, loading: false, error: null },
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess(state, action) {
      state.loading = false;
      state.profile = action.payload;
    },
    fetchFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearFreelancer(state) {
      state.profile = null;
      state.error = null;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, clearFreelancer } =
  freelancerSlice.actions;
export default freelancerSlice.reducer;
