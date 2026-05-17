import { createSlice } from "@reduxjs/toolkit";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    currentOrder: null,
    total: 0,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    fetchOrdersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess(state, action) {
      state.loading = false;
      state.items = action.payload.orders;
      state.total = action.payload.total;
    },
    fetchOrdersFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchOrderByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOrderByIdSuccess(state, action) {
      state.loading = false;
      state.currentOrder = action.payload;
    },
    fetchOrderByIdFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    completeOrderSuccess(state, action) {
      state.message = action.payload.message;
      if (state.currentOrder) state.currentOrder.status = "completed";
    },
    completeOrderFailure(state, action) {
      state.error = action.payload;
    },
    returnMoneySuccess(state, action) {
      state.message = action.payload.message;
      if (state.currentOrder) state.currentOrder.status = "returned";
    },
    returnMoneyFailure(state, action) {
      state.error = action.payload;
    },
    openDisputeSuccess(state, action) {
      state.message = action.payload.message;
      if (state.currentOrder) state.currentOrder.status = "dispute";
    },
    openDisputeFailure(state, action) {
      state.error = action.payload;
    },
    clearOrders(state) {
      state.items = [];
      state.total = 0;
      state.error = null;
    },
    clearCurrentOrder(state) {
      state.currentOrder = null;
      state.error = null;
    },
    clearMessage(state) {
      state.message = null;
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderByIdStart,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  completeOrderSuccess,
  completeOrderFailure,
  returnMoneySuccess,
  returnMoneyFailure,
  openDisputeSuccess,
  openDisputeFailure,
  clearOrders,
  clearCurrentOrder,
  clearMessage,
} = ordersSlice.actions;
export default ordersSlice.reducer;
