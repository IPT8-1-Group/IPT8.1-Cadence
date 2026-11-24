<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import Svg from '@/components/ui/Svg.vue'
import Divider from '@/components/ui/Divider.vue'

import { useModuleStore } from '@/stores/moduleStore.ts'
import { useCourseStore } from '@/stores/courseStore.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import PushInNotification from '@/components/ui/PushInNotification.vue'
import { notification, showNotification, undoNotification } from '@/utils/notification'
import { updateCourseAssessmentApi } from '@/api/course.api.ts'
import type { ModuleDetail } from '@/types/module.ts'
import CreateCourse from '@/components/courses/CreateCourse.vue'
import OutlineCoursePlan from '@/components/planning/OutlineCoursePlan.vue'
import OutlineClassSchedule from '@/components/planning/OutlineClassSchedule.vue'
import type { CreateCourseRequest, CourseScheduleRequest } from '@/types/course'
import { initializeCourseSchedule, validateCourseSchedule } from '@/services/courseSchedule'
import { courseDateKey, shiftDate, weekStart } from '@/utils/outlineWeek'

const route = useRoute()
const moduleStore = useModuleStore()
const courseStore = useCourseStore()

const moduleData = ref<ModuleDetail | null>(null)

const authStore = useAuthStore()
const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const daysPerWeek = ref(3)
const selectedWeekdays = ref<string[]>(['Montag'])
const showWeekdaySelect = ref(false)
const weekdaySelect = ref<HTMLSelectElement | null>(null)
const addDayButton = ref<HTMLButtonElement | null>(null)
const settingsError = ref('')
const availableWeekdays = computed(() =>
  weekdays.filter((day) => !selectedWeekdays.value.includes(day)),
)
const settingsKey = computed(
  () => `cadence.outline-settings.${authStore.user?.id ?? 'local'}.${route.params.id}`,
)

// Die vorhandene API bietet keine Einstellungen für den wöchentlichen Rhythmus.
watch(
  settingsKey,
  (key) => {
    daysPerWeek.value = 3
    selectedWeekdays.value = ['Montag']
    showWeekdaySelect.value = false
    settingsError.value = ''
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? 'null')
      if (
        saved &&
        Number.isInteger(saved.daysPerWeek) &&
        saved.daysPerWeek >= 1 &&
        saved.daysPerWeek <= 7 &&
        Array.isArray(saved.weekdays) &&
        saved.weekdays.length <= saved.daysPerWeek &&
        saved.weekdays.every((day: unknown) => typeof day === 'string' && weekdays.includes(day)) &&
        new Set(saved.weekdays).size === saved.weekdays.length
      ) {
        daysPerWeek.value = saved.daysPerWeek
        selectedWeekdays.value = weekdays.filter((day) => saved.weekdays.includes(day))
      }
    } catch {
      // Bei ungültigen oder nicht verfügbaren Browserdaten bleiben die Vorgaben aktiv.
    }
  },
  { immediate: true },
)

watch(weekdaySelect, (select) => select?.focus())

function saveWeeklySettings() {
  settingsError.value = ''
  try {
    localStorage.setItem(
      settingsKey.value,
      JSON.stringify({
        daysPerWeek: daysPerWeek.value,
        weekdays: selectedWeekdays.value,
      }),
    )
  } catch {
    settingsError.value =
      'Die Wocheneinstellungen konnten nicht dauerhaft im Browser gespeichert werden.'
    showNotification(settingsError.value)
  }
}

function changeDaysPerWeek(offset: number) {
  const count = daysPerWeek.value + offset
  if (count < Math.max(1, selectedWeekdays.value.length) || count > 7) return
  daysPerWeek.value = count
  if (selectedWeekdays.value.length >= count) showWeekdaySelect.value = false
  saveWeeklySettings()
  if (!settingsError.value) showNotification('Anzahl Kurstage aktualisiert.')
}

async function closeWeekdaySelect() {
  showWeekdaySelect.value = false
  await nextTick()
  addDayButton.value?.focus()
}

function addWeekday(event: Event) {
  const day = (event.currentTarget as HTMLSelectElement).value
  if (!availableWeekdays.value.includes(day) || selectedWeekdays.value.length >= daysPerWeek.value)
    return
  selectedWeekdays.value = weekdays.filter(
    (value) => value === day || selectedWeekdays.value.includes(value),
  )
  saveWeeklySettings()
  if (!settingsError.value) showNotification('Wochentag hinzugefügt.')
  void closeWeekdaySelect()
}

function removeWeekday(day: string) {
  const before = [...selectedWeekdays.value]
  const count = daysPerWeek.value
  const key = settingsKey.value
  selectedWeekdays.value = selectedWeekdays.value.filter((value) => value !== day)
  saveWeeklySettings()
  if (settingsError.value) return
  showNotification('Wochentag entfernt.', () => {
    localStorage.setItem(key, JSON.stringify({ daysPerWeek: count, weekdays: before }))
    if (settingsKey.value === key) {
      selectedWeekdays.value = before
      daysPerWeek.value = count
    }
    showNotification('Wochentag wiederhergestellt.')
  })
}

const moduleCourses = computed(() =>
  (courseStore.coursesData ?? []).filter(
    (course) => course.fk_module_id === Number(route.params.id),
  ),
)
const assessmentCourseId = ref<number | null>(null)
const assessmentCourse = computed(() =>
  moduleCourses.value.find((course) => course.id === assessmentCourseId.value),
)
const editingAssessment = ref(false)
const assessmentDraft = ref('')
const assessmentInput = ref<HTMLInputElement | null>(null)
const assessmentBusy = ref(false)
const assessmentError = ref('')
let assessmentRequest = 0

watch(
  moduleCourses,
  (courses) => {
    if (!courses.some((course) => course.id === assessmentCourseId.value)) {
      assessmentCourseId.value = courses[0]?.id ?? null
    }
  },
  { immediate: true },
)

watch(assessmentCourse, () => {
  assessmentRequest++
  editingAssessment.value = false
  assessmentBusy.value = false
  assessmentError.value = ''
})
watch(assessmentInput, (input) => input?.focus())

function editAssessment() {
  if (!assessmentCourse.value || assessmentBusy.value) return
  assessmentDraft.value = assessmentCourse.value.assessment ?? ''
  assessmentError.value = ''
  editingAssessment.value = true
}

function cancelAssessment() {
  if (assessmentBusy.value) return
  editingAssessment.value = false
  assessmentError.value = ''
}

async function saveAssessment() {
  const course = assessmentCourse.value
  if (!course || assessmentBusy.value || assessmentDraft.value.trim().length > 100) return
  const previousAssessment = course.assessment ?? null
  const currentUser = authStore.user?.id
  const request = ++assessmentRequest
  assessmentBusy.value = true
  assessmentError.value = ''
  try {
    const result = await updateCourseAssessmentApi(course.id, assessmentDraft.value.trim() || null)
    if (request !== assessmentRequest) return
    course.assessment = result.assessment
    editingAssessment.value = false
    if (!result.assessment && previousAssessment) {
      showNotification('Kurskontrolle entfernt.', async () => {
        if (authStore.user?.id !== currentUser) throw new Error('Die Sitzung hat sich geändert.')
        const restored = await updateCourseAssessmentApi(course.id, previousAssessment)
        course.assessment = restored.assessment
        showNotification('Kurskontrolle wiederhergestellt.')
      })
    } else showNotification('Kurskontrolle gespeichert.')
  } catch (error) {
    if (request === assessmentRequest) {
      assessmentError.value =
        error instanceof Error ? error.message : 'Kurskontrolle konnte nicht gespeichert werden.'
      showNotification(assessmentError.value)
    }
  } finally {
    if (request === assessmentRequest) assessmentBusy.value = false
  }
}

const planningWeek = ref<string | null>(null)
const planningLocked = ref(false)
const planningVersion = ref(0)
const pageLoading = ref(false)
const pageError = ref('')
const isCreateCoursesVisible = ref(false)
const createBusy = ref(false)
const createError = ref('')
const createdCourseId = ref<number | null>(null)
const sourceCourseId = ref<number | null>(null)
const planningRef = ref<{ addUnassignedTopic: () => void } | null>(null)
function addTopicToTray() {
  if (!assessmentCourseId.value || !planningRef.value) {
    showNotification('Füge dem Modul zuerst eine Klasse hinzu.')
    return
  }
  if (planningLocked.value || assessmentBusy.value || editingAssessment.value || createBusy.value)
    return
  planningRef.value.addUnassignedTopic()
}
const emptyPlans = new Map()
let pageRequest = 0

async function loadPage() {
  const request = ++pageRequest
  const moduleId = Number(route.params.id)
  pageError.value = ''
  pageLoading.value = true
  try {
    if (!Number.isSafeInteger(moduleId) || moduleId < 1) throw new Error('Ungültige Modul-ID.')
    const [module, courses] = await Promise.all([
      moduleStore.getModuleById(moduleId),
      courseStore.getCourses(),
    ])
    if (request !== pageRequest) return
    if (!module || !courses)
      throw new Error(
        moduleStore.error ?? courseStore.error ?? 'Die Planung konnte nicht geladen werden.',
      )
    moduleData.value = module
  } catch (error) {
    if (request === pageRequest) {
      pageError.value =
        error instanceof Error ? error.message : 'Die Planung konnte nicht geladen werden.'
      showNotification(pageError.value)
    }
  } finally {
    if (request === pageRequest) pageLoading.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    moduleData.value = null
    planningWeek.value = null
    planningLocked.value = false
    isCreateCoursesVisible.value = false
    createdCourseId.value = null
    createError.value = ''
    void loadPage()
  },
  { immediate: true },
)

function openCreateCourse() {
  if (
    !moduleData.value ||
    planningLocked.value ||
    assessmentBusy.value ||
    editingAssessment.value ||
    createBusy.value
  )
    return
  sourceCourseId.value = assessmentCourseId.value
  createdCourseId.value = null
  createError.value = ''
  isCreateCoursesVisible.value = true
}

async function closeCreateCourse() {
  if (createBusy.value) return
  isCreateCoursesVisible.value = false
  if (createdCourseId.value !== null) {
    showNotification(
      'Die Klasse wurde angelegt. Fehlende Termine können in der Tabelle ergänzt werden.',
    )
    await courseStore.getCourses()
    planningVersion.value++
  }
  createdCourseId.value = null
}

async function sendCreateCourse(data: CreateCourseRequest, schedule?: CourseScheduleRequest) {
  if (createBusy.value || !schedule || !moduleData.value) return
  const request = pageRequest
  createBusy.value = true
  createError.value = ''
  try {
    validateCourseSchedule(schedule, data.dayCount ?? 1)
    if (!data.title.trim() || schedule.endTime <= schedule.startTime)
      throw new Error('Bitte Klassenname und gültige Unterrichtszeiten eingeben.')
    if (createdCourseId.value === null) {
      const course = await courseStore.createCourse({
        ...data,
        title: data.title.trim(),
        fk_module_id: moduleData.value.id,
      })
      if (!course) throw new Error(courseStore.error ?? 'Klasse konnte nicht erstellt werden.')
      if (request !== pageRequest) return
      createdCourseId.value = course.id
      courseStore.coursesData = [...(courseStore.coursesData ?? []), course]
    }
    await initializeCourseSchedule(
      createdCourseId.value,
      sourceCourseId.value,
      data.dayCount ?? 1,
      schedule,
    )
    if (request !== pageRequest) return
    const courses = await courseStore.getCourses()
    if (!courses) throw new Error(courseStore.error ?? 'Klassen konnten nicht neu geladen werden.')
    if (request !== pageRequest) return
    assessmentCourseId.value = createdCourseId.value
    planningWeek.value = weekStart(schedule.firstDate)
    planningVersion.value++
    isCreateCoursesVisible.value = false
    createdCourseId.value = null
    showNotification('Klasse und Unterrichtstermine gespeichert.')
  } catch (error) {
    if (request === pageRequest)
      createError.value =
        (createdCourseId.value !== null
          ? 'Die Klasse wurde bereits angelegt. Beim erneuten Speichern wird ihre Planung fortgesetzt. '
          : '') +
        (error instanceof Error ? error.message : 'Klasse konnte nicht gespeichert werden.')
    if (request === pageRequest) showNotification(createError.value)
  } finally {
    createBusy.value = false
  }
}
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <Transition name="notification">
      <PushInNotification
        v-if="notification"
        :key="notification.id"
        :notification="notification.message"
        :undo-on="Boolean(notification.undo)"
        @undo="undoNotification"
        @close="notification = null"
      >
        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      </PushInNotification>
    </Transition>
    <header class="mx-4 my-6 flex items-center justify-between gap-5 sm:mx-8 sm:my-8">
      <div class="flex flex-col gap-3">
        <h1 class="text-[var(--text-color)]">Grobplanung</h1>
        <p class="text-[var(--text-color-light)] font-medium">
          {{ moduleData?.title }}
        </p>
      </div>

      <!--      <div class="flex gap-2">-->
      <!--        <button-->
      <!--          class="lift-hover transition duration-200 select-none border border-transparent cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-[var(&#45;&#45;surface-color)] text-[var(&#45;&#45;text-color)] w-fit text-nowrap rounded-lg shadow-lg"-->
      <!--        >-->
      <!--          <Svg>-->
      <!--            <i class="fa-regular fa-eye"></i>-->
      <!--          </Svg>-->
      <!--          <span>Vorschau</span>-->
      <!--        </button>-->
      <!--        <button-->
      <!--          class="lift-hover transition duration-200 select-none border border-transparent cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-[var(&#45;&#45;secondary-color)] text-[var(&#45;&#45;text-color)] w-fit text-nowrap rounded-lg shadow-lg"-->
      <!--        >-->
      <!--          <Svg>-->
      <!--            <i class="fa-regular fa-floppy-disk"></i>-->
      <!--          </Svg>-->
      <!--          <span>Speichern</span>-->
      <!--        </button>-->
      <!--      </div>-->
    </header>

    <div class="mx-4 my-6 sm:mx-8 sm:my-8">
      <CreateCourse
        v-if="isCreateCoursesVisible && moduleData"
        :fk_module_id="moduleData.id"
        :busy="createBusy"
        :created="createdCourseId !== null"
        with-schedule
        :initial-day-count="selectedWeekdays.length || 1"
        :initial-date="planningWeek ?? courseDateKey(new Date()) ?? ''"
        :weekdays="selectedWeekdays.map((day) => (weekdays.indexOf(day) + 1) % 7)"
        @close="closeCreateCourse"
        @create="sendCreateCourse"
      >
        <p v-if="createError" role="alert" class="text-sm text-[var(--error-color)]">
          {{ createError }}
        </p>
      </CreateCourse>
      <p v-if="pageLoading" role="status" class="mb-3">Grobplanung wird geladen …</p>
      <p v-if="pageError" role="alert" class="mb-3 text-[var(--error-color)]">
        {{ pageError }}
        <button type="button" class="underline" @click="loadPage">Erneut laden</button>
      </p>

      <div
        class="grid grid-cols-1 lg:grid-cols-4 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-4 sm:p-5"
      >
        <div
          class="mb-6 lg:mb-0 lg:col-span-2 px-0 lg:px-3 lg:pr-6 border border-transparent lg:border-r-[var(--border-color)]"
        >
          <h2>Organisatorisch</h2>

          <Divider color="var(--border-color)" class="my-3"></Divider>
          <div class="grid grid-cols-3 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]"
              >Kurstage</span
            >
            <div class="col-span-2 flex gap-2 items-center">
              <div
                class="px-2 py-1 w-fit flex gap-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg"
              >
                <button
                  type="button"
                  aria-label="Weniger Kurstage pro Woche"
                  :disabled="daysPerWeek <= Math.max(1, selectedWeekdays.length)"
                  @click="changeDaysPerWeek(-1)"
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-sm disabled:cursor-default disabled:opacity-40"
                >
                  <Svg><i class="fa-solid fa-minus" aria-hidden="true"></i></Svg>
                </button>
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  class="text-[var(--text-color)] font-bold"
                  >{{ daysPerWeek }}</span
                >
                <button
                  type="button"
                  aria-label="Mehr Kurstage pro Woche"
                  :disabled="daysPerWeek >= 7"
                  @click="changeDaysPerWeek(1)"
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-sm disabled:cursor-default disabled:opacity-40"
                >
                  <Svg><i class="fa-solid fa-plus" aria-hidden="true"></i></Svg>
                </button>
              </div>

              <span class="text-sm text-[var(--text-color-light)] font-semibold">pro Woche</span>
            </div>
          </div>

          <Divider color="var(--border-color)" class="my-3"></Divider>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]">Daten</span>
            <div class="flex flex-wrap sm:col-span-2 gap-2 items-center">
              <div
                v-for="day in selectedWeekdays"
                :key="day"
                class="px-3 py-1 w-fit flex gap-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg"
              >
                <span class="select-none text-[var(--text-color)] font-semibold">{{ day }}</span>
                <button
                  type="button"
                  :aria-label="`${day} entfernen`"
                  @click="removeWeekday(day)"
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-xs"
                >
                  <Svg><i class="fa-solid fa-xmark" aria-hidden="true"></i></Svg>
                </button>
              </div>

              <button
                ref="addDayButton"
                type="button"
                aria-label="Wochentag hinzufügen"
                :aria-expanded="showWeekdaySelect"
                :aria-controls="showWeekdaySelect ? 'outline-weekday-select' : undefined"
                :disabled="selectedWeekdays.length >= daysPerWeek"
                @click="showWeekdaySelect = !showWeekdaySelect"
                class="hover:text-[var(--text-color)] transition duration-75 col-span-1 cursor-pointer px-2 py-1 w-fit flex gap-1 bg-transparent border border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-color-light)] disabled:cursor-default disabled:opacity-40"
              >
                <Svg class="text-sm">
                  <i class="fa-solid fa-plus" aria-hidden="true"></i>
                </Svg>
                <span class="select-none font-medium">Tag</span>
              </button>
              <select
                v-if="showWeekdaySelect"
                id="outline-weekday-select"
                ref="weekdaySelect"
                aria-label="Wochentag auswählen"
                class="max-w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-2 py-1 text-sm text-[var(--text-color)]"
                @change="addWeekday"
                @keydown.esc.prevent="closeWeekdaySelect"
              >
                <option value="" disabled selected>Tag wählen</option>
                <option v-for="day in availableWeekdays" :key="day" :value="day">{{ day }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 px-0 lg:px-3 lg:pl-6">
          <h2>Inhalt</h2>

          <Divider color="var(--border-color)" class="my-3"></Divider>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]">Modul</span>
            <RouterLink
              v-if="moduleData"
              :to="`/moduledetail/${moduleData.id}`"
              class="hover:text-[var(--text-color)] transition duration-75 text-[var(--text-color-light)] cursor-pointer sm:col-span-2 flex gap-2 items-center"
            >
              <div class="px-0 sm:px-2 py-1 w-fit flex gap-2">
                <p class="font-semibold">
                  <span
                    class="select-none h-fit w-fit text-xs font-bold bg-gray-100 rounded-sm px-2 py-1 mr-1 mb-1"
                  >
                    {{ moduleData.code }}
                  </span>
                  {{ moduleData.title }}
                </p>
              </div>
              <Svg class="text-sm shrink-0">
                <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
              </Svg>
            </RouterLink>
          </div>

          <Divider color="var(--border-color)" class="my-3"></Divider>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]"
              >Kurskontrolle</span
            >
            <div
              class="hover:text-[var(--text-color)] transition duration-75 text-[var(--text-color-light)] sm:col-span-2 flex flex-col gap-2 items-start min-w-0"
            >
              <button
                v-if="!editingAssessment"
                type="button"
                :disabled="!assessmentCourse || planningLocked || isCreateCoursesVisible"
                :title="
                  assessmentCourse ? 'Kurskontrolle bearbeiten' : 'Zuerst eine Klasse hinzufügen'
                "
                @click="editAssessment"
                class="cursor-pointer border border-[var(--border-color)] rounded-lg text-sm font-semibold px-2 py-1 w-fit max-w-full flex items-center gap-1 disabled:cursor-default disabled:opacity-40"
              >
                <Svg class="shrink-0">
                  <i class="fa-regular fa-file" aria-hidden="true"></i>
                </Svg>
                <span class="text-[var(--text-color)] text-left break-words">{{
                  assessmentCourse?.assessment || 'Kurskontrolle erfassen'
                }}</span>
              </button>
              <form
                v-else
                class="w-full min-w-0"
                @submit.prevent="saveAssessment"
                @keydown.esc.prevent="cancelAssessment"
              >
                <label class="grid gap-1 text-sm">
                  Bezeichnung
                  <input
                    ref="assessmentInput"
                    v-model="assessmentDraft"
                    type="text"
                    maxlength="100"
                    :disabled="assessmentBusy || planningLocked || isCreateCoursesVisible"
                    placeholder="z. B. Theoretische Prüfung"
                    class="min-w-0 w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-2 py-1 text-[var(--text-color)]"
                  />
                </label>
                <div class="mt-2 flex flex-wrap gap-2 text-sm">
                  <button
                    type="submit"
                    :disabled="assessmentBusy || planningLocked || isCreateCoursesVisible"
                    class="cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] px-2 py-1 disabled:opacity-40"
                  >
                    {{ assessmentBusy ? 'Wird gespeichert …' : 'Speichern' }}
                  </button>
                  <button
                    type="button"
                    :disabled="assessmentBusy || planningLocked || isCreateCoursesVisible"
                    class="cursor-pointer rounded-lg border border-[var(--border-color)] px-2 py-1 disabled:opacity-40"
                    @click="cancelAssessment"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
              <p v-if="assessmentError" role="alert" class="text-sm text-[var(--error-color)]">
                {{ assessmentError }}
              </p>
            </div>
          </div>
        </div>

        <Divider color="var(--border-color)" class="col-span-full my-3"></Divider>

        <div class="col-span-full min-w-0">
          <OutlineCoursePlan
            ref="planningRef"
            v-if="moduleData && assessmentCourseId"
            :key="`${moduleData.id}:${assessmentCourseId}:${planningVersion}`"
            v-model:week="planningWeek"
            :course-id="assessmentCourseId"
            :module="moduleData"
            :courses="moduleCourses"
            :selected-weekdays="selectedWeekdays"
            planning-only
            :disabled="isCreateCoursesVisible || assessmentBusy || editingAssessment"
            @busy="planningLocked = $event"
            @add-class="openCreateCourse"
          />
          <OutlineClassSchedule
            v-else-if="moduleData && !pageLoading"
            :courses="[]"
            :plans="emptyPlans"
            :day-names="selectedWeekdays"
            :week="planningWeek ?? weekStart(courseDateKey(new Date())!)"
            :locked="isCreateCoursesVisible"
            @navigate="
              planningWeek = shiftDate(
                planningWeek ?? weekStart(courseDateKey(new Date())!),
                $event,
              )
            "
            @add-class="openCreateCourse"
          />
        </div>
      </div>

      <div class="flex items-center justify-center w-full">
        <button
          @click="addTopicToTray"
          :disabled="
            !moduleData ||
            !assessmentCourseId ||
            planningLocked ||
            assessmentBusy ||
            editingAssessment ||
            createBusy
          "
          type="button"
          class="disabled:opacity-40 shadow-lg lift-hover w-full max-w-[500px] mt-5 cursor-pointer flex items-center justify-center gap-2 bg-[var(--primary-color)] rounded-lg text-sm text-[var(--text-color-white)] px-3 py-2"
        >
          <Svg>
            <i class="fa-solid fa-plus"></i>
          </Svg>
          Kurs hinzufügen
        </button>
      </div>
    </div>
  </SectionComp>
</template>

<style scoped>
.notification-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

td,
th {
  padding: 10px;
  text-align: left;
  border: 1px solid var(--border-color);
}

@media (max-width: 639px) {
  td,
  th {
    padding: 6px;
  }
}
</style>
