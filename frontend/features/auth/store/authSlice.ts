import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem('amin_user');
      const accessToken = localStorage.getItem('amin_accessToken');
      const refreshToken = localStorage.getItem('amin_refreshToken');
      return {
        user: user ? JSON.parse(user) : null,
        accessToken,
        refreshToken,
        loading: false,
        error: null,
      };
    } catch {
      // Ignore
    }
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('amin_user', JSON.stringify(user));
        localStorage.setItem('amin_accessToken', accessToken);
        localStorage.setItem('amin_refreshToken', refreshToken);

        // Sync cookies for Next.js proxy middleware server-side protection
        document.cookie = `amin_accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `amin_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
      }
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('amin_user');
        localStorage.removeItem('amin_accessToken');
        localStorage.removeItem('amin_refreshToken');
        localStorage.removeItem('amin_local_wishlist');
        localStorage.removeItem('amin_cart_items');
        localStorage.removeItem('amin_cart_coupon');
        localStorage.removeItem('amin_cart_discount');

        document.cookie = 'amin_accessToken=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'amin_role=; path=/; max-age=0; SameSite=Lax';
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
