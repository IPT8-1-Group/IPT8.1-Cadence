import { createCourseDayApi, getCourseDaysApi, updateCourseDayApi } from '@/api/course.api'
import {
  createGrobplanungApi,
  getGrobplanungenApi,
  getOutlinePlacementsApi,
  placeOutlineApi,
} from '@/api/grobplanung.api'
import type { CourseScheduleRequest } from '@/types/course'
import { courseDateKey, shiftDate } from '@/utils/outlineWeek'

export function scheduleDates(firstDate: string, count: number, weekdays: number[]) {
  const date = new Date(firstDate + 'T00:00:00Z')
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(firstDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== firstDate ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 365
  ) {
    throw new Error('Bitte ein gültiges Startdatum und 1 bis 365 Kurstage eingeben.')
  }
  const allowed = new Set(weekdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))
  if (!allowed.size) allowed.add(date.getUTCDay())
  const result = [firstDate]
  let next = firstDate
  while (result.length < count) {
    next = shiftDate(next, 1)
    if (allowed.has(new Date(next + 'T00:00:00Z').getUTCDay())) result.push(next)
  }
  if (result.at(-1)! > '2038-01-19')
    throw new Error('Die Unterrichtstermine müssen vor dem 20. Januar 2038 liegen.')
  return result
}

export function validateCourseSchedule(schedule: CourseScheduleRequest, count: number) {
  const dates = scheduleDates(schedule.firstDate, count, schedule.weekdays)
  const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/
  if (
    !time.test(schedule.startTime) ||
    !time.test(schedule.endTime) ||
    schedule.endTime <= schedule.startTime
  ) {
    throw new Error('Die Endzeit muss nach einer gültigen Startzeit liegen.')
  }
  return dates
}

// Vorhandene Tage und Themen werden beim Wiederholen wiederverwendet.
export async function initializeCourseSchedule(
  courseId: number,
  sourceCourseId: number | null,
  count: number,
  schedule: CourseScheduleRequest,
) {
  const dates = validateCourseSchedule(schedule, count)
  const targetDays = await getCourseDaysApi(courseId)
  for (const [index, date] of dates.entries()) {
    const day = targetDays[index]
    const fields = { date, startTime: schedule.startTime, endTime: schedule.endTime }
    if (!day) targetDays.push(await createCourseDayApi(courseId, fields))
    else if (
      courseDateKey(day.date) !== date ||
      day.startTime.slice(0, 5) !== schedule.startTime ||
      day.endTime.slice(0, 5) !== schedule.endTime
    ) {
      targetDays[index] = await updateCourseDayApi(courseId, day.id, fields)
    }
  }
  if (sourceCourseId === null || sourceCourseId === courseId) return

  const [sourceDays, sourceTopics, sourcePlacements, targetTopics, targetPlacements] =
    await Promise.all([
      getCourseDaysApi(sourceCourseId),
      getGrobplanungenApi(sourceCourseId),
      getOutlinePlacementsApi(sourceCourseId),
      getGrobplanungenApi(courseId),
      getOutlinePlacementsApi(courseId),
    ])
  const identity = (topic: { title: string; desc: string | null }) =>
    JSON.stringify([topic.title.trim(), topic.desc?.trim() ?? ''])
  const matched = new Set<number>()
  const mapping = new Map<number, number>()
  for (const topic of sourceTopics) {
    let clone = targetTopics.find(
      (candidate) => !matched.has(candidate.id) && identity(candidate) === identity(topic),
    )
    if (!clone) {
      clone = await createGrobplanungApi({
        fk_course: courseId,
        title: topic.title,
        desc: topic.desc,
      })
      targetTopics.push(clone)
    }
    matched.add(clone.id)
    mapping.set(topic.id, clone.id)
  }
  for (const [index, sourceDay] of sourceDays.entries()) {
    const targetDay = targetDays[index]
    if (!targetDay) continue
    const assignments = sourcePlacements.filter((placement) => placement.dayId === sourceDay.id)
    const orderedIds = targetPlacements
      .filter((placement) => placement.dayId === targetDay.id)
      .map((placement) => placement.outlineId)
    for (const placement of assignments) {
      const outlineId = mapping.get(placement.outlineId)
      if (outlineId === undefined || orderedIds.includes(outlineId)) continue
      orderedIds.push(outlineId)
      await placeOutlineApi(courseId, {
        outlineId,
        fromDayId: null,
        targetDayId: targetDay.id,
        orderedIds: [...orderedIds],
      })
    }
  }
}
