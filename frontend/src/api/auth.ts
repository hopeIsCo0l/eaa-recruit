import apiClient from './client'
import type { AuthUser } from '@/types/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  phone: string
}

export interface OtpRequest {
  email: string
  otp: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<{ data: LoginResponse }>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<{ data: { email: string } }>('/auth/register/candidate', data),

  verifyOtp: (data: OtpRequest) =>
    apiClient.post<{ data: LoginResponse }>('/auth/verify-otp', data),
}
