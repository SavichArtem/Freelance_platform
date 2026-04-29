import { createSlice } from '@reduxjs/toolkit';

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    sortBy: 'rating', // rating, price_asc, price_desc
    searchQuery: '',
    categoryId: null,
  },
  reducers: {
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCategoryId: (state, action) => {
      state.categoryId = action.payload;
    },
    resetFilters: (state) => {
      state.sortBy = 'rating';
      state.searchQuery = '';
      state.categoryId = null;
    },
  },
});

export const { setSortBy, setSearchQuery, setCategoryId, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;