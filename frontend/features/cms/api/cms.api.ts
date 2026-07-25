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

export async function fetchBannersAllApi() {
  const response = await api.get('/cms/banners/all');
  return response.data;
}

export async function createBannerApi(data: any) {
  const response = await api.post('/cms/banners', data);
  return response.data;
}

export async function updateBannerApi(id: string, data: any) {
  const response = await api.put(`/cms/banners/${id}`, data);
  return response.data;
}

export async function deleteBannerApi(id: string) {
  const response = await api.delete(`/cms/banners/${id}`);
  return response.data;
}

export async function fetchFaqsAllApi() {
  const response = await api.get('/cms/faqs/all');
  return response.data;
}

export async function createFaqApi(data: any) {
  const response = await api.post('/cms/faqs', data);
  return response.data;
}

export async function updateFaqApi(id: string, data: any) {
  const response = await api.put(`/cms/faqs/${id}`, data);
  return response.data;
}

export async function deleteFaqApi(id: string) {
  const response = await api.delete(`/cms/faqs/${id}`);
  return response.data;
}

