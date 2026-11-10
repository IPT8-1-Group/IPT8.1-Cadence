import { apiFetch } from '@/api/api.ts'
import type { CreateGrobplanungRequest, Grobplanung, UpdateGrobplanungRequest } from '@/types/grobplanung.ts'

export async function getGrobplanungenApi(courseId?: number): Promise<Grobplanung[]> {
  const path = courseId === undefined
    ? '/api/grobplanung'
    : `/api/grobplanung?courseId=${courseId}`

  return apiFetch<Grobplanung[]>(path, {
    method: 'GET'
  })
}

export async function getGrobplanungByIdApi(id: number): Promise<Grobplanung> {
  return apiFetch<Grobplanung>(`/api/grobplanung/${id}`, {
    method: 'GET'
  })
}

export async function createGrobplanungApi(grobplanung: CreateGrobplanungRequest): Promise<Grobplanung> {
  return apiFetch<Grobplanung>('/api/grobplanung', {
    method: 'POST',
    body: JSON.stringify(grobplanung)
  })
}

export async function updateGrobplanungApi(id: number, grobplanung: UpdateGrobplanungRequest): Promise<Grobplanung> {
  return apiFetch<Grobplanung>(`/api/grobplanung/${id}`, {
    method: 'PUT',
    body: JSON.stringify(grobplanung)
  })
}

export async function deleteGrobplanungApi(id: number): Promise<void> {
  return apiFetch<void>(`/api/grobplanung/${id}`, {
    method: 'DELETE'
  })
}

export async function moveGrobplanungApi(id: number, targetCourseId: number): Promise<Grobplanung> {
  return apiFetch<Grobplanung>(`/api/grobplanung/${id}/move`, {
    method: 'POST',
    body: JSON.stringify({ targetCourseId })
  })
}
