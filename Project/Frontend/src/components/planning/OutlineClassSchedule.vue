<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import Draggable from 'vuedraggable'
import Svg from '@/components/ui/Svg.vue'
import type { Course, CourseDay } from '@/types/course'
import type {
  Grobplanung,
  OutlineClassPlan,
  OutlinePlanningGroup,
  OutlineScheduleRow,
  MoveOutlineContentRequest,
} from '@/types/grobplanung'
import {
  courseDateKey,
  shiftDate,
  shortCourseDate,
  weekLabel,
  weekNumber,
} from '@/utils/outlineWeek'
import { buildOutlineGroups, buildOutlineRows } from '@/utils/outlineContentLayout'
const props = defineProps<{
  courses: Course[]
  plans: ReadonlyMap<number, OutlineClassPlan>
  week: string
  locked: boolean
  activeCourseId?: number
  dayNames?: string[]
  planningGroups?: OutlinePlanningGroup[]
  dragGroup?: string
}>()
const emit = defineEmits<{
  navigate: [offset: number]
  addClass: []
  editDay: [day: CourseDay]
  reload: []
  editTopic: [topic: Grobplanung]
  addDay: [courseId: number, dayIndex?: number]
  moveContent: [request: MoveOutlineContentRequest]
  dragging: [value: boolean]
}>()
const rows = computed(() => buildOutlineRows(props.courses, props.plans))
const groups = computed(
  () =>
    props.planningGroups ?? buildOutlineGroups(rows.value, props.plans, props.dayNames ?? [], []),
)
const dragLists = ref<Record<string, OutlineScheduleRow[]>>({})
const dragging = ref(false)
const dragContext = ref<{ key: string; groupKey: string; oldIndex: number } | null>(null)
function syncDragLists() {
  dragLists.value = Object.fromEntries(groups.value.map((group) => [group.key, [...group.rows]]))
}
watch(
  groups,
  () => {
    if (!dragging.value) syncDragLists()
  },
  { immediate: true },
)
function updateDragList(key: string, rows: OutlineScheduleRow[]) {
  dragLists.value[key] = rows
}
function startDrag(event: {
  item: HTMLElement
  from: HTMLElement
  oldDraggableIndex?: number
  oldIndex?: number
}) {
  const key = event.item.dataset.contentKey,
    groupKey = event.from.dataset.planningGroup
  if (
    props.locked ||
    !key ||
    !groupKey ||
    !groups.value.some(
      (group) => group.key === groupKey && group.rows.some((row) => row.key === key),
    )
  )
    return
  dragContext.value = { key, groupKey, oldIndex: event.oldDraggableIndex ?? event.oldIndex ?? 0 }
  dragging.value = true
  emit('dragging', true)
}
async function finishDrag(event: {
  to: HTMLElement
  newDraggableIndex?: number
  newIndex?: number
}) {
  const context = dragContext.value,
    target = groups.value.find((group) => group.key === event.to.dataset.planningGroup),
    newIndex = event.newDraggableIndex ?? event.newIndex
  try {
    if (props.locked || !context || !target || newIndex === undefined) return
    if (context.groupKey === target.key && context.oldIndex === newIndex) return
    // Sortable liefert den Index nach dem Entfernen; das Layout erwartet die ursprüngliche Lücke.
    const index =
      newIndex + (context.groupKey === target.key && context.oldIndex < newIndex ? 1 : 0)
    emit('moveContent', { key: context.key, dayIndex: target.dayIndex, index })
  } finally {
    dragging.value = false
    dragContext.value = null
    emit('dragging', false)
    await nextTick()
    syncDragLists()
  }
}
function stepContent(
  row: OutlineScheduleRow,
  group: OutlinePlanningGroup,
  index: number,
  offset: number,
) {
  if (props.locked || index + offset < 0 || index + offset >= group.rows.length) return
  emit('moveContent', {
    key: row.key,
    dayIndex: group.dayIndex,
    index: index + (offset > 0 ? 2 : -1),
  })
}
function moveWithSelect(row: OutlineScheduleRow, event: Event) {
  const select = event.currentTarget as HTMLSelectElement,
    value = select.value
  select.value = ''
  if (!value || props.locked) return
  const dayIndex = value === 'unassigned' ? null : Number(value),
    group = groups.value.find((group) => group.dayIndex === dayIndex)
  if (group) emit('moveContent', { key: row.key, dayIndex, index: group.rows.length })
}
const sunday = computed(() => shiftDate(props.week, 6)),
  friday = computed(() => shiftDate(props.week, 4))
const failedCourses = computed(() => props.courses.filter((course) => !props.plans.has(course.id)))
function isInWeek(date: string | null) {
  return date !== null && date >= props.week && date <= sunday.value
}
const visibleRange = computed(() => {
  const weekend = props.courses.some((course) =>
    props.plans.get(course.id)?.days.some((day) => {
      const date = courseDateKey(day.date)
      return isInWeek(date) && date! > friday.value
    }),
  )
  return weekLabel(props.week, weekend ? sunday.value : friday.value)
})
function dayAt(courseId: number, dayIndex: number | null) {
  return dayIndex === null ? undefined : props.plans.get(courseId)?.days[dayIndex]
}
function dayLabel(day: CourseDay) {
  const date = courseDateKey(day.date)
  return date ? shortCourseDate(date) : 'Datum setzen'
}
function clickSession(day: CourseDay) {
  if (!props.locked && !dragging.value) emit('editDay', day)
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h2>Planung</h2>
    <div class="flex flex-wrap items-center gap-3">
      <span class="flex items-center gap-1.5 text-xs text-[var(--text-color-light)]">
        <span class="size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true"></span>
        Termine der gewählten Woche
      </span>
      <div
        class="flex items-center divide-x divide-[var(--border-color)] rounded-lg border border-[var(--border-color)] text-sm"
      >
        <button
          type="button"
          aria-label="Vorherige Woche"
          :disabled="locked || dragging"
          class="cursor-pointer px-2.5 py-1.5 text-lg leading-none disabled:opacity-40"
          @click="emit('navigate', -7)"
        >
          ‹
        </button>
        <div class="flex items-center gap-2 px-2.5 py-1.5 font-semibold" aria-live="polite">
          <Svg><i class="fa-regular fa-calendar" aria-hidden="true"></i></Svg>
          <span>{{ visibleRange }}</span>
          <span class="whitespace-nowrap font-medium text-[var(--text-color-light)]"
            >KW {{ weekNumber(week) }}</span
          >
        </div>
        <button
          type="button"
          aria-label="Nächste Woche"
          :disabled="locked || dragging"
          class="cursor-pointer px-2.5 py-1.5 text-lg leading-none disabled:opacity-40"
          @click="emit('navigate', 7)"
        >
          ›
        </button>
      </div>
    </div>
  </div>

  <p class="mt-3 flex items-center gap-1 text-xs text-[var(--text-color-light)]">
    <Svg><i class="fa-solid fa-circle-info" aria-hidden="true"></i></Svg>Themen am Griff zwischen
    die Tagesbereiche ziehen. Die Klassentermine bleiben am jeweiligen Tag.
  </p>

  <p v-if="!dayNames?.length" class="mt-3 text-sm text-[var(--text-color-light)]">
    Oben unter Daten einen Wochentag auswählen, um einen Tagesbereich anzuzeigen.
  </p>

  <p v-if="failedCourses.length" role="alert" class="mt-3 text-sm text-[var(--error-color)]">
    Termine konnten nicht geladen werden für
    {{ failedCourses.map((course) => course.title).join(', ') }}.
    <button
      type="button"
      class="ml-1 underline"
      :disabled="locked || dragging"
      @click="emit('reload')"
    >
      Erneut laden
    </button>
  </p>

  <div class="mt-3 max-w-full overflow-x-auto rounded-lg border border-[var(--border-color)]">
    <table
      aria-label="Unterrichtstermine nach Klasse"
      class="w-full border-collapse text-left text-sm [&_th]:px-3 [&_th]:py-2.5 [&_td]:px-3 [&_td]:py-2.5"
    >
      <colgroup>
        <col style="width: 5rem" />
        <col />
        <col v-for="course in courses" :key="course.id" />
        <col />
      </colgroup>
      <thead class="bg-[var(--background-color)]">
        <tr
          class="[&>th]:border-r [&>th]:border-[var(--border-color)] [&>th:last-child]:border-r-0"
        >
          <th scope="col" class="w-20 whitespace-nowrap">Lektion</th>
          <th scope="col" class="min-w-[12rem] sm:min-w-[18rem]">Inhalt</th>
          <th
            v-for="course in courses"
            :key="course.id"
            scope="col"
            class="min-w-[8rem] whitespace-nowrap"
          >
            {{ course.title }}
          </th>
          <th scope="col" class="w-px">
            <button
              type="button"
              aria-label="Klasse zum Modul hinzufügen"
              :disabled="locked || dragging"
              class="size-7 cursor-pointer rounded border border-dashed border-[var(--border-color)] bg-[var(--surface-color)] disabled:opacity-40"
              @click="emit('addClass')"
            >
              +
            </button>
          </th>
        </tr>
      </thead>
      <tbody
        v-for="group in groups"
        :key="group.key"
        :data-planning-day="group.dayIndex ?? 'unassigned'"
      >
        <tr class="border-y border-[var(--border-color)] bg-[var(--background-color)]">
          <th :colspan="courses.length + 3" scope="rowgroup">{{ group.label }}</th>
        </tr>
        <tr
          class="[&>td]:border-r [&>td]:border-[var(--border-color)] [&>td:last-child]:border-r-0"
        >
          <td colspan="2" class="p-0! align-top">
            <div class="relative">
              <Draggable
                :model-value="dragLists[group.key] ?? []"
                :group="dragGroup ?? 'outline-content'"
                item-key="key"
                tag="div"
                :data-planning-group="group.key"
                :aria-label="`Inhalte ${group.label}`"
                role="list"
                handle=".drag-handle"
                :animation="180"
                :disabled="locked"
                :force-fallback="true"
                :fallback-on-body="true"
                :empty-insert-threshold="50"
                :swap-threshold="0.65"
                ghost-class="planning-ghost"
                chosen-class="planning-chosen"
                drag-class="planning-drag"
                fallback-class="planning-drag"
                class="day-drop-zone min-h-24"
                :class="
                  dragging
                    ? 'bg-[var(--primary-color-light)] outline -outline-offset-2 outline-dashed outline-[var(--primary-color)]'
                    : ''
                "
                @update:model-value="updateDragList(group.key, $event)"
                @start="startDrag"
                @end="finishDrag"
              >
                <template
                  #item="{ element: row, index }: { element: OutlineScheduleRow; index: number }"
                >
                  <div
                    :data-content-key="row.key"
                    role="listitem"
                    class="topic-row grid grid-cols-[5rem_minmax(0,1fr)] border-b border-[var(--border-color)] last:border-b-0"
                  >
                    <span
                      class="flex items-center justify-center border-r border-[var(--border-color)] px-2 py-3 font-semibold"
                      >{{ index + 1 }}</span
                    >
                    <div class="p-2.5">
                      <div
                        class="topic-card flex items-start justify-between gap-2 rounded-md border border-dashed border-[var(--border-color)] bg-[var(--surface-color)] p-2"
                      >
                        <button
                          type="button"
                          :disabled="locked"
                          :aria-label="`Thema verschieben: ${row.topic.title}`"
                          class="drag-handle size-8 shrink-0 cursor-grab touch-none active:cursor-grabbing disabled:opacity-40"
                          @keydown.up.prevent="stepContent(row, group, index, -1)"
                          @keydown.down.prevent="stepContent(row, group, index, 1)"
                        >
                          ⠿
                        </button>
                        <div class="min-w-0 flex-1">
                          <p class="font-semibold wrap-anywhere">{{ row.topic.title }}</p>
                          <p
                            v-if="row.topic.desc"
                            class="text-xs whitespace-pre-line wrap-anywhere text-[var(--text-color-light)]"
                          >
                            {{ row.topic.desc }}
                          </p>
                          <select
                            :disabled="locked || dragging"
                            :aria-label="`Inhalt verschieben: ${row.topic.title}`"
                            class="mt-2 max-w-full cursor-pointer rounded border border-[var(--border-color)] bg-[var(--surface-color)] px-1 py-0.5 text-xs text-[var(--text-color-light)] disabled:opacity-40"
                            @change="moveWithSelect(row, $event)"
                          >
                            <option value="">Verschieben …</option>
                            <option
                              v-for="target in groups"
                              :key="target.key"
                              :value="target.dayIndex ?? 'unassigned'"
                            >
                              {{ target.label }}
                            </option>
                          </select>
                        </div>
                        <button
                          type="button"
                          :disabled="locked || dragging"
                          :aria-label="`Thema bearbeiten: ${row.topic.title}`"
                          class="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-[var(--border-color)] disabled:opacity-40"
                          @click="
                            emit('editTopic', row.topics.get(activeCourseId ?? 0) ?? row.topic)
                          "
                        >
                          <Svg><i class="fa-solid fa-pen" aria-hidden="true"></i></Svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </Draggable>
              <div
                v-if="!dragLists[group.key]?.length"
                class="pointer-events-none absolute inset-0 grid grid-cols-[5rem_minmax(0,1fr)] text-xs text-[var(--text-color-light)]"
              >
                <span class="flex items-center justify-center border-r border-[var(--border-color)]"
                  >–</span
                ><span class="flex items-center justify-center p-4">Thema hierher ziehen</span>
              </div>
            </div>
          </td>
          <td v-for="course in courses" :key="course.id" class="align-top">
            <div v-if="dayAt(course.id, group.dayIndex)" class="flex flex-col items-start gap-2">
              <button
                type="button"
                :disabled="locked || dragging"
                :aria-label="`${course.title}, ${group.label}, ${dayLabel(dayAt(course.id, group.dayIndex)!)}: Termin bearbeiten`"
                class="flex cursor-pointer items-center gap-1.5 rounded border px-2 py-1 text-xs font-semibold whitespace-nowrap disabled:opacity-40"
                :class="
                  isInWeek(courseDateKey(dayAt(course.id, group.dayIndex)!.date))
                    ? 'border-amber-400/50 bg-amber-400/15 text-[var(--text-color)]'
                    : 'border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color-light)]'
                "
                @click="clickSession(dayAt(course.id, group.dayIndex)!)"
              >
                <span
                  v-if="isInWeek(courseDateKey(dayAt(course.id, group.dayIndex)!.date))"
                  class="size-1.5 shrink-0 rounded-full bg-amber-500"
                  data-week-marker
                  aria-hidden="true"
                ></span>
                {{ dayLabel(dayAt(course.id, group.dayIndex)!) }}
              </button>
              <span class="text-xs text-[var(--text-color-light)]"
                >{{ dayAt(course.id, group.dayIndex)!.startTime.slice(0, 5) }}–{{
                  dayAt(course.id, group.dayIndex)!.endTime.slice(0, 5)
                }}</span
              >
            </div>
            <button
              v-else-if="group.dayIndex !== null"
              type="button"
              :disabled="locked || !plans.has(course.id)"
              :aria-label="`Termin für ${course.title}, ${group.label} hinzufügen`"
              class="min-h-8 cursor-pointer rounded border border-dashed border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-color-light)] disabled:opacity-40"
              @click="emit('addDay', course.id, group.dayIndex)"
            >
              + Termin
            </button>
            <span v-else class="text-[var(--text-color-light)]">–</span>
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.planning-ghost .topic-card {
  background: var(--primary-color-light);
  border: 2px dashed var(--primary-color);
  opacity: 0.45;
}
.planning-chosen .topic-card {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}
.planning-drag {
  opacity: 0.95;
}
.planning-drag .topic-card {
  border-color: var(--primary-color);
  box-shadow: 0 10px 28px #0003;
}
.day-drop-zone {
  transition: background-color 0.15s ease;
}
</style>
