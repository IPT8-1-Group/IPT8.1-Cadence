import { useAuthStore } from '@/stores/authStore.ts'

const baseUrl = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
const API_URL = baseUrl.replace(/\/api(?:\/auth)?$/, '') + '/api'

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function getErrorMessage(response: Response) {
  const body = await response.text()

  try {
    const data = JSON.parse(body)
    const message = data?.error?.message ?? data?.error ?? data?.message
    if (typeof message === 'string' && message) return message
  } catch {
    if (body && !response.headers.get('Content-Type')?.includes('text/html')) return body
  }

  return `Anfrage fehlgeschlagen (HTTP ${response.status}).`
}

export async function apiFetch<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { authenticated = true, ...request } = options
  const authStore = authenticated ? useAuthStore() : null
  const token = authStore?.token
  const headers = new Headers(request.headers)

  if (request.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${endpoint}`, { ...request, headers })

  if (!response.ok) {
    const message = await getErrorMessage(response)
    if (response.status === 401 && token) authStore?.invalidateSession(token)
    throw new ApiError(response.status, message)
  }

  const data = response.status === 204 ? undefined : await response.json()
  if (authStore && authStore.token !== token) {
    throw new Error('Die Sitzung hat sich geändert.')
  }
  return data as T
}
