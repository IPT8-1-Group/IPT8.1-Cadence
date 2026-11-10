import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createModuleApi,
  deleteModuleApi,
  getModuleByIdApi,
  getModulesApi,
  patchModuleApi,
  replaceLearningObjectivesApi
} from '@/api/module.api.ts'
import type { CreateModuleRequest, ModuleListQuery, ModuleListResponse, PatchModuleRequest } from '@/types/module.ts'
import { useRequestState } from '@/stores/requestState.ts'

export const useModuleStore = defineStore('module', () => {
  const { loading, error, runRequest, loadData } = useRequestState()
  const modulesData = ref<ModuleListResponse | null>(null)

  async function getModules(query: ModuleListQuery = {}) {
    return await loadData(modulesData, () => getModulesApi(query), 'Module konnten nicht geladen werden.')
  }

  async function getModuleById(moduleId: number) {
    return await runRequest(async () => {
      const response = await getModuleByIdApi(moduleId)
      return response.data
    }, 'Modul konnte nicht geladen werden.')
  }

  async function createModule(module: CreateModuleRequest) {
    return await runRequest(async () => {
      const response = await createModuleApi(module)
      return response.data
    }, 'Modul konnte nicht erstellt werden.')
  }

  async function patchModule(moduleId: number, module: PatchModuleRequest) {
    return await runRequest(async () => {
      const response = await patchModuleApi(moduleId, module)
      return response.data
    }, 'Modul konnte nicht aktualisiert werden.')
  }

  async function deleteModule(moduleId: number) {
    const success = await runRequest(async () => {
      await deleteModuleApi(moduleId)
      return true
    }, 'Modul konnte nicht gelöscht werden.')

    return success ?? false
  }

  async function replaceLearningObjectives(moduleId: number, learningObjectives: string[]) {
    return await runRequest(
      () => replaceLearningObjectivesApi(moduleId, learningObjectives),
      'Lernziele konnten nicht gespeichert werden.'
    )
  }

  return {
    loading,
    error,
    modulesData,
    getModules,
    getModuleById,
    createModule,
    patchModule,
    deleteModule,
    replaceLearningObjectives
  }
})
