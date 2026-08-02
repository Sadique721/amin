import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ICategory } from '../types/product.types';
import { fetchCategoriesApi } from '../api/products.api';

export interface CategoriesState {
  items: ICategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCategoriesApi();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.items = payload;
        } else if (payload && Array.isArray(payload.results)) {
          state.items = payload.results;
        } else if (payload && Array.isArray(payload.docs)) {
          state.items = payload.docs;
        } else if (payload && Array.isArray(payload.categories)) {
          state.items = payload.categories;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.items = [];
      });
  },
});

export default categoriesSlice.reducer;
