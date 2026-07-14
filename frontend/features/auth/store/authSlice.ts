import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
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
      const user = localStorage.getItem('sanab_user');
      const accessToken = localStorage.getItem('sanab_accessToken');
      const refreshToken = localStorage.getItem('sanab_refreshToken');
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
        localStorage.setItem('sanab_user', JSON.stringify(user));
        localStorage.setItem('sanab_accessToken', accessToken);
        localStorage.setItem('sanab_refreshToken', refreshToken);
      }
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sanab_user');
        localStorage.removeItem('sanab_accessToken');
        localStorage.removeItem('sanab_refreshToken');
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
