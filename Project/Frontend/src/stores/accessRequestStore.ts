import { defineStore } from 'pinia'
import { submitAccessRequestApi } from '@/api/accessRequest.api.ts'
import { useRequestState } from '@/stores/requestState.ts'
import type { SubmitAccessRequest } from '@/types/accessRequest.ts'

export const useAccessRequestStore = defineStore('accessRequest', () => {
  const { loading, error, runRequest } = useRequestState()

  function submitAccessRequest(data: SubmitAccessRequest) {
    return runRequest(() => submitAccessRequestApi(data), 'Zugangsanfrage konnte nicht gesendet werden.')
  }

  return { loading, error, submitAccessRequest }
})
