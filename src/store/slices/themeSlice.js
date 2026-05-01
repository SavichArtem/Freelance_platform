import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    dark: localStorage.getItem('theme') === 'dark',
  },
  reducers: {
    toggleTheme: (state) => {
      state.dark = !state.dark;
      localStorage.setItem('theme', state.dark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', state.dark ? 'dark' : 'light');
    },
    initTheme: (state) => {
      document.documentElement.setAttribute('data-theme', state.dark ? 'dark' : 'light');
    },
  },
});

export const { toggleTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;