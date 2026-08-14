import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IProduct, ProductFilters } from '../types/product.types';
import { fetchProductsApi, fetchFacetsApi } from '../api/products.api';

export interface ProductsState {
  items: IProduct[];
  filters: ProductFilters;
  facets: {
    brands: { name: string; count: number }[];
    priceRange: { min: number; max: number };
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalDocs: number;
  };
  loading: boolean;
  facetsLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  filters: {
    search: '',
    category: '',
    brand: [],
    minPrice: undefined,
    maxPrice: undefined,
    type: undefined,
    rating: undefined,
    sortBy: 'newest',
    page: 1,
    limit: 12,
  },
  facets: {
    brands: [],
    priceRange: { min: 0, max: 100000 },
  },
  pagination: {
    page: 1,
    limit: 12,
    totalPages: 1,
    totalDocs: 0,
  },
  loading: false,
  facetsLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters, { rejectWithValue }) => {
    try {
      const response = await fetchProductsApi(filters);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchFacets = createAsyncThunk(
  'products/fetchFacets',
  async (type: 'jewellery' | 'cosmetics' | undefined, { rejectWithValue }) => {
    try {
      const response = await fetchFacetsApi(type);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch facets');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<ProductFilters>>) {
      const isPageExplicit = action.payload.page !== undefined;
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: isPageExplicit ? (action.payload.page || 1) : 1,
      };
    },
    resetFilters(state) {
      state.filters = {
        ...initialState.filters,
        type: state.filters.type
      };
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.filters.limit = action.payload;
      state.filters.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns 'results' array and 'totalResults' / 'totalPages'
        state.items = action.payload?.results || action.payload?.products || action.payload?.docs || [];
        state.pagination = {
          page: action.payload?.page || state.filters.page || 1,
          limit: action.payload?.limit || state.filters.limit || 12,
          totalPages: action.payload?.totalPages || 1,
          totalDocs: action.payload?.totalResults || action.payload?.total || action.payload?.totalDocs || 0,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFacets.pending, (state) => {
        state.facetsLoading = true;
      })
      .addCase(fetchFacets.fulfilled, (state, action) => {
        state.facetsLoading = false;
        state.facets = {
          brands: action.payload.brands || [],
          priceRange: action.payload.priceRange || { min: 0, max: 100000 },
        };
      })
      .addCase(fetchFacets.rejected, (state) => {
        state.facetsLoading = false;
      });
  },
});

export const { setFilter, resetFilters, setPage, setLimit } = productsSlice.actions;
export default productsSlice.reducer;

