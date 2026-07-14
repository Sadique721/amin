import { api } from '@/services/axios';

export async function sendOtpApi(email: string) {
  const response = await api.post('/auth/otp/send', { email });
  return response.data;
}

export async function verifyOtpApi(email: string, otp: string) {
  const response = await api.post('/auth/otp/verify', { email, otp });
  return response.data;
}

export async function googleLoginApi(credential: string) {
  const response = await api.post('/auth/google', { credential });
  return response.data;
}
