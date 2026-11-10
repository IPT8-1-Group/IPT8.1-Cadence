export type Feinplanung = {
  id: number
  topic: string
  desc: string | null
  dur_min: number
  position: number
  fk_course_day: number
  fk_outline_planning: number | null
}

export type FeinplanungDayResponse = {
  day: {
    id: number
    date: number
    startTime: string
    endTime: string
    availableDurationMin: number
  }
  summary: {
    totalDurationMin: number
    availableDurationMin: number
    remainingMin: number
    isOverCapacity: boolean
  }
  entries: (Feinplanung & {
    startMinute: number
    endMinute: number
    timeRange: string
  })[]
}

export type CreateFeinplanungRequest = {
  topic: string
  desc?: string | null
  dur_min?: number
  fk_course_day: number
  fk_outline_planning?: number | null
}

export type UpdateFeinplanungRequest = Partial<CreateFeinplanungRequest>
