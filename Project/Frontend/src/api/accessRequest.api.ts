import { apiFetch } from '@/api/api.ts'
import type { SubmitAccessRequest, SubmitAccessRequestResponse } from '@/types/accessRequest.ts'

export function submitAccessRequestApi(request: SubmitAccessRequest): Promise<SubmitAccessRequestResponse> {
  return apiFetch('/access-requests', {
    authenticated: false,
    method: 'POST',
    body: JSON.stringify(request),
  })
}
