import type { CourseDay } from '@/types/course'

const swissDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' })
const shortDay = new Intl.DateTimeFormat('de-CH', {
  timeZone: 'UTC',
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const longDay = new Intl.DateTimeFormat('de-CH', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function courseDateKey(date: CourseDay['date'] | Date): string | null {
  if (date === null || date === '') return null
  // Date-only values already represent a local calendar date.
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const value = /^-?\d+$/.test(String(date)) ? new Date(Number(date) * 1000) : new Date(date)
  return Number.isFinite(value.getTime()) ? swissDay.format(value) : null
}

export function shiftDate(key: string, days: number) {
  const date = new Date(key + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function weekStart(key: string) {
  const day = new Date(key + 'T00:00:00Z').getUTCDay()
  return shiftDate(key, -((day + 6) % 7))
}

export function weekNumber(monday: string) {
  const thursday = new Date(shiftDate(monday, 3))
  const startOfYear = Date.UTC(thursday.getUTCFullYear(), 0, 1)
  return 1 + Math.floor((thursday.getTime() - startOfYear) / 604800000)
}

export function weekLabel(start: string, end: string) {
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${Number(start.slice(-2))}.–${longDay.format(new Date(end))}`
  }
  return `${longDay.format(new Date(start))} – ${longDay.format(new Date(end))}`
}

export function shortCourseDate(dateKey: string) {
  return shortDay.format(new Date(dateKey))
}
