import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
  approveAccessRequestApi,
  getAccessRequestsApi,
  getUserByIdApi,
  getUsersApi,
  rejectAccessRequestApi,
  updateUserApi,
} from '@/api/admin.api.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useRequestState } from '@/stores/requestState.ts'
import type { AccessRequest } from '@/types/accessRequest.ts'
import type { UpdateUserRequest } from '@/types/admin.ts'
import type { User } from '@/types/auth.ts'

export const useAdminStore = defineStore('admin', () => {
  const { loading, error, runRequest, loadData, invalidateData } = useRequestState()
  const authStore = useAuthStore()
  const users = ref<User[] | null>(null)
  const accessRequests = ref<AccessRequest[] | null>(null)

  watch([() => authStore.token, () => authStore.isAdmin], () => {
    invalidateData(users)
    invalidateData(accessRequests)
    users.value = null
    accessRequests.value = null
    error.value = null
  }, { flush: 'sync' })

  function getUsers() {
    return loadData(users, getUsersApi, 'Benutzer konnten nicht geladen werden.')
  }

  function getUserById(id: number) {
    return runRequest(() => getUserByIdApi(id), 'Benutzer konnte nicht geladen werden.')
  }

  function updateUser(id: number, data: UpdateUserRequest) {
    return runRequest(async () => {
      const user = await updateUserApi(id, data)
      invalidateData(users)
      users.value = users.value?.map((entry) => entry.id === id ? user : entry) ?? null

      if (authStore.user?.id === user.id) {
        if (user.active && authStore.token) {
          authStore.user = user
        } else if (authStore.token) {
          authStore.invalidateSession(authStore.token)
        }
      }
      return user
    }, 'Benutzer konnte nicht aktualisiert werden.')
  }

  function getAccessRequests() {
    return loadData(accessRequests, getAccessRequestsApi, 'Zugangsanfragen konnten nicht geladen werden.')
  }

  function updateRequestStatus(id: number, status: 'approved' | 'rejected') {
    invalidateData(accessRequests)
    const request = accessRequests.value?.find((entry) => entry.id === id)
    if (request) request.status = status
  }

  function approveAccessRequest(id: number) {
    return runRequest(async () => {
      const result = await approveAccessRequestApi(id)
      updateRequestStatus(id, 'approved')
      return result
    }, 'Zugangsanfrage konnte nicht genehmigt werden.')
  }

  function rejectAccessRequest(id: number) {
    return runRequest(async () => {
      const result = await rejectAccessRequestApi(id)
      updateRequestStatus(id, 'rejected')
      return result
    }, 'Zugangsanfrage konnte nicht abgelehnt werden.')
  }

  return {
    loading, error, users, accessRequests,
    getUsers, getUserById, updateUser, getAccessRequests, approveAccessRequest, rejectAccessRequest,
  }
})
