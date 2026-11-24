import type { Course } from '@/types/course'
import type {
  MoveOutlineContentRequest,
  OutlineClassPlan,
  OutlineContentPosition,
  OutlinePlanningGroup,
  OutlineScheduleRow,
  OutlineScheduleSession,
} from '@/types/grobplanung'
import { courseDateKey } from '@/utils/outlineWeek'

export function buildOutlineRows(
  courses: Course[],
  plans: ReadonlyMap<number, OutlineClassPlan>,
): OutlineScheduleRow[] {
  const result = new Map<string, OutlineScheduleRow>()
  for (const course of courses) {
    const plan = plans.get(course.id)
    if (!plan) continue

    const days = new Map(
      plan.days.map((day, index) => [
        day.id,
        { day, dateKey: courseDateKey(day.date), number: index + 1 },
      ]),
    )
    const byTopic = new Map<number, OutlineScheduleSession[]>()
    for (const placement of plan.placements) {
      const session = days.get(placement.dayId)
      if (!session) continue
      const appointments = byTopic.get(placement.outlineId) ?? []
      appointments.push(session)
      byTopic.set(placement.outlineId, appointments)
    }

    // Start with topics in lesson order, followed by topics awaiting assignment.
    const order = new Map<number, number>()
    const placementsByDay = new Map<number, number[]>()
    for (const { dayId, outlineId } of plan.placements) {
      const ids = placementsByDay.get(dayId) ?? []
      ids.push(outlineId)
      placementsByDay.set(dayId, ids)
    }
    for (const day of plan.days) {
      for (const id of placementsByDay.get(day.id) ?? []) {
        if (!order.has(id)) order.set(id, order.size)
      }
    }
    const orderedTopics = [...plan.outlines].sort(
      (a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity) || a.id - b.id,
    )

    const counts = new Map<string, number>()
    for (const topic of orderedTopics) {
      // Each class owns its topics. Compare identical contents without merging records.
      const identity = JSON.stringify([topic.title.trim(), topic.desc?.trim() ?? ''])
      const occurrence = (counts.get(identity) ?? 0) + 1
      counts.set(identity, occurrence)
      const key = JSON.stringify([identity, occurrence])
      let row = result.get(key)
      if (!row) {
        row = { key, topic, topics: new Map(), sessions: new Map() }
        result.set(key, row)
      }
      row.sessions.set(
        course.id,
        (byTopic.get(topic.id) ?? []).sort((a, b) => a.number - b.number),
      )
      row.topics.set(course.id, topic)
    }
  }
  return [...result.values()]
}

function matches(position: OutlineContentPosition, row: OutlineScheduleRow) {
  return [...row.topics.values()].some((topic) => position.outlineIds.includes(topic.id))
}

export function resolveContentPositions(
  rows: OutlineScheduleRow[],
  plans: ReadonlyMap<number, OutlineClassPlan>,
  saved: OutlineContentPosition[],
): OutlineContentPosition[] {
  return rows.map((row, index) => {
    const existing = saved.find((position) => matches(position, row))
    if (existing)
      return { ...existing, outlineIds: [...row.topics.values()].map((topic) => topic.id) }
    const source = plans.get(row.topic.fk_course)
    const dayIds = new Set(
      source?.placements
        .filter((placement) => placement.outlineId === row.topic.id)
        .map((placement) => placement.dayId),
    )
    const dayIndex = source?.days.findIndex((day) => dayIds.has(day.id)) ?? -1
    return {
      outlineIds: [...row.topics.values()].map((topic) => topic.id),
      dayIndex: dayIndex < 0 ? null : dayIndex,
      position: index,
    }
  })
}

export function readContentPositions(json: string | null): OutlineContentPosition[] {
  if (!json) return []
  try {
    const value: unknown = JSON.parse(json)
    if (!Array.isArray(value)) return []
    const seen = new Set<number>()
    const result: OutlineContentPosition[] = []
    for (const item of value) {
      if (
        !item ||
        !Array.isArray(item.outlineIds) ||
        !item.outlineIds.length ||
        !item.outlineIds.every(
          (id: unknown) => typeof id === 'number' && Number.isSafeInteger(id) && id > 0,
        ) ||
        new Set(item.outlineIds).size !== item.outlineIds.length ||
        item.outlineIds.some((id: number) => seen.has(id)) ||
        (item.dayIndex !== null && (!Number.isInteger(item.dayIndex) || item.dayIndex < 0)) ||
        !Number.isInteger(item.position) ||
        item.position < 0
      )
        return []
      item.outlineIds.forEach((id: number) => seen.add(id))
      result.push({
        outlineIds: [...item.outlineIds],
        dayIndex: item.dayIndex,
        position: item.position,
      })
    }
    return result
  } catch {
    return []
  }
}

export function buildOutlineGroups(
  rows: OutlineScheduleRow[],
  plans: ReadonlyMap<number, OutlineClassPlan>,
  dayNames: string[],
  positions: OutlineContentPosition[],
): OutlinePlanningGroup[] {
  const groups: OutlinePlanningGroup[] = dayNames.map((_, dayIndex) => ({
    key: `day-${dayIndex}`,
    dayIndex,
    label: `${dayIndex + 1}. Tag`,
    rows: [],
  }))
  const unassigned: OutlinePlanningGroup = {
    key: 'unassigned',
    dayIndex: null,
    label: 'Nicht zugeordnet',
    rows: [],
  }
  const order = new Map<string, number>()
  for (const [index, row] of rows.entries()) {
    const saved = positions.find((position) => matches(position, row))
    let dayIndex = saved?.dayIndex
    if (dayIndex === undefined) {
      const source = plans.get(row.topic.fk_course)
      const dayIds = new Set(
        source?.placements
          .filter((placement) => placement.outlineId === row.topic.id)
          .map((placement) => placement.dayId),
      )
      const original = source?.days.findIndex((day) => dayIds.has(day.id)) ?? -1
      dayIndex = original < 0 ? null : original
    }
    const group = dayIndex !== null ? (groups[dayIndex] ?? unassigned) : unassigned
    group.rows.push(row)
    order.set(row.key, saved?.position ?? index)
  }
  for (const group of [...groups, unassigned])
    group.rows.sort((a, b) => order.get(a.key)! - order.get(b.key)!)
  return [...groups, unassigned]
}

export function moveOutlineContent(
  groups: OutlinePlanningGroup[],
  positions: OutlineContentPosition[],
  request: MoveOutlineContentRequest,
): OutlineContentPosition[] {
  const source = groups.find((group) => group.rows.some((row) => row.key === request.key))
  const target = groups.find((group) => group.dayIndex === request.dayIndex)
  if (!source || !target || !Number.isInteger(request.index)) return positions
  const sourceIndex = source.rows.findIndex((row) => row.key === request.key)
  const item = source.rows[sourceIndex]!
  const copies = groups.map((group) => ({
    ...group,
    rows: group.rows.filter((row) => row.key !== request.key),
  }))
  const destination = copies.find((group) => group.key === target.key)!
  const index = request.index - (source.key === target.key && sourceIndex < request.index ? 1 : 0)
  destination.rows.splice(Math.max(0, Math.min(index, destination.rows.length)), 0, item)
  const dayCount = groups.filter((group) => group.dayIndex !== null).length
  return copies.flatMap((group) =>
    group.rows.map((row, position) => {
      const saved = positions.find((entry) => matches(entry, row))
      // Ausgeblendete Tage werden beim erneuten Hinzufügen eines Wochentags wiederhergestellt.
      if (
        row.key !== request.key &&
        group.dayIndex === null &&
        saved?.dayIndex !== null &&
        saved?.dayIndex !== undefined &&
        saved.dayIndex >= dayCount
      )
        return saved
      return {
        outlineIds: [...row.topics.values()].map((topic) => topic.id),
        dayIndex: group.dayIndex,
        position,
      }
    }),
  )
}
