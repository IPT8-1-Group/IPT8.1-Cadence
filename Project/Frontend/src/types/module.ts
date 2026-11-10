export type ModuleFields = {
  id: number
  code: string
  title: string
  description: string | null
  createdAt: null
  updatedAt: null
}

export type ModuleListItem = ModuleFields & {
  courseCount: number
}

export type Module = ModuleFields & {
  externalUrl: null
  learningObjectives: string[]
}

export type ModuleStatistics = {
  courseCount: number
  dayCount: number
  detailedEntryCount: number
}

export type ModuleDetail = Module & {
  statistics: ModuleStatistics
}

export type ModuleListQuery = {
  search?: string
  sortBy?: 'code' | 'title' | 'updatedAt'
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export type ModuleListResponse = {
  data: ModuleListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export type ModuleResponse<T = Module> = {
  data: T
}

export type CreateModuleRequest = {
  code: string
  title: string
  description: string
}

export type PatchModuleRequest = Partial<CreateModuleRequest> & {
  externalUrl?: string | null
}
