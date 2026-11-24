import type { OutlineScheduleRow, OutlinePlanningGroup } from '@/types/grobplanung'
import type { CourseDay } from '@/types/course'
import type { FeinplanungDayResponse } from '@/types/feinplanung'
import { lessonMinutes, lessonSlots } from '@/utils/planningTime'

export type OutlineLesson = {
  key: string
  number: number
  title: string
  description: string
  color: string
  start: string
  end: string
  startMinute: number
  endMinute: number
}

export type LessonSegment = {
  key: string
  title: string
  color: string
  number: number | null
  range: string
  duration: number
}

const colors = [
  '#2563EB',
  '#9333EA',
  '#0D9488',
  '#EA580C',
  '#DB2777',
  '#65A30D',
  '#0891B2',
  '#B45309',
]
export function lessonColor(index: number) {
  return colors[index] ?? `hsl(${((index * 137.508) % 360).toFixed(2)} 65% 45%)`
}

export function readOutlineWeekdays(json: string | null): string[] {
  const names = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
  try {
    const value = JSON.parse(json ?? 'null')
    if (
      value &&
      Number.isInteger(value.daysPerWeek) &&
      value.daysPerWeek >= 1 &&
      value.daysPerWeek <= 7 &&
      Array.isArray(value.weekdays) &&
      value.weekdays.length <= value.daysPerWeek &&
      new Set(value.weekdays).size === value.weekdays.length &&
      value.weekdays.every((day: unknown) => typeof day === 'string' && names.includes(day))
    ) {
      return names.filter((day) => value.weekdays.includes(day))
    }
  } catch {
    /* Wie in der Grobplanung mit der Vorgabe beginnen. */
  }
  return ['Montag']
}

export function buildOutlineLessons(
  rows: OutlineScheduleRow[],
  startTime: string,
): OutlineLesson[] {
  const slots = lessonSlots(startTime, rows.length * lessonMinutes)
  return rows.map((row, index) => ({
    key: row.key,
    number: index + 1,
    title: `L${index + 1} - ${row.topic.title}`,
    description: row.topic.desc ?? '',
    color: lessonColor(index),
    start: slots[index]!.start,
    end: slots[index]!.end,
    startMinute: index * lessonMinutes,
    endMinute: (index + 1) * lessonMinutes,
  }))
}

export function splitLessonSegments(
  start: number,
  end: number,
  lessons: OutlineLesson[],
): LessonSegment[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || start < 0) return []
  const result: LessonSegment[] = []
  for (const lesson of lessons) {
    const from = Math.max(start, lesson.startMinute)
    const to = Math.min(end, lesson.endMinute)
    if (to <= from) continue
    result.push({
      key: lesson.key,
      title: lesson.title,
      color: lesson.color,
      number: lesson.number,
      range: `${from - lesson.startMinute}–${to - lesson.startMinute}′`,
      duration: to - from,
    })
  }
  const plannedEnd = lessons.at(-1)?.endMinute ?? 0
  if (end > plannedEnd) {
    const from = Math.max(start, plannedEnd)
    result.push({
      key: 'unassigned',
      title: 'Ohne Grobplanungslektion',
      color: 'var(--text-color-light)',
      number: null,
      range: `${from}–${end}′`,
      duration: end - from,
    })
  }
  return result
}

export function lessonTint(color: string) {
  return {
    '--lesson-color': color,
    backgroundColor: `color-mix(in srgb, ${color} 12%, var(--surface-color))`,
    borderColor: `color-mix(in srgb, ${color} 45%, var(--border-color))`,
  }
}

export function detailPlanningDays(
  days: CourseDay[],
  groups: OutlinePlanningGroup[],
  courseId: number,
): CourseDay[] {
  const configuredCount = groups.reduce(
    (count, group) => (group.dayIndex === null ? count : Math.max(count, group.dayIndex + 1)),
    0,
  )
  const startTime = days[0]?.startTime ?? '08:15'
  const endTime = days[0]?.endTime ?? '11:45'
  const minutes = (time: string) => {
    const [hours = 0, min = 0] = time.split(':').map(Number)
    return hours * 60 + min
  }
  const durationMin = Math.max(0, minutes(endTime) - minutes(startTime))
  return Array.from(
    { length: Math.max(days.length, configuredCount) },
    (_, index) =>
      days[index] ?? {
        id: -index - 1,
        courseId,
        date: null,
        startTime,
        endTime,
        durationMin,
      },
  )
}

export function emptyDetailDay(day: CourseDay): FeinplanungDayResponse {
  return {
    day: {
      id: day.id,
      date: day.date,
      startTime: day.startTime,
      endTime: day.endTime,
      availableDurationMin: day.durationMin,
    },
    summary: {
      totalDurationMin: 0,
      availableDurationMin: day.durationMin,
      remainingMin: day.durationMin,
      isOverCapacity: false,
    },
    entries: [],
  }
}
