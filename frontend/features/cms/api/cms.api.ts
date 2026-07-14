import { api } from '@/services/axios';

export async function fetchBannersApi(type?: string) {
  const url = type ? `/cms/banners?type=${type}` : '/cms/banners';
  const response = await api.get(url);
  return response.data;
}

export async function fetchFaqsApi() {
  const response = await api.get('/cms/faqs');
  return response.data;
}
export async function fetchCategoriesApi() {
  const response = await api.get('/categories');
  return response.data;
}
