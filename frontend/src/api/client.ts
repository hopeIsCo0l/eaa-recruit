/**
 * FR-81: Axios instance with auth + error interceptors.
 * All API calls must use this instance — never import axios directly.
 */
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { showToast } from '@/hooks/useToast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach Bearer token ──────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — handle 401 + network errors ────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error.response?.status
    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    } else if (status !== undefined && status >= 500) {
      showToast({ title: 'Server error', description: 'Something went wrong. Please try again.', variant: 'error' })
    } else if (!error.response) {
      showToast({ title: 'Network error', description: 'Check your connection and try again.', variant: 'error' })
    }
    return Promise.reject(error)
  }
)

export default apiClient
