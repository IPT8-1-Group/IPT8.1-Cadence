import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createFeinplanungApi,
  deleteFeinplanungApi,
  getFeinplanungByIdApi,
  getFeinplanungenApi,
  getFeinplanungenByDayApi,
  moveFeinplanungApi,
  reorderFeinplanungApi,
  updateFeinplanungApi
} from '@/api/feinplanung.api.ts'
import type {
  CreateFeinplanungRequest,
  Feinplanung,
  FeinplanungDayResponse,
  UpdateFeinplanungRequest
} from '@/types/feinplanung.ts'
import { useRequestState } from '@/stores/requestState.ts'

export const useFeinplanungStore = defineStore('feinplanung', () => {
  const { loading, error, runRequest, loadData } = useRequestState()
  const feinplanungenData = ref<Feinplanung[] | null>(null)
  const feinplanungDayData = ref<FeinplanungDayResponse | null>(null)

  async function getFeinplanungen() {
    return await loadData(feinplanungenData, getFeinplanungenApi, 'Feinplanung konnte nicht geladen werden.')
  }

  async function getFeinplanungenByDay(dayId: number) {
    return await loadData(
      feinplanungDayData,
      () => getFeinplanungenByDayApi(dayId),
      'Kurstag konnte nicht geladen werden.'
    )
  }

  async function getFeinplanungById(id: number) {
    return await runRequest(() => getFeinplanungByIdApi(id), 'Eintrag konnte nicht geladen werden.')
  }

  async function createFeinplanung(feinplanung: CreateFeinplanungRequest) {
    return await runRequest(() => createFeinplanungApi(feinplanung), 'Eintrag konnte nicht erstellt werden.')
  }

  async function updateFeinplanung(id: number, feinplanung: UpdateFeinplanungRequest) {
    return await runRequest(() => updateFeinplanungApi(id, feinplanung), 'Eintrag konnte nicht aktualisiert werden.')
  }

  async function deleteFeinplanung(id: number) {
    const success = await runRequest(async () => {
      await deleteFeinplanungApi(id)
      return true
    }, 'Eintrag konnte nicht gelöscht werden.')

    return success ?? false
  }

  async function moveFeinplanung(id: number, targetDayId: number, targetOutlineId?: number | null) {
    return await runRequest(
      () => moveFeinplanungApi(id, targetDayId, targetOutlineId),
      'Eintrag konnte nicht verschoben werden.'
    )
  }

  async function reorderFeinplanung(dayId: number, orderedIds: number[]) {
    return await runRequest(
      () => reorderFeinplanungApi(dayId, orderedIds),
      'Einträge konnten nicht umsortiert werden.'
    )
  }

  return {
    loading,
    error,
    feinplanungenData,
    feinplanungDayData,
    getFeinplanungen,
    getFeinplanungenByDay,
    getFeinplanungById,
    createFeinplanung,
    updateFeinplanung,
    deleteFeinplanung,
    moveFeinplanung,
    reorderFeinplanung
  }
})
