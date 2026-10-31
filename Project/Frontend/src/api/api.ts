import { useAuthStore } from '@/stores/authStore.ts'

const API_URL = `${import.meta.env.VITE_API_URL}/api`

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const authStore = useAuthStore()
  const isAuthEndpoint = AUTH_ENDPOINTS.includes(endpoint)

  async function sendRequest(): Promise<Response> {
    return await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
        ...(authStore.token && !isAuthEndpoint
          ? { Authorization: `Bearer ${authStore.token}` }
          : {}),
      },
    })
  }

  let res = await sendRequest()

  if ([401, 403].includes(res.status) && !isAuthEndpoint) {
    try {
      await authStore.refresh()
    } catch {
      await authStore.logout()
      throw new Error('Session abgelaufen. Bitte erneut einloggen.')
    }

    res = await sendRequest()
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ERROR: ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}
