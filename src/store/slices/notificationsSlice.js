import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    fetchSuccess(state, action) {
      state.items = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    markAsRead(state, action) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.items.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
    deleteAllSuccess(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { fetchSuccess, markAsRead, markAllAsRead, deleteAllSuccess } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
