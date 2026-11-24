import type { CourseDay } from '@/types/course'

export const lessonMinutes = 45

export function courseDate(date: CourseDay['date']) {
  // Course_day.date is stored as Unix seconds. ISO dates also occur in API fixtures.
  const value = /^\d+$/.test(String(date)) ? new Date(Number(date) * 1000) : new Date(String(date))
  if (!Number.isFinite(value.getTime())) return 'Datum unbekannt'
  return value.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zurich',
  })
}

export function lessonRange(start: number, end: number) {
  const first = Math.floor(start / lessonMinutes) + 1
  const last = Math.ceil(end / lessonMinutes)
  const from = start % lessonMinutes
  const to = ((end - 1) % lessonMinutes) + 1
  return first === last
    ? `L${first} · ${from}–${to}′`
    : `L${first} · ${from}′ bis L${last} · ${to}′`
}

export function lessonSlots(startTime: string, available: number) {
  const [hours = 0, minutes = 0] = startTime.split(':').map(Number)
  const start = hours * 60 + minutes
  const clock = (minute: number) =>
    `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
  return Array.from({ length: Math.ceil(available / lessonMinutes) }, (_, index) => {
    const offset = index * lessonMinutes
    const duration = Math.min(lessonMinutes, available - offset)
    return { start: clock(start + offset), end: clock(start + offset + duration), duration }
  })
}
