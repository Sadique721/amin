import axios from 'axios';

// NEXT_PUBLIC_API_URL must point to the Next.js /api/public base path.
// Dev:  http://localhost:3000/api/public
// Prod: https://temp-sanab.vercel.app/api/public  (or your custom domain)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/public';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sanab_accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sanab_user');
        localStorage.removeItem('sanab_accessToken');
        localStorage.removeItem('sanab_refreshToken');
        document.cookie = 'sanab_accessToken=; Max-Age=0; path=/;';
      }
    }
    return Promise.reject(error);
  }
);
