import { apiFetch } from '@/api/api.ts'
import type { AuthMessageResponse, LoginResponseType } from '@/types/auth.ts'

export async function registerApi(email: string, password: string): Promise<AuthMessageResponse> {
  return apiFetch<AuthMessageResponse>('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function loginApi(email: string, password: string): Promise<LoginResponseType> {
  return apiFetch<LoginResponseType>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function verifyApi(email: string, privateKey: string): Promise<AuthMessageResponse> {
  return apiFetch<AuthMessageResponse>('/verify', {
    method: 'POST',
    body: JSON.stringify({
      email,
      private_key: privateKey
    })
  })
}

export async function refreshApi(email: string, privateKey: string): Promise<AuthMessageResponse> {
  return apiFetch<AuthMessageResponse>('/refresh', {
    method: 'POST',
    body: JSON.stringify({
      email,
      private_key: privateKey
    })
  })
}

export async function logoutApi(email: string, privateKey: string): Promise<AuthMessageResponse> {
  return apiFetch<AuthMessageResponse>('/logout', {
    method: 'POST',
    body: JSON.stringify({
      email,
      private_key: privateKey
    })
  })
}
