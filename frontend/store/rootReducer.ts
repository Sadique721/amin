import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '@/features/auth';
import { productsReducer, categoriesReducer } from '@/features/products';
import { cartReducer } from '@/features/cart';

export const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  categories: categoriesReducer,
  cart: cartReducer,
});
