import type { CourseDay } from '@/types/course'

export type Grobplanung = {
  id: number
  title: string
  desc: string | null
  fk_course: number
}

export type UpdateGrobplanungRequest = {
  title: string
  desc?: string | null
}

export type CreateGrobplanungRequest = UpdateGrobplanungRequest & {
  fk_course: number
  dayId?: number | null
}

export type OutlinePlacement = {
  outlineId: number
  dayId: number
  position: number | null
  linkedCount: number
}

export type PlaceOutlineRequest = {
  outlineId: number
  fromDayId: number | null
  targetDayId: number | null
  orderedIds: number[]
}

export type OutlineClassPlan = {
  days: CourseDay[]
  outlines: Grobplanung[]
  placements: OutlinePlacement[]
}

export type OutlineScheduleSession = { day: CourseDay; dateKey: string | null; number: number }
export type OutlineScheduleRow = {
  key: string
  topic: Grobplanung
  topics: Map<number, Grobplanung>
  sessions: Map<number, OutlineScheduleSession[]>
}
export type OutlineScheduleTarget = {
  row: OutlineScheduleRow
  courseId: number
  dayId?: number
}

export type OutlineContentPosition = {
  outlineIds: number[]
  dayIndex: number | null
  position: number
}

export type OutlinePlanningGroup = {
  key: string
  dayIndex: number | null
  label: string
  rows: OutlineScheduleRow[]
}

export type MoveOutlineContentRequest = {
  key: string
  dayIndex: number | null
  index: number
}
