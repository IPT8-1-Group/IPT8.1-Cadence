<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Draggable from 'vuedraggable'
import Svg from '@/components/ui/Svg.vue'
import Divider from '@/components/ui/Divider.vue'
import LearningObjectives from './LearningObjectives.vue'
import LessonBlock from './LessonBlock.vue'
import PlanningEntryForm from './PlanningEntryForm.vue'
import { createCourseDayApi, getCourseDaysApi } from '@/api/course.api'
import {
  createFeinplanungApi,
  deleteFeinplanungApi,
  getFeinplanungenByDayApi,
  moveFeinplanungApi,
  reorderFeinplanungApi,
  updateFeinplanungApi,
} from '@/api/feinplanung.api'
import type { CourseDay } from '@/types/course'
import type { OutlinePlanningGroup } from '@/types/grobplanung'
import type {
  CreateFeinplanungRequest,
  Feinplanung,
  FeinplanungDayResponse,
} from '@/types/feinplanung'
import { courseDate, lessonMinutes } from '@/utils/planningTime'
import {
  buildOutlineLessons,
  detailPlanningDays,
  emptyDetailDay,
  lessonTint,
  splitLessonSegments,
} from '@/utils/outlineLessons'

const props = defineProps<{
  courseId: number
  objectives: string[]
  outlineGroups?: OutlinePlanningGroup[]
  outlineError?: string
}>()
defineSlots<{
  header(props: { canAddEntry: boolean; locked: boolean; addEntry: () => void }): void
}>()
const emit = defineEmits<{ lockCourse: [locked: boolean]; reloadOutlines: [] }>()
const days = ref<CourseDay[]>([])
const activeDayId = ref<number | null>(null)
const plan = ref<FeinplanungDayResponse | null>(null)
const busy = ref(false)
const loadError = ref('')
const actionError = ref('')
const status = ref('')
const editor = ref<Feinplanung | 'new' | null>(null)
const showDayForm = ref(false)
const dayDateInput = ref<HTMLInputElement | null>(null)
watch(dayDateInput, (input) => input?.focus())
const dayDraft = ref({ date: '', startTime: '08:15', endTime: '11:45' })
const displayDays = computed(() =>
  detailPlanningDays(days.value, props.outlineGroups ?? [], props.courseId),
)
const selectedDayIndex = computed(() =>
  activeDayId.value !== null && activeDayId.value < 0
    ? -activeDayId.value - 1
    : displayDays.value.findIndex((day) => day.id === activeDayId.value),
)
const lessons = computed(() =>
  plan.value && !props.outlineError
    ? buildOutlineLessons(
        props.outlineGroups?.find((group) => group.dayIndex === selectedDayIndex.value)?.rows ?? [],
        plan.value.day.startTime,
      )
    : [],
)
const locked = computed(() => busy.value || editor.value !== null || showDayForm.value)
watch(locked, (value) => emit('lockCourse', value), { flush: 'sync' })
const dragGroup = `planning-course-${props.courseId}`

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Anfrage fehlgeschlagen.'
}

async function readPlan(dayId: number | null) {
  if (activeDayId.value !== dayId || dayId === null) plan.value = null
  activeDayId.value = dayId
  if (dayId !== null) {
    if (dayId > 0) plan.value = await getFeinplanungenByDayApi(dayId)
    else {
      const day = displayDays.value.find((day) => day.id === dayId)
      plan.value = day ? emptyDetailDay(day) : null
    }
  }
}

async function loadDays(preferredDayId = activeDayId.value) {
  days.value = await getCourseDaysApi(props.courseId)
  const id = displayDays.value.some((day) => day.id === preferredDayId)
    ? preferredDayId
    : displayDays.value[preferredDayId !== null && preferredDayId < 0 ? -preferredDayId - 1 : 0]?.id
  await readPlan(id ?? null)
}

async function load(read: () => Promise<void>) {
  if (busy.value) return
  busy.value = true
  loadError.value = actionError.value = status.value = ''
  try {
    await read()
  } catch (error) {
    loadError.value = message(error)
  } finally {
    busy.value = false
  }
}

onMounted(() => load(() => loadDays()))

watch([displayDays, locked], ([available, isLocked]) => {
  if (isLocked || loadError.value) return
  if (available.length && !available.some((day) => day.id === activeDayId.value))
    void load(() => readPlan(available[0]!.id))
})

async function ensureStoredDay(index: number) {
  const requested = displayDays.value[index]
  if (!requested) throw new Error('Dieser Planungstag ist nicht mehr vorhanden.')
  const current = await getCourseDaysApi(props.courseId)
  while (current.length <= index) {
    current.push(
      await createCourseDayApi(props.courseId, {
        date: null,
        startTime: requested.startTime.slice(0, 5),
        endTime: requested.endTime.slice(0, 5),
      }),
    )
    days.value = [...current]
  }
  days.value = current
  return current[index]!
}

function selectDay(dayId: number) {
  if (locked.value || dayId === activeDayId.value) return
  void load(() => readPlan(dayId))
}

// Keep the editor open on a rejected write. After a successful write, retry only
// the read if loading the updated plan fails (especially after creating a row).
async function save(write: () => Promise<unknown>, success: string, refresh?: () => Promise<void>) {
  if (busy.value) return false
  busy.value = true
  actionError.value = status.value = ''
  try {
    await write()
    editor.value = null
    showDayForm.value = false
    status.value = success
  } catch (error) {
    actionError.value = message(error)
    busy.value = false
    return false
  }
  try {
    await refresh?.()
  } catch (error) {
    loadError.value = message(error)
  } finally {
    busy.value = false
  }
  return true
}

function openDayForm() {
  showDayForm.value = true
  actionError.value = ''
  status.value = ''
}

function closeDayForm() {
  showDayForm.value = false
  actionError.value = ''
}

function addDay() {
  if (!dayDraft.value.date || dayDraft.value.endTime <= dayDraft.value.startTime) {
    actionError.value = 'Die Endzeit muss nach der Startzeit liegen.'
    return
  }
  let created: CourseDay
  void save(
    async () => {
      created = await createCourseDayApi(props.courseId, dayDraft.value)
    },
    'Kurstag hinzugefügt.',
    () => loadDays(created.id),
  )
}

function saveEntry(data: CreateFeinplanungRequest) {
  const entry = editor.value
  if (!entry || data.fk_course_day !== activeDayId.value) return
  // Editing content must not move a row back if another teacher has just moved it.
  const { fk_course_day: dayId, ...changes } = data
  let storedDayId = dayId
  const index = selectedDayIndex.value
  void save(
    async () => {
      if (entry === 'new' && dayId < 0) {
        storedDayId = (await ensureStoredDay(index)).id
        await readPlan(storedDayId)
      }
      return entry === 'new'
        ? createFeinplanungApi({ ...data, fk_course_day: storedDayId })
        : updateFeinplanungApi(entry.id, changes)
    },
    'Zeile gespeichert.',
    () => readPlan(storedDayId),
  )
}

function removeEntry(entry: Feinplanung) {
  if (!window.confirm(`«${entry.topic}» löschen?`)) return
  void save(
    () => deleteFeinplanungApi(entry.id),
    'Zeile gelöscht.',
    () => readPlan(entry.fk_course_day),
  )
}

function reorder(rows: Feinplanung[]) {
  const current = plan.value
  // Dropping on a day tab also emits a shorter source list. The tab handles that move.
  if (locked.value || !current || rows.length !== current.entries.length) return
  void save(async () => {
    plan.value = await reorderFeinplanungApi(
      current.day.id,
      rows.map((row) => row.id),
    )
  }, 'Reihenfolge gespeichert.')
}

function step(index: number, offset: number) {
  const rows = [...(plan.value?.entries ?? [])]
  const target = index + offset
  if (target < 0 || target >= rows.length) return
  const [entry] = rows.splice(index, 1)
  if (entry) {
    rows.splice(target, 0, entry)
    reorder(rows)
  }
}

function move(entry: Feinplanung, target: number) {
  if (
    locked.value ||
    entry.fk_course_day !== activeDayId.value ||
    target === activeDayId.value ||
    !displayDays.value.some((day) => day.id === target)
  )
    return
  let storedTarget = target
  const targetIndex = displayDays.value.findIndex((day) => day.id === target)
  void save(
    async () => {
      if (target < 0) storedTarget = (await ensureStoredDay(targetIndex)).id
      return moveFeinplanungApi(entry.id, storedTarget)
    },
    'Zeile auf den gewählten Tag verschoben.',
    () => readPlan(storedTarget),
  )
}

function runRowAction(entry: Feinplanung, event: Event) {
  const select = event.currentTarget as HTMLSelectElement
  const action = select.value
  select.value = ''
  if (action === 'edit') openEditor(entry)
  else if (action === 'delete') removeEntry(entry)
  else if (action) move(entry, Number(action))
}

async function saveRowField(
  entry: Feinplanung,
  field: 'dur_min' | 'method' | 'medium' | 'comment',
  event: Event,
) {
  const input = event.currentTarget as HTMLInputElement | HTMLSelectElement
  const previous = String(entry[field] ?? '')
  if (locked.value) {
    input.value = previous
    return
  }
  const value = input.value.trim()
  const duration = Number(value)
  if (
    field === 'dur_min' &&
    (!Number.isInteger(duration) || duration < 1 || duration > 2147483647)
  ) {
    actionError.value = 'Gib eine positive ganze Zahl als Dauer ein.'
    input.value = previous
    return
  }
  if (value === previous) {
    input.value = previous
    return
  }
  const changes = field === 'dur_min' ? { dur_min: duration } : { [field]: value || null }
  const saved = await save(
    () => updateFeinplanungApi(entry.id, changes),
    'Zeile gespeichert.',
    () => readPlan(entry.fk_course_day),
  )
  input.value = saved ? value : previous
}

function rowLessonSegments(row: FeinplanungDayResponse['entries'][number]) {
  return splitLessonSegments(row.startMinute, row.endMinute, lessons.value)
}

const methods = ['Plenum', 'Einzelarbeit', 'Partnerarbeit', 'Gruppenarbeit']
const media = ['Beamer', 'Whiteboard', 'Arbeitsblatt']

const cell = 'col-span-6 min-w-0 lg:table-cell lg:border-y lg:border-[var(--border-color)] lg:p-2.5'
const mobileLabel =
  'max-lg:before:mb-1 max-lg:before:block max-lg:before:text-xs max-lg:before:font-semibold max-lg:before:text-[var(--text-color-light)] max-lg:before:content-[attr(data-label)]'
const fieldClass =
  'w-full min-w-0 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-[var(--secondary-color)] disabled:opacity-60'
const buttonClass =
  'w-fit cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 text-sm font-semibold disabled:opacity-50'

function dropOnDay(rows: Feinplanung[], target: number) {
  if (rows[0]) move(rows[0], target)
}

function openEditor(entry: Feinplanung | 'new') {
  actionError.value = status.value = ''
  editor.value = entry
}
function closeEditor() {
  editor.value = null
  actionError.value = ''
}
</script>

<template>
  <slot
    name="header"
    :can-add-entry="!!plan && !loadError"
    :locked="locked"
    :add-entry="() => openEditor('new')"
  />

  <div
    class="mx-4 my-6 grid min-w-0 grid-cols-1 gap-4 pb-28 sm:mx-8 sm:my-8 sm:gap-6 md:pb-14 lg:grid-cols-5"
    :aria-busy="busy"
  >
    <p v-if="outlineError" role="alert" class="col-span-full text-sm text-[var(--error-color)]">
      {{ outlineError }}
      <button type="button" class="underline" :disabled="locked" @click="emit('reloadOutlines')">
        Grobplanung erneut laden
      </button>
    </p>
    <p v-if="actionError" role="alert" class="col-span-full text-sm text-[var(--error-color)]">
      {{ actionError }}
      <button v-if="!locked" type="button" class="ml-2 underline" @click="load(() => loadDays())">
        Stand neu laden
      </button>
    </p>
    <p v-if="status" role="status" class="sr-only">{{ status }}</p>
    <div v-if="loadError" role="alert" class="col-span-full text-[var(--error-color)]">
      {{ loadError }}
      <button type="button" class="ml-2 underline" :disabled="busy" @click="load(() => loadDays())">
        Erneut laden
      </button>
    </div>
    <template v-else>
      <p v-if="busy && !plan" role="status" class="col-span-full">Planung wird geladen …</p>
      <p v-else-if="!displayDays.length && !showDayForm" class="col-span-full">
        Für diesen Kurs sind noch keine Kurstage erfasst.
      </p>

      <form
        v-if="showDayForm"
        class="col-span-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 shadow-lg"
        @submit.prevent="addDay"
      >
        <fieldset :disabled="busy" class="flex flex-wrap items-end gap-3">
          <legend class="mb-3 font-semibold">Neuer Kurstag</legend>
          <label class="grid gap-1 text-sm"
            >Datum
            <input
              ref="dayDateInput"
              v-model="dayDraft.date"
              type="date"
              required
              :class="fieldClass"
          /></label>
          <label class="grid gap-1 text-sm"
            >Startzeit <input v-model="dayDraft.startTime" type="time" required :class="fieldClass"
          /></label>
          <label class="grid gap-1 text-sm"
            >Endzeit <input v-model="dayDraft.endTime" type="time" required :class="fieldClass"
          /></label>
          <button type="submit" :class="buttonClass" class="bg-[var(--secondary-color-light)]!">
            Tag speichern
          </button>
          <button type="button" :class="buttonClass" @click="closeDayForm">Abbrechen</button>
        </fieldset>
      </form>

      <template v-if="plan">
        <section
          class="flex h-full w-full min-w-0 flex-col gap-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 shadow-lg lg:col-span-3"
        >
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Tagesübersicht</h2>
            <div
              class="flex items-center justify-center gap-2 rounded-full bg-[var(--secondary-color-light)] px-2 py-1 text-sm font-semibold text-[var(--text-color)]"
            >
              <span
                class="size-[7px] animate-pulse rounded-full bg-[var(--secondary-color)]"
              ></span>
              <span>Tag {{ selectedDayIndex + 1 }} von {{ displayDays.length }}</span>
            </div>
          </div>

          <p v-if="plan.day.date !== null" class="text-sm text-[var(--text-color-light)]">
            {{ courseDate(plan.day.date) }}
          </p>

          <div class="flex flex-wrap items-center justify-start gap-4 sm:gap-6">
            <div class="flex items-center justify-start gap-2">
              <Svg
                class="size-10 rounded-xl bg-[var(--background-color)] text-sm text-[var(--text-color-light)]"
              >
                <i class="fa-solid fa-person-chalkboard"></i>
              </Svg>
              <div class="flex flex-col items-start justify-center text-sm">
                <span class="font-bold">{{ lessons.length }}</span>
                <span class="font-medium text-[var(--text-color-light)]">Lektionen</span>
              </div>
            </div>
            <div class="flex items-center justify-start gap-2">
              <Svg
                class="size-10 rounded-xl bg-[var(--background-color)] text-sm text-[var(--text-color-light)]"
              >
                <i class="fa-regular fa-clock"></i>
              </Svg>
              <div class="flex flex-col items-start justify-center text-sm">
                <span class="font-bold">{{ plan.summary.availableDurationMin }} Min</span>
                <span class="font-medium text-[var(--text-color-light)]">Verfügbare Zeit</span>
              </div>
            </div>
            <p v-if="plan.entries.length" class="text-sm text-[var(--text-color-light)]">
              {{ plan.summary.totalDurationMin }} Min. geplant
              <span
                v-if="plan.summary.isOverCapacity"
                class="font-semibold text-[var(--error-color)]"
              >
                · {{ -plan.summary.remainingMin }} Min. überplant
              </span>
            </p>
          </div>

          <Divider color="var(--border-color)" />
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LessonBlock
              v-for="lesson in lessons"
              :key="lesson.key"
              :title="lesson.title"
              :subtitle="lesson.description"
              :color="lesson.color"
              :begin-time="lesson.start"
              :end-time="lesson.end"
              class="[&_.flex-col]:whitespace-normal [&_.flex-col]:wrap-anywhere"
            />
          </div>
          <p v-if="!lessons.length && !outlineError" class="text-sm text-[var(--text-color-light)]">
            Für diesen Tag sind in der Grobplanung noch keine Themen zugeordnet.
          </p>
          <p
            v-if="lessons.length * lessonMinutes > plan.summary.availableDurationMin"
            class="text-sm text-[var(--text-color-light)]"
          >
            Die {{ lessons.length }} Lektionen aus der Grobplanung umfassen
            {{ lessons.length * lessonMinutes }} Minuten. Verfügbar sind
            {{ plan.summary.availableDurationMin }} Minuten.
          </p>
        </section>

        <section
          class="flex h-full w-full min-w-0 flex-col gap-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 shadow-lg lg:col-span-2"
        >
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Lernziele</h2>
            <span class="text-sm text-[var(--text-color-light)]"
              >{{ objectives.length }} {{ objectives.length === 1 ? 'Ziel' : 'Ziele' }}</span
            >
          </div>
          <p v-if="!objectives.length" class="text-sm text-[var(--text-color-light)]">
            Für dieses Modul sind keine Lernziele erfasst.
          </p>
          <div
            v-for="(goal, index) in objectives"
            :key="index"
            class="flex flex-col items-start justify-center gap-3"
          >
            <LearningObjectives :count="index + 1" :text="goal" />
            <Divider v-if="index < objectives.length - 1" color="var(--border-color)" />
          </div>
        </section>

        <section
          class="col-span-full flex h-full w-full min-w-0 flex-col gap-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] shadow-lg"
        >
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            <h2 class="text-base font-semibold">Unterrichtsablauf</h2>
            <div
              v-if="plan.entries.length"
              class="flex items-center gap-1 text-xs text-[var(--text-color-light)]"
            >
              <Svg><i class="fa-solid fa-circle-info"></i></Svg>
              <p>Am Griff ziehen zum Sortieren oder auf einen anderen Tag ablegen.</p>
            </div>
          </div>

          <PlanningEntryForm
            v-if="editor"
            :key="editor === 'new' ? 'new' : editor.id"
            class="mx-5"
            :entry="editor === 'new' ? null : editor"
            :day-id="plan.day.id"
            :busy="busy"
            @save="saveEntry"
            @cancel="closeEditor"
          />

          <p v-if="!plan.entries.length" class="px-5 pb-5 text-sm">
            Für diesen Tag sind noch keine Zeilen geplant.
          </p>
          <div v-else class="min-w-0 overflow-x-auto">
            <table class="w-full text-sm max-lg:block lg:text-left">
              <thead class="max-lg:sr-only">
                <tr
                  class="bg-[var(--background-color)] text-[var(--text-color-light)] [&>th]:border-y [&>th]:border-[var(--border-color)] [&>th]:p-2.5"
                >
                  <th scope="col"><span class="sr-only">Reihenfolge</span></th>
                  <th scope="col">Zeit total</th>
                  <th scope="col">Zeit Lektion</th>
                  <th scope="col">Dauer</th>
                  <th scope="col">Inhalt</th>
                  <th scope="col">Methode</th>
                  <th scope="col">Mittel</th>
                  <th scope="col">Kommentar</th>
                </tr>
              </thead>
              <Draggable
                tag="tbody"
                item-key="id"
                :model-value="plan.entries"
                :group="dragGroup"
                :animation="120"
                handle=".drag-handle"
                :disabled="locked"
                class="max-lg:block [&_.sortable-ghost]:opacity-40"
                @update:model-value="reorder"
              >
                <template #item="{ element: row, index }">
                  <tr
                    class="max-lg:relative max-lg:mx-4 max-lg:mb-4 max-lg:grid max-lg:grid-cols-6 max-lg:gap-3 max-lg:rounded-xl max-lg:border max-lg:border-[var(--border-color)] max-lg:bg-[var(--background-color)] max-lg:p-4"
                  >
                    <td
                      :class="cell"
                      class="max-lg:absolute max-lg:top-2 max-lg:right-2 lg:min-w-[50px]"
                    >
                      <button
                        type="button"
                        :disabled="locked"
                        class="drag-handle grid size-8 touch-none cursor-grab place-items-center rounded text-[var(--text-color-light)] active:cursor-grabbing"
                        :aria-label="`${row.topic}: Reihenfolge ändern`"
                        title="Ziehen oder Pfeiltasten verwenden"
                        @keydown.up.prevent="step(index, -1)"
                        @keydown.down.prevent="step(index, 1)"
                      >
                        <Svg><i class="fa-solid fa-grip-vertical" aria-hidden="true"></i></Svg>
                      </button>
                    </td>
                    <td
                      :class="[cell, mobileLabel]"
                      class="max-lg:col-span-3 sm:max-lg:col-span-2 font-bold whitespace-nowrap"
                      data-label="Zeit total"
                    >
                      {{ row.timeRange }}
                    </td>
                    <td
                      :class="[cell, mobileLabel]"
                      class="max-lg:col-span-3 sm:max-lg:col-span-2 max-lg:pr-6 sm:max-lg:pr-0"
                      data-label="Zeit Lektion"
                    >
                      <div class="flex flex-col items-start gap-2">
                        <span
                          v-for="segment in rowLessonSegments(row)"
                          :key="segment.key"
                          :data-lesson="segment.number ?? 'unassigned'"
                          :style="lessonTint(segment.color)"
                          class="inline-flex max-w-full items-start gap-2 rounded-lg border px-2 py-1 text-xs"
                        >
                          <span
                            :style="{ backgroundColor: segment.color }"
                            class="mt-1 size-2 shrink-0 rounded-full"
                            aria-hidden="true"
                          ></span>
                          <span class="min-w-0"
                            ><span class="block font-semibold wrap-anywhere">{{
                              segment.title
                            }}</span
                            ><span class="block text-[var(--text-color-light)]">{{
                              segment.range
                            }}</span></span
                          >
                        </span>
                        <span
                          v-if="!rowLessonSegments(row).length"
                          class="text-[var(--text-color-light)]"
                          >–</span
                        >
                      </div>
                    </td>
                    <td
                      :class="[cell, mobileLabel]"
                      class="sm:max-lg:col-span-2 sm:max-lg:pr-6"
                      data-label="Dauer"
                    >
                      <div
                        class="flex w-fit items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 focus-within:border-[var(--secondary-color)]"
                      >
                        <input
                          type="number"
                          min="1"
                          max="2147483647"
                          step="1"
                          required
                          :value="row.dur_min"
                          :disabled="locked"
                          :aria-label="`Dauer für ${row.topic} in Minuten`"
                          class="w-12 text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          @change="saveRowField(row, 'dur_min', $event)"
                        />
                        <span class="ml-2 text-[var(--text-color-light)]">Min</span>
                      </div>
                    </td>
                    <td :class="[cell, mobileLabel]" data-label="Inhalt">
                      <strong class="wrap-anywhere">{{ row.topic }}</strong>
                      <p
                        v-if="row.desc"
                        class="mt-0.5 text-xs whitespace-pre-line wrap-anywhere text-[var(--text-color-light)]"
                      >
                        {{ row.desc }}
                      </p>
                      <select
                        :disabled="locked"
                        :aria-label="`Aktionen für ${row.topic}`"
                        class="mt-1 max-w-full cursor-pointer rounded border border-[var(--border-color)] bg-[var(--surface-color)] px-1.5 py-1 text-xs text-[var(--text-color-light)]"
                        @change="runRowAction(row, $event)"
                      >
                        <option value="">Aktionen …</option>
                        <option value="edit">Bearbeiten</option>
                        <option value="delete">Löschen</option>
                        <optgroup v-if="displayDays.length > 1" label="Verschieben nach">
                          <template v-for="(day, dayIndex) in displayDays" :key="day.id">
                            <option v-if="day.id !== activeDayId" :value="day.id">
                              {{ dayIndex + 1 }}. Tag
                            </option>
                          </template>
                        </optgroup>
                      </select>
                    </td>
                    <td :class="[cell, mobileLabel]" class="max-lg:col-span-3" data-label="Methode">
                      <select
                        :value="row.method ?? ''"
                        :disabled="locked"
                        :aria-label="`Methode für ${row.topic}`"
                        :class="fieldClass"
                        @change="saveRowField(row, 'method', $event)"
                      >
                        <option value="">–</option>
                        <option v-if="row.method && !methods.includes(row.method)">
                          {{ row.method }}
                        </option>
                        <option v-for="method in methods" :key="method">{{ method }}</option>
                      </select>
                    </td>
                    <td :class="[cell, mobileLabel]" class="max-lg:col-span-3" data-label="Mittel">
                      <select
                        :value="row.medium ?? ''"
                        :disabled="locked"
                        :aria-label="`Mittel für ${row.topic}`"
                        :class="fieldClass"
                        @change="saveRowField(row, 'medium', $event)"
                      >
                        <option value="">–</option>
                        <option v-if="row.medium && !media.includes(row.medium)">
                          {{ row.medium }}
                        </option>
                        <option v-for="medium in media" :key="medium">{{ medium }}</option>
                      </select>
                    </td>
                    <td :class="[cell, mobileLabel]" data-label="Kommentar">
                      <input
                        type="text"
                        maxlength="255"
                        placeholder="Kommentar"
                        :value="row.comment ?? ''"
                        :disabled="locked"
                        :aria-label="`Kommentar für ${row.topic}`"
                        :class="fieldClass"
                        @change="saveRowField(row, 'comment', $event)"
                      />
                    </td>
                  </tr>
                </template>
              </Draggable>
            </table>
          </div>
        </section>
      </template>
    </template>
  </div>

  <div
    v-if="!loadError"
    class="fixed inset-x-0 bottom-16 z-40 bg-[var(--background-color)] md:bottom-0"
  >
    <nav
      aria-label="Kurstage"
      class="mx-auto w-full max-w-[1400px] border-t border-[var(--border-color)]"
    >
      <div class="mx-4 -space-x-px flex items-center justify-start overflow-x-auto sm:mx-8">
        <Draggable
          v-for="(day, index) in displayDays"
          :key="day.id"
          :model-value="[]"
          item-key="id"
          :sort="false"
          :group="{ name: dragGroup, pull: false, put: true }"
          :disabled="locked || day.id === activeDayId"
          class="shrink-0 has-[.sortable-ghost]:bg-[var(--secondary-color-light)] [&_.sortable-ghost]:hidden"
          @update:model-value="dropOnDay($event, day.id)"
        >
          <template #header>
            <button
              type="button"
              :disabled="locked"
              :aria-pressed="day.id === activeDayId"
              :title="day.date === null ? undefined : courseDate(day.date)"
              class="cursor-pointer border-x border-b-3 border-x-[var(--border-color)] border-b-transparent px-4 py-2 font-semibold whitespace-nowrap text-[var(--text-color-light)] select-none aria-pressed:border-b-[var(--secondary-color)] aria-pressed:bg-[var(--surface-color)] aria-pressed:text-[var(--text-color)] sm:px-6"
              @click="selectDay(day.id)"
            >
              {{ index + 1 }}. Tag
            </button>
          </template>
          <template #item="{ element }"
            ><span>{{ element.topic }}</span></template
          >
        </Draggable>
        <button
          type="button"
          :disabled="locked"
          class="flex shrink-0 cursor-pointer gap-2 border-x border-[var(--border-color)] px-4 py-2 font-semibold whitespace-nowrap text-[var(--text-color-light)] select-none disabled:opacity-50 sm:px-6"
          @click="openDayForm"
        >
          <Svg><i class="fa-solid fa-plus"></i></Svg>
          <span>Tag hinzufügen</span>
        </button>
      </div>
    </nav>
  </div>
</template>
