<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import Svg from '@/components/ui/Svg.vue'
import Divider from '@/components/ui/Divider.vue'
import OutlineClassSchedule from './OutlineClassSchedule.vue'
import {
  createCourseDayApi,
  deleteCourseDayApi,
  getCourseByIdApi,
  getCourseDaysApi,
  updateCourseDayApi,
  updateCourseAssessmentApi,
} from '@/api/course.api'
import {
  createGrobplanungApi,
  deleteGrobplanungApi,
  getGrobplanungenApi,
  getOutlinePlacementsApi,
  updateGrobplanungApi,
} from '@/api/grobplanung.api'
import type { Course, CourseDay, CreateCourseDayRequest } from '@/types/course'
import type {
  Grobplanung,
  OutlineClassPlan,
  OutlineContentPosition,
  MoveOutlineContentRequest,
} from '@/types/grobplanung'
import { showNotification } from '@/utils/notification'
import { showUndoableAction } from '@/utils/undoableAction'
import type { ModuleDetail } from '@/types/module'
import { courseDateKey, shiftDate, weekStart } from '@/utils/outlineWeek'
import { useAuthStore } from '@/stores/authStore'
import {
  buildOutlineGroups,
  buildOutlineRows,
  moveOutlineContent,
  readContentPositions,
  resolveContentPositions,
} from '@/utils/outlineContentLayout'

const props = defineProps<{
  courseId: number
  module: ModuleDetail
  courses: Course[]
  planningOnly?: boolean
  disabled?: boolean
  selectedWeekdays?: string[]
}>()
const week = defineModel<string | null>('week', { required: true })
const emit = defineEmits<{ busy: [value: boolean]; addClass: [] }>()

type Editor =
  | {
      kind: 'day'
      id: number | null
      courseId: number
      calendarIndex?: number
      originalDate: string
      fields: CreateCourseDayRequest & { date: string }
    }
  | {
      kind: 'topic'
      id: number | null
      title: string
      desc: string
      dayId: number | null
      courseId: number
      logicalDayIndex: number | null
    }
  | { kind: 'assessment'; value: string }

const storedPlans = shallowRef(new Map<number, OutlineClassPlan>())
const hiddenTopics = ref(new Set<number>())
const hiddenDays = ref(new Set<number>())
const contentDragging = ref(false)
const plans = computed(
  () =>
    new Map(
      Array.from(storedPlans.value, ([id, plan]) => [
        id,
        {
          days: plan.days.filter((day) => !hiddenDays.value.has(day.id)),
          outlines: plan.outlines.filter((topic) => !hiddenTopics.value.has(topic.id)),
          placements: plan.placements.filter(
            (placement) =>
              !hiddenDays.value.has(placement.dayId) &&
              !hiddenTopics.value.has(placement.outlineId),
          ),
        },
      ]),
    ),
)
const plan = computed(() => plans.value.get(props.courseId))
const days = computed(() => plan.value?.days ?? [])
let active = true
onBeforeUnmount(() => {
  active = false
})
const assessment = ref<string | null>(null)
const editor = ref<Editor | null>(null)
const editingClass = computed(() => {
  const form = editor.value
  return form?.kind === 'day' || form?.kind === 'topic'
    ? props.courses.find((course) => course.id === form.courseId)?.title
    : undefined
})
const editorForm = ref<HTMLFormElement | null>(null)
watch(editorForm, (form) => form?.querySelector('input')?.focus())
const busy = ref(false)
const loadError = ref('')
const actionError = ref('')
const locked = computed(
  () => busy.value || editor.value !== null || props.disabled || (!plan.value && !!loadError.value),
)
watch(
  () => busy.value || editor.value !== null || contentDragging.value,
  (value) => emit('busy', value),
  { flush: 'sync' },
)
const authStore = useAuthStore()
const contentPositions = ref<OutlineContentPosition[]>([])
const contentStorageKey = computed(
  () => `cadence.outline-content.${authStore.user?.id ?? 'local'}.${props.module.id}`,
)
watch(
  contentStorageKey,
  (key) => {
    try {
      contentPositions.value = readContentPositions(localStorage.getItem(key))
    } catch {
      contentPositions.value = []
    }
  },
  { immediate: true },
)
const contentRows = computed(() => buildOutlineRows(props.courses, plans.value))
const dayNames = computed(() => props.selectedWeekdays ?? days.value.map(() => ''))
const resolvedPositions = computed(() =>
  resolveContentPositions(contentRows.value, plans.value, contentPositions.value),
)
const planningGroups = computed(() =>
  buildOutlineGroups(contentRows.value, plans.value, dayNames.value, resolvedPositions.value),
)

function persistContentPositions() {
  try {
    localStorage.setItem(contentStorageKey.value, JSON.stringify(contentPositions.value))
  } catch {
    actionError.value = 'Die Inhaltsanordnung konnte nicht dauerhaft im Browser gespeichert werden.'
    showNotification(actionError.value)
  }
}

function moveContent(request: MoveOutlineContentRequest) {
  if (locked.value) return
  const previous = resolvedPositions.value.map((position) => ({
    ...position,
    outlineIds: [...position.outlineIds],
  }))
  const next = moveOutlineContent(planningGroups.value, resolvedPositions.value, request)
  if (next === resolvedPositions.value || JSON.stringify(previous) === JSON.stringify(next)) return
  const key = contentStorageKey.value
  contentPositions.value = next
  actionError.value = ''
  persistContentPositions()
  if (actionError.value) return
  showNotification('Inhalt verschoben.', () => {
    localStorage.setItem(key, JSON.stringify(previous))
    if (active && contentStorageKey.value === key) contentPositions.value = previous
    showNotification('Verschiebung rückgängig gemacht.')
  })
}

function addUnassignedTopic() {
  editTopic()
}
defineExpose({ addUnassignedTopic })
const dayNumbers = computed(() => new Map(days.value.map((day, index) => [day.id, index + 1])))

function dayLabel(id: number) {
  return `Tag ${dayNumbers.value.get(id)}`
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Anfrage fehlgeschlagen.'
}

async function fetchClassPlan(id: number): Promise<OutlineClassPlan> {
  const [days, outlines, placements] = await Promise.all([
    getCourseDaysApi(id),
    getGrobplanungenApi(id),
    getOutlinePlacementsApi(id),
  ])
  return { days, outlines, placements }
}

async function refresh() {
  const otherCourses = props.courses.filter((course) => course.id !== props.courseId)
  const [course, selected, otherPlans] = await Promise.all([
    getCourseByIdApi(props.courseId),
    fetchClassPlan(props.courseId),
    Promise.allSettled(otherCourses.map((other) => fetchClassPlan(other.id))),
  ])
  if (!active) return

  const result = new Map<number, OutlineClassPlan>([[props.courseId, selected]])
  for (const [index, response] of otherPlans.entries()) {
    const other = otherCourses[index]
    if (other && response.status === 'fulfilled') result.set(other.id, response.value)
  }
  assessment.value = course.assessment ?? null
  storedPlans.value = result

  if (!week.value) {
    const dates = Array.from(result.values()).flatMap((plan) =>
      plan.days
        .map((day) => courseDateKey(day.date))
        .filter((date): date is string => date !== null),
    )
    const firstDate = dates.sort()[0] ?? courseDateKey(new Date())
    if (firstDate) week.value = weekStart(firstDate)
  }
}

function navigateWeek(offset: number) {
  if (week.value) week.value = shiftDate(week.value, offset)
}

async function load() {
  if (busy.value) return
  busy.value = true
  loadError.value = actionError.value = ''
  try {
    await refresh()
  } catch (error) {
    loadError.value = errorMessage(error)
  } finally {
    busy.value = false
  }
}

onMounted(load)

async function save(write: () => Promise<unknown>, message: string) {
  if (busy.value) return
  busy.value = true
  actionError.value = ''
  try {
    await write()
    editor.value = null
    if (!actionError.value) showNotification(message)
  } catch (error) {
    actionError.value = errorMessage(error)
    showNotification(actionError.value)
    // Bei mehreren Schreibschritten bleiben bereits angelegte Datensätze sichtbar.
    try {
      await refresh()
    } catch {
      /* Der ursprüngliche Schreibfehler bleibt sichtbar. */
    }
    busy.value = false
    return
  }
  try {
    await refresh()
  } catch (error) {
    loadError.value = errorMessage(error)
  } finally {
    busy.value = false
  }
}

function openEditor(next: Editor) {
  if (locked.value) return
  actionError.value = ''
  editor.value = next
}

function closeEditor() {
  if (busy.value) return
  editor.value = null
  actionError.value = ''
}

function editDay(day?: CourseDay, courseId = props.courseId, calendarIndex?: number) {
  const date = day ? (courseDateKey(day.date) ?? '') : ''
  openEditor({
    kind: 'day',
    id: day?.id ?? null,
    courseId: day?.courseId ?? courseId,
    calendarIndex,
    originalDate: date,
    fields: {
      date,
      startTime: day?.startTime.slice(0, 5) ?? '08:15',
      endTime: day?.endTime.slice(0, 5) ?? '11:45',
    },
  })
}

async function saveCalendarDay(
  form: Extract<Editor, { kind: 'day' }>,
  fields: CreateCourseDayRequest,
) {
  if (form.id !== null) return updateCourseDayApi(form.courseId, form.id, fields)
  if (form.calendarIndex === undefined) return createCourseDayApi(form.courseId, fields)
  const existing = await getCourseDaysApi(form.courseId)
  while (existing.length < form.calendarIndex) {
    existing.push(
      await createCourseDayApi(form.courseId, {
        date: null,
        startTime: fields.startTime,
        endTime: fields.endTime,
      }),
    )
  }
  const target = existing[form.calendarIndex]
  if (target) {
    if (courseDateKey(target.date))
      throw new Error(
        'Für diesen Tag wurde inzwischen ein Termin erfasst. Bitte den aktuellen Stand neu laden.',
      )
    return updateCourseDayApi(form.courseId, target.id, fields)
  }
  return createCourseDayApi(form.courseId, fields)
}

function addDayForClass(courseId: number, dayIndex?: number) {
  editDay(undefined, courseId, dayIndex)
}

function editTopic(
  outline?: Grobplanung,
  dayId: number | null = null,
  logicalDayIndex: number | null = null,
) {
  openEditor({
    kind: 'topic',
    id: outline?.id ?? null,
    title: outline?.title ?? '',
    desc: outline?.desc ?? '',
    dayId,
    courseId: outline?.fk_course ?? props.courseId,
    logicalDayIndex,
  })
}

function submit() {
  const form = editor.value
  if (!form) return
  if (form.kind === 'day') {
    const { id, fields } = form
    if (fields.endTime <= fields.startTime) {
      actionError.value = 'Die Endzeit muss nach der Startzeit liegen.'
      showNotification(actionError.value)
      return
    }
    const { date, ...times } = fields
    const data = { ...times, date: date || null }
    void save(
      () => saveCalendarDay(form, id !== null && date === form.originalDate ? times : data),
      'Kurstag gespeichert.',
    )
  } else if (form.kind === 'topic') {
    if (!form.title.trim()) return
    const data = { title: form.title.trim(), desc: form.desc.trim() || null }
    const id = form.id
    void save(
      () =>
        id === null
          ? createGrobplanungApi({
              ...data,
              fk_course: form.courseId,
              dayId: null,
            }).then((outline) => {
              const group = planningGroups.value.find((group) => group.dayIndex === null)
              contentPositions.value = [
                ...resolvedPositions.value,
                {
                  outlineIds: [outline.id],
                  dayIndex: null,
                  position: group?.rows.length ?? 0,
                },
              ]
              persistContentPositions()
              return outline
            })
          : updateGrobplanungApi(id, data),
      'Thema gespeichert.',
    )
  } else if (form.kind === 'assessment') {
    void save(
      () => updateCourseAssessmentApi(props.courseId, form.value.trim() || null),
      'Kurskontrolle gespeichert.',
    )
  }
}

function removeDay(day: CourseDay) {
  if (busy.value || hiddenDays.value.has(day.id)) return
  const currentUser = authStore.user?.id
  hiddenDays.value.add(day.id)
  editor.value = null
  showUndoableAction({
    message: 'Unterrichtstermin entfernt.',
    undoMessage: 'Unterrichtstermin wiederhergestellt.',
    undo: () => {
      hiddenDays.value.delete(day.id)
    },
    commit: async () => {
      if (authStore.user?.id !== currentUser) throw new Error('Die Sitzung hat sich geändert.')
      await deleteCourseDayApi(day.courseId, day.id)
      if (active) {
        try {
          await refresh()
          hiddenDays.value.delete(day.id)
        } catch {
          showNotification('Termin gelöscht. Die Anzeige konnte nicht neu geladen werden.')
        }
      }
    },
  })
}
function removeLastDay() {
  const day = days.value.at(-1)
  if (day) removeDay(day)
}
function removeEditingDay() {
  const form = editor.value
  if (form?.kind !== 'day' || form.id === null) return
  const day = storedPlans.value.get(form.courseId)?.days.find((day) => day.id === form.id)
  if (day) removeDay(day)
}
function removeTopic(id: number) {
  const topic = Array.from(storedPlans.value.values())
    .flatMap((plan) => plan.outlines)
    .find((topic) => topic.id === id)
  if (!topic || busy.value || hiddenTopics.value.has(id)) return
  const currentUser = authStore.user?.id
  hiddenTopics.value.add(id)
  editor.value = null
  showUndoableAction({
    message: 'Thema entfernt.',
    undoMessage: 'Thema wiederhergestellt.',
    undo: () => {
      hiddenTopics.value.delete(id)
    },
    commit: async () => {
      if (authStore.user?.id !== currentUser) throw new Error('Die Sitzung hat sich geändert.')
      await deleteGrobplanungApi(id)
      if (active) {
        try {
          await refresh()
          hiddenTopics.value.delete(id)
        } catch {
          showNotification('Thema gelöscht. Die Anzeige konnte nicht neu geladen werden.')
        }
      }
    },
  })
}
const field =
  'min-w-0 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-2.5 py-2 text-sm focus-visible:outline focus-visible:outline-[var(--primary-color)]'
const button =
  'cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 text-sm font-semibold hover:border-[var(--primary-color)] disabled:opacity-50'
</script>

<template>
  <p v-if="loadError" role="alert" class="text-[var(--error-color)]">
    {{ loadError }}
    <button type="button" class="underline" :disabled="busy" @click="load()">Erneut laden</button>
  </p>
  <p v-if="busy && !plan" role="status">Grobplanung wird geladen …</p>
  <div
    v-if="plan || !busy"
    :aria-busy="busy"
    class="grid w-full grid-cols-1 lg:grid-cols-4"
    :class="
      planningOnly
        ? ''
        : 'rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4 shadow-lg sm:p-5'
    "
  >
    <section
      v-if="!planningOnly"
      class="mb-6 min-w-0 lg:col-span-2 lg:mb-0 lg:border-r lg:border-[var(--border-color)] lg:px-3 lg:pr-6"
    >
      <h2>Organisatorisch</h2>
      <Divider color="var(--border-color)" class="my-3" />
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <span class="font-semibold text-[var(--text-color-light)]">Kurstage</span>
        <div class="flex flex-wrap items-center gap-2 sm:col-span-2">
          <div
            class="flex w-fit items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] px-2 py-1"
          >
            <button
              type="button"
              class="cursor-pointer px-1 disabled:opacity-40"
              aria-label="Letzten Kurstag löschen"
              :disabled="locked || !days.length"
              @click="removeLastDay"
            >
              −
            </button>
            <span class="font-bold">{{ days.length }}</span>
          </div>
        </div>
      </div>

      <Divider color="var(--border-color)" class="my-3" />
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <span class="font-semibold text-[var(--text-color-light)]">Reihenfolge</span>
        <div class="flex flex-wrap items-center gap-2 sm:col-span-2">
          <div
            v-for="day in days"
            :key="day.id"
            class="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] px-2.5 py-1 text-sm"
          >
            <button
              type="button"
              class="cursor-pointer font-semibold hover:underline disabled:opacity-50"
              :disabled="locked"
              :aria-label="`Kurstag bearbeiten: ${dayLabel(day.id)}`"
              @click="editDay(day)"
            >
              {{ dayLabel(day.id) }}
            </button>
            <button
              type="button"
              class="cursor-pointer px-1 text-[var(--text-color-light)] disabled:opacity-40"
              :disabled="locked"
              :aria-label="`Kurstag löschen: ${dayLabel(day.id)}`"
              @click="removeDay(day)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!planningOnly" class="min-w-0 lg:col-span-2 lg:px-3 lg:pl-6">
      <h2>Inhalt</h2>
      <Divider color="var(--border-color)" class="my-3" />
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <span class="font-semibold text-[var(--text-color-light)]">Modul</span>
        <RouterLink
          :to="`/moduledetail/${module.id}`"
          class="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-light)] hover:text-[var(--text-color)] sm:col-span-2"
        >
          <span
            class="shrink-0 rounded-sm bg-[var(--background-color)] px-2 py-1 text-xs font-bold"
            >{{ module.code }}</span
          >
          {{ module.title }}
          <Svg class="shrink-0"><i class="fa-solid fa-arrow-up-right-from-square"></i></Svg>
        </RouterLink>
      </div>
      <Divider color="var(--border-color)" class="my-3" />
      <div class="grid grid-cols-1 items-center gap-2 sm:grid-cols-3">
        <span class="font-semibold text-[var(--text-color-light)]">Kurskontrolle</span>
        <button
          type="button"
          :class="button"
          :disabled="locked"
          class="flex items-center gap-1 text-left sm:col-span-2"
          @click="openEditor({ kind: 'assessment', value: assessment ?? '' })"
        >
          <Svg><i class="fa-regular fa-file"></i></Svg>
          {{ assessment || 'Kurskontrolle erfassen' }}
        </button>
      </div>
    </section>

    <Divider v-if="!planningOnly" color="var(--border-color)" class="col-span-full my-3" />
    <section class="col-span-full min-w-0">
      <OutlineClassSchedule
        v-if="week"
        :courses="courses"
        :plans="plans"
        :week="week"
        :locked="locked"
        :active-course-id="courseId"
        :day-names="dayNames"
        :planning-groups="planningGroups"
        :drag-group="contentStorageKey"
        @dragging="contentDragging = $event"
        @move-content="moveContent"
        @navigate="navigateWeek"
        @add-class="emit('addClass')"
        @edit-day="editDay"
        @reload="load"
        @edit-topic="editTopic"
        @add-day="addDayForClass"
      />

      <form
        v-if="editor"
        ref="editorForm"
        class="mt-4 rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] p-4"
        @submit.prevent="submit"
        @keydown.esc.prevent="closeEditor"
      >
        <fieldset :disabled="busy">
          <legend class="mb-2 text-sm font-semibold">
            <template v-if="editor.kind === 'day'">{{
              editor.id === null ? 'Kurstag hinzufügen' : 'Kurstag bearbeiten · ' + editingClass
            }}</template>
            <template v-else-if="editor.kind === 'topic'">{{
              (editor.id === null ? 'Thema hinzufügen' : 'Thema bearbeiten') + ' · ' + editingClass
            }}</template>
            <template v-else-if="editor.kind === 'assessment'">Kurskontrolle bearbeiten</template>
          </legend>
          <p v-if="actionError" role="alert" class="mb-2 text-sm text-[var(--error-color)]">
            {{ actionError }}
          </p>

          <div v-if="editor.kind === 'day'" class="flex flex-wrap gap-3">
            <label class="grid gap-1 text-sm">
              Datum (optional)
              <input v-model="editor.fields.date" type="date" max="2038-01-19" :class="field" />
            </label>
            <label class="grid gap-1 text-sm"
              >Startzeit
              <input v-model="editor.fields.startTime" type="time" required :class="field"
            /></label>
            <label class="grid gap-1 text-sm"
              >Endzeit <input v-model="editor.fields.endTime" type="time" required :class="field"
            /></label>
          </div>
          <div v-else-if="editor.kind === 'topic'" class="grid max-w-lg min-w-0 gap-3">
            <label class="grid gap-1 text-sm"
              >Titel
              <input
                v-model="editor.title"
                required
                maxlength="100"
                pattern=".*\S.*"
                :class="field"
            /></label>
            <label class="grid gap-1 text-sm"
              >Beschreibung
              <textarea v-model="editor.desc" rows="2" maxlength="255" :class="field" />
            </label>
          </div>
          <label v-else-if="editor.kind === 'assessment'" class="grid max-w-lg gap-1 text-sm">
            Bezeichnung
            <input
              v-model="editor.value"
              maxlength="100"
              placeholder="z. B. Theoretische Prüfung"
              :class="field"
            />
          </label>
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="submit" :class="button" class="bg-[var(--secondary-color-light)]!">
              Speichern
            </button>
            <button type="button" :class="button" @click="closeEditor">Abbrechen</button>
            <button
              v-if="editor.kind === 'day' && editor.id !== null"
              type="button"
              :class="button"
              class="text-[var(--error-color)]"
              @click="removeEditingDay"
            >
              Unterrichtstermin löschen
            </button>
            <button
              v-if="editor.kind === 'topic' && editor.id !== null"
              type="button"
              :class="button"
              class="text-[var(--error-color)]"
              @click="removeTopic(editor.id)"
            >
              Thema löschen
            </button>
          </div>
        </fieldset>
      </form>

      <p v-if="!days.length" class="mt-3 text-sm text-[var(--text-color-light)]">
        Für diese Klasse sind noch keine Kurstage erfasst.
      </p>
    </section>
  </div>
</template>
