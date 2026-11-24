import { apiFetch } from '@/api/api.ts'
import type { AccessRequest, ApproveAccessRequestResponse } from '@/types/accessRequest.ts'
import type { UpdateUserRequest } from '@/types/admin.ts'
import type { AuthMessageResponse, User } from '@/types/auth.ts'

export function getUsersApi(): Promise<User[]> {
  return apiFetch('/admin/users')
}

export function getUserByIdApi(id: number): Promise<User> {
  return apiFetch(`/admin/users/${id}`)
}

export function updateUserApi(id: number, user: UpdateUserRequest): Promise<User> {
  return apiFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(user),
  })
}

export function getAccessRequestsApi(): Promise<AccessRequest[]> {
  return apiFetch('/admin/access-requests')
}

export function approveAccessRequestApi(id: number): Promise<ApproveAccessRequestResponse> {
  return apiFetch(`/admin/access-requests/${id}/approve`, { method: 'POST' })
}

export function rejectAccessRequestApi(id: number): Promise<AuthMessageResponse> {
  return apiFetch(`/admin/access-requests/${id}/reject`, { method: 'POST' })
}
