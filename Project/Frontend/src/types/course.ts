export type Course = {
  id: number
  title: string
  desc: string | null
  fk_module_id: number
  assessment?: string | null
}

export type UpdateCourseRequest = {
  title: string
  desc?: string | null
}

export type CreateCourseRequest = UpdateCourseRequest & {
  fk_module_id: number
  dayCount?: number
}

export type CourseDay = {
  id: number
  courseId: number
  date: number | string | null
  startTime: string
  endTime: string
  durationMin: number
}

export type CreateCourseDayRequest = {
  date?: string | null
  startTime: string
  endTime: string
}

export type CourseScheduleRequest = {
  firstDate: string
  startTime: string
  endTime: string
  weekdays: number[]
}
