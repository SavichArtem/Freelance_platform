import { createSlice } from '@reduxjs/toolkit';

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    sortBy: 'rating',
    searchQuery: '',
    categoryId: null,
    categoryIdFilter: null,
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
    setCategoryIdFilter: (state, action) => {
      state.categoryIdFilter = action.payload;
    },
    resetFilters: (state) => {
      state.sortBy = 'rating';
      state.searchQuery = '';
      state.categoryId = null;
      state.categoryIdFilter = null;
    },
  },
});

export const { setSortBy, setSearchQuery, setCategoryId, setCategoryIdFilter, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;