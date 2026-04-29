import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersApi } from '../../api/ordersApi';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки заказов');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getById(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки заказа');
    }
  }
);

export const completeOrder = createAsyncThunk(
  'orders/complete',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersApi.complete(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка подтверждения заказа');
    }
  }
);

export const returnMoney = createAsyncThunk(
  'orders/returnMoney',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersApi.returnMoney(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка возврата средств');
    }
  }
);

export const openDispute = createAsyncThunk(
  'orders/openDispute',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.openDispute(orderId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка открытия спора');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    total: 0,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.items = [];
      state.total = 0;
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.orders;
        state.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.message = action.payload.message;
        if (state.currentOrder) {
          state.currentOrder.status = 'completed';
        }
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(returnMoney.fulfilled, (state, action) => {
        state.message = action.payload.message;
        if (state.currentOrder) {
          state.currentOrder.status = 'returned';
        }
      })
      .addCase(returnMoney.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(openDispute.fulfilled, (state, action) => {
        state.message = action.payload.message;
        if (state.currentOrder) {
          state.currentOrder.status = 'dispute';
        }
      })
      .addCase(openDispute.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearOrders, clearCurrentOrder, clearMessage } = ordersSlice.actions;
export default ordersSlice.reducer;