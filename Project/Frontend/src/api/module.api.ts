import { apiFetch } from '@/api/api.ts'
import type {
  CreateModuleRequest,
  ModuleDetail,
  ModuleListQuery,
  ModuleListResponse,
  ModuleResponse,
  PatchModuleRequest
} from '@/types/module.ts'

export async function getModulesApi(query: ModuleListQuery = {}): Promise<ModuleListResponse> {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value))
    }
  }

  const search = params.toString()
  const path = search ? `/api/modules?${search}` : '/api/modules'

  return apiFetch<ModuleListResponse>(path, {
    method: 'GET'
  })
}

export async function getModuleByIdApi(moduleId: number): Promise<ModuleResponse<ModuleDetail>> {
  return apiFetch<ModuleResponse<ModuleDetail>>(`/api/modules/${moduleId}`, {
    method: 'GET'
  })
}

export async function createModuleApi(module: CreateModuleRequest): Promise<ModuleResponse> {
  return apiFetch<ModuleResponse>('/api/modules', {
    method: 'POST',
    body: JSON.stringify(module)
  })
}

export async function patchModuleApi(moduleId: number, module: PatchModuleRequest): Promise<ModuleResponse> {
  return apiFetch<ModuleResponse>(`/api/modules/${moduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(module)
  })
}

export async function deleteModuleApi(moduleId: number): Promise<void> {
  return apiFetch<void>(`/api/modules/${moduleId}`, {
    method: 'DELETE'
  })
}

/** Das aktuelle Backend antwortet nach erfolgreicher Validierung mit HTTP 501. */
export async function replaceLearningObjectivesApi(moduleId: number, learningObjectives: string[]): Promise<never> {
  return apiFetch<never>(`/api/modules/${moduleId}/learning-objectives`, {
    method: 'PUT',
    body: JSON.stringify({ learningObjectives })
  })
}
