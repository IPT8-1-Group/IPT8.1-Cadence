import { apiFetch } from '@/api/api.ts'
import type {
  AuthMessageResponse,
  LoginResponseType,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth.ts'

export function registerApi(
  data: RegisterRequest | string,
  password = '',
): Promise<RegisterResponse> {
  const user = typeof data === 'string' ? { email: data, password } : data

  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  })
}

export function loginApi(email: string, password: string): Promise<LoginResponseType> {
  return apiFetch('/auth/login', {
    authenticated: false,
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

function sendSessionRequest(
  endpoint: 'verify' | 'refresh' | 'logout',
  email: string,
  privateKey: string,
): Promise<AuthMessageResponse> {
  return apiFetch(`/auth/${endpoint}`, {
    authenticated: false,
    method: 'POST',
    body: JSON.stringify({ email, private_key: privateKey }),
  })
}

export function verifyApi(email: string, privateKey: string) {
  return sendSessionRequest('verify', email, privateKey)
}

export function refreshApi(email: string, privateKey: string) {
  return sendSessionRequest('refresh', email, privateKey)
}

export function logoutApi(email: string, privateKey: string) {
  return sendSessionRequest('logout', email, privateKey)
}

export function getMeApi(savedToken?: string): Promise<MeResponse> {
  if (savedToken === undefined) {
    return apiFetch('/auth/me')
  }

  return apiFetch('/auth/me', {
    authenticated: false,
    headers: { Authorization: `Bearer ${savedToken}` },
  })
}

export function setPasswordApi(token: string, password: string): Promise<AuthMessageResponse> {
  return apiFetch('/auth/set-password', {
    authenticated: false,
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export function changePasswordApi(
  oldPassword: string,
  newPassword: string,
): Promise<AuthMessageResponse> {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  })
}
