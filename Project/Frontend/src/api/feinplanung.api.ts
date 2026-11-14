import { apiFetch } from '@/api/api.ts'
import type {
  CreateFeinplanungRequest,
  Feinplanung,
  FeinplanungDayResponse,
  UpdateFeinplanungRequest
} from '@/types/feinplanung.ts'

export async function getFeinplanungenApi(): Promise<Feinplanung[]> {
  return apiFetch<Feinplanung[]>('/feinplanung', {
    method: 'GET'
  })
}

export async function getFeinplanungenByDayApi(dayId: number): Promise<FeinplanungDayResponse> {
  return apiFetch<FeinplanungDayResponse>(`/feinplanung?dayId=${dayId}`, {
    method: 'GET'
  })
}

export async function getFeinplanungByIdApi(id: number): Promise<Feinplanung> {
  return apiFetch<Feinplanung>(`/feinplanung/${id}`, {
    method: 'GET'
  })
}

export async function createFeinplanungApi(feinplanung: CreateFeinplanungRequest): Promise<Feinplanung> {
  return apiFetch<Feinplanung>('/feinplanung', {
    method: 'POST',
    body: JSON.stringify(feinplanung)
  })
}

export async function updateFeinplanungApi(id: number, feinplanung: UpdateFeinplanungRequest): Promise<Feinplanung> {
  return apiFetch<Feinplanung>(`/feinplanung/${id}`, {
    method: 'PUT',
    body: JSON.stringify(feinplanung)
  })
}

export async function deleteFeinplanungApi(id: number): Promise<void> {
  return apiFetch<void>(`/feinplanung/${id}`, {
    method: 'DELETE'
  })
}

export async function moveFeinplanungApi(
  id: number,
  targetDayId: number,
  targetOutlineId?: number | null,
  method: 'POST' | 'PUT' = 'POST'
): Promise<Feinplanung> {
  return apiFetch<Feinplanung>(`/feinplanung/${id}/move`, {
    method,
    body: JSON.stringify({
      targetDayId,
      targetOutlineId
    })
  })
}

export async function reorderFeinplanungApi(
  dayId: number,
  orderedIds: number[],
  method: 'POST' | 'PUT' = 'POST'
): Promise<FeinplanungDayResponse> {
  return apiFetch<FeinplanungDayResponse>('/feinplanung/reorder', {
    method,
    body: JSON.stringify({ dayId, orderedIds })
  })
}
