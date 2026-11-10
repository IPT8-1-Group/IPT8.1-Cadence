import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createGrobplanungApi,
  deleteGrobplanungApi,
  getGrobplanungByIdApi,
  getGrobplanungenApi,
  moveGrobplanungApi,
  updateGrobplanungApi
} from '@/api/grobplanung.api.ts'
import type { CreateGrobplanungRequest, Grobplanung, UpdateGrobplanungRequest } from '@/types/grobplanung.ts'
import { useRequestState } from '@/stores/requestState.ts'

export const useGrobplanungStore = defineStore('grobplanung', () => {
  const { loading, error, runRequest, loadData } = useRequestState()
  const grobplanungenData = ref<Grobplanung[] | null>(null)

  async function getGrobplanungen(courseId?: number) {
    return await loadData(
      grobplanungenData,
      () => getGrobplanungenApi(courseId),
      'Grobplanung konnte nicht geladen werden.'
    )
  }

  async function getGrobplanungById(id: number) {
    return await runRequest(() => getGrobplanungByIdApi(id), 'Eintrag konnte nicht geladen werden.')
  }

  async function createGrobplanung(grobplanung: CreateGrobplanungRequest) {
    return await runRequest(() => createGrobplanungApi(grobplanung), 'Eintrag konnte nicht erstellt werden.')
  }

  async function updateGrobplanung(id: number, grobplanung: UpdateGrobplanungRequest) {
    return await runRequest(() => updateGrobplanungApi(id, grobplanung), 'Eintrag konnte nicht aktualisiert werden.')
  }

  async function deleteGrobplanung(id: number) {
    const success = await runRequest(async () => {
      await deleteGrobplanungApi(id)
      return true
    }, 'Eintrag konnte nicht gelöscht werden.')

    return success ?? false
  }

  async function moveGrobplanung(id: number, targetCourseId: number) {
    return await runRequest(() => moveGrobplanungApi(id, targetCourseId), 'Eintrag konnte nicht verschoben werden.')
  }

  return {
    loading,
    error,
    grobplanungenData,
    getGrobplanungen,
    getGrobplanungById,
    createGrobplanung,
    updateGrobplanung,
    deleteGrobplanung,
    moveGrobplanung
  }
})
