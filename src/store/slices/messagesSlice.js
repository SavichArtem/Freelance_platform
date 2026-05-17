import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    chats: [],
    currentMessages: [],
    currentChatId: null,
    currentPartner: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchChatsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchChatsSuccess(state, action) {
      state.loading = false;
      state.chats = action.payload;
    },
    fetchChatsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMessagesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMessagesSuccess(state, action) {
      state.loading = false;
      state.currentMessages = action.payload.messages;
      state.currentChatId = action.payload.chatId;
      state.currentPartner = action.payload.partner;
    },
    fetchMessagesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    sendMessageSuccess(state, action) {
      state.currentMessages.push(action.payload);
    },
    clearMessages(state) {
      state.chats = [];
      state.currentMessages = [];
      state.currentChatId = null;
      state.currentPartner = null;
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageSuccess,
  clearMessages,
} = messagesSlice.actions;
export default messagesSlice.reducer;
