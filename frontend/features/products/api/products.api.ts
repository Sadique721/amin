import { api } from '@/services/axios';
import { ProductFilters } from '../types/product.types';

export async function fetchProductsApi(filters: ProductFilters) {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.category) query.append('category', filters.category);
  if (filters.brand && filters.brand.length > 0) query.append('brand', filters.brand.join(','));
  if (filters.minPrice !== undefined) query.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) query.append('maxPrice', String(filters.maxPrice));
  if (filters.type) query.append('type', filters.type);
  if (filters.rating !== undefined) query.append('rating', String(filters.rating));
  if (filters.sortBy) query.append('sortBy', filters.sortBy);
  query.append('page', String(filters.page));
  query.append('limit', String(filters.limit));

  const response = await api.get(`/products?${query.toString()}`);
  return response.data;
}

export async function fetchProductBySlugApi(slug: string) {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
}

export async function fetchFacetsApi(type?: string) {
  const url = type ? `/products/facets?type=${type}` : '/products/facets';
  const response = await api.get(url);
  return response.data;
}

export async function fetchCategoriesApi() {
  const response = await api.get('/categories');
  return response.data;
}

export async function fetchProductByIdApi(id: string) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function createProductApi(data: any) {
  const response = await api.post('/products', data);
  return response.data;
}

export async function updateProductApi(id: string, data: any) {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
}

export async function deleteProductApi(id: string) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

