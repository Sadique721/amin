import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartState, ICartItem, ICoupon } from '../types/cart.types';
import { validateCouponApi } from '../api/cart.api';

const loadCartState = () => {
  if (typeof window === 'undefined') return { items: [], coupon: null, discountAmount: 0 };
  try {
    const items = localStorage.getItem('amin_cart_items');
    const coupon = localStorage.getItem('amin_cart_coupon');
    const discountAmount = localStorage.getItem('amin_cart_discount');
    return {
      items: items ? JSON.parse(items) : [],
      coupon: coupon ? JSON.parse(coupon) : null,
      discountAmount: discountAmount ? Number(discountAmount) : 0,
    };
  } catch {
    return { items: [], coupon: null, discountAmount: 0 };
  }
};

const savedState = loadCartState();

const initialState: CartState = {
  items: savedState.items,
  coupon: savedState.coupon,
  discountAmount: savedState.discountAmount,
  loading: false,
  couponError: null,
};

const calculateDiscount = (coupon: ICoupon, subtotal: number): number => {
  if (subtotal < coupon.minOrderAmount) return 0;
  
  let discount = 0;
  if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount !== undefined && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  }
  
  return Math.min(Math.round(discount), subtotal);
};

const saveState = (items: ICartItem[], coupon: ICoupon | null, discountAmount: number) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('amin_cart_items', JSON.stringify(items));
    if (coupon) {
      localStorage.setItem('amin_cart_coupon', JSON.stringify(coupon));
      localStorage.setItem('amin_cart_discount', String(discountAmount));
    } else {
      localStorage.removeItem('amin_cart_coupon');
      localStorage.removeItem('amin_cart_discount');
    }
  } catch (err) {
    console.error('Failed to save cart to storage:', err);
  }
};

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ code, subtotal }: { code: string; subtotal: number }, { rejectWithValue }) => {
    try {
      const response = await validateCouponApi(code, subtotal);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Invalid coupon code');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<ICartItem>) {
      const { variant, quantity } = action.payload;
      const existing = state.items.find((item) => item.variant.sku === variant.sku);

      if (existing) {
        existing.quantity = Math.min(variant.stock, existing.quantity + quantity);
      } else {
        state.items.push(action.payload);
      }

      const subtotal = state.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
      if (state.coupon) {
        state.discountAmount = calculateDiscount(state.coupon, subtotal);
        if (state.discountAmount === 0) {
          state.coupon = null;
          state.couponError = 'Order total fell below coupon minimum requirements';
        }
      }

      saveState(state.items, state.coupon, state.discountAmount);
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.variant.sku !== action.payload);

      const subtotal = state.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
      if (state.coupon) {
        state.discountAmount = calculateDiscount(state.coupon, subtotal);
        if (state.discountAmount === 0) {
          state.coupon = null;
        }
      }

      saveState(state.items, state.coupon, state.discountAmount);
    },

    updateQuantity(state, action: PayloadAction<{ sku: string; quantity: number }>) {
      const { sku, quantity } = action.payload;
      const item = state.items.find((item) => item.variant.sku === sku);

      if (item) {
        item.quantity = Math.max(1, Math.min(item.variant.stock, quantity));
      }

      const subtotal = state.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
      if (state.coupon) {
        state.discountAmount = calculateDiscount(state.coupon, subtotal);
        if (state.discountAmount === 0) {
          state.coupon = null;
        }
      }

      saveState(state.items, state.coupon, state.discountAmount);
    },

    removeCoupon(state) {
      state.coupon = null;
      state.discountAmount = 0;
      state.couponError = null;
      saveState(state.items, null, 0);
    },

    clearCart(state) {
      state.items = [];
      state.coupon = null;
      state.discountAmount = 0;
      state.couponError = null;
      saveState([], null, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.couponError = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload.coupon;
        state.discountAmount = action.payload.discountAmount;
        saveState(state.items, state.coupon, state.discountAmount);
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.couponError = action.payload as string;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, removeCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
