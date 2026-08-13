import { api } from '@/services/axios';

// NOTE: baseURL is /api (from NEXT_PUBLIC_API_URL)
// So these calls must include /public/ prefix to hit /api/public/auth/...
export async function sendOtpApi(email: string) {
  const response = await api.post('/public/auth/otp/send', { email });
  return response.data;
}

export async function verifyOtpApi(email: string, otp: string) {
  const response = await api.post('/public/auth/otp/verify', { email, otp });
  return response.data;
}

export async function googleLoginApi(credential: string) {
  const response = await api.post('/auth/google', { credential });
  return response.data;
}

export async function loginWithPasswordApi(email: string, secret: string) {
  const response = await api.post('/public/auth/password/login', { email, password: secret });
  return response.data;
}


