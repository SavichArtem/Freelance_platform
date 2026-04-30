import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messagesApi } from '../../api/messagesApi';

export const fetchChats = createAsyncThunk(
  'messages/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messagesApi.getChats();
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка загрузки чатов');
    }
  }
);

export const fetchUserMessages = createAsyncThunk(
  'messages/fetchUserMessages',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await messagesApi.getUserMessages(userId);
      return { chatId: `user_${userId}`, messages: response.data.messages, partner: response.data.partner };
    } catch (error) {
      return rejectWithValue('Ошибка загрузки сообщений');
    }
  }
);

export const fetchOrderMessages = createAsyncThunk(
  'messages/fetchOrderMessages',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await messagesApi.getOrderMessages(orderId);
      return { chatId: `order_${orderId}`, messages: response.data.messages, partner: response.data.partner };
    } catch (error) {
      return rejectWithValue('Ошибка загрузки сообщений');
    }
  }
);

export const sendUserMessage = createAsyncThunk(
  'messages/sendUserMessage',
  async ({ userId, text, file }, { rejectWithValue }) => {
    try {
      const response = await messagesApi.sendToUser(userId, { text, file });
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка отправки сообщения');
    }
  }
);

export const sendOrderMessage = createAsyncThunk(
  'messages/sendOrderMessage',
  async ({ orderId, text, file }, { rejectWithValue }) => {
    try {
      const response = await messagesApi.sendToOrder(orderId, { text, file });
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка отправки сообщения');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    chats: [],
    currentMessages: [],
    currentChatId: null,
    currentPartner: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.currentMessages = [];
      state.currentChatId = null;
      state.currentPartner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(fetchUserMessages.fulfilled, (state, action) => {
        state.currentMessages = action.payload.messages;
        state.currentChatId = action.payload.chatId;
        state.currentPartner = action.payload.partner;
      })
      .addCase(fetchOrderMessages.fulfilled, (state, action) => {
        state.currentMessages = action.payload.messages;
        state.currentChatId = action.payload.chatId;
        state.currentPartner = action.payload.partner;
      })
      .addCase(sendUserMessage.fulfilled, (state, action) => {
        state.currentMessages.push(action.payload);
      })
      .addCase(sendOrderMessage.fulfilled, (state, action) => {
        state.currentMessages.push(action.payload);
      });
  },
});

export const { clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;