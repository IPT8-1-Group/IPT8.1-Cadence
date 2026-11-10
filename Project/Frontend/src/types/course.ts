export type Course = {
  id: number
  title: string
  desc: string | null
  fk_module_id: number
}

export type UpdateCourseRequest = {
  title: string
  desc?: string | null
}

export type CreateCourseRequest = UpdateCourseRequest & {
  fk_module_id: number
}
