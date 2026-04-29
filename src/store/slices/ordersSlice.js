import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockOrders } from '../mockData';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async ({ userId, role, status } = {}, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = [...mockOrders];

          if (userId) {
            if (role === 'customer') {
              filtered = filtered.filter(o => o.customerId === Number(userId));
            } else if (role === 'freelancer') {
              filtered = filtered.filter(o => o.freelancerId === Number(userId));
            }
          }

          if (status && status !== 'all') {
            filtered = filtered.filter(o => o.status === status);
          }

          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          resolve({ orders: filtered, total: filtered.length });
        }, 300);
      });
    } catch (error) {
      return rejectWithValue('Ошибка загрузки заказов');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const order = mockOrders.find(o => o.id === Number(orderId));
          if (order) {
            resolve(order);
          } else {
            reject(new Error('Заказ не найден'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue('Ошибка загрузки заказа');
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
      });
  },
});

export const { clearOrders, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;