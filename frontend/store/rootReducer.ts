import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '@/features/auth';
import { productsReducer, categoriesReducer } from '@/features/products';

export const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  categories: categoriesReducer,
});
