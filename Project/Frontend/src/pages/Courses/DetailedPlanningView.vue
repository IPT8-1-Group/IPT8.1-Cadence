<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import CourseDayPlan from '@/components/planning/CourseDayPlan.vue'
import { getModuleByIdApi } from '@/api/module.api'
import { getCoursesApi, getCourseDaysApi } from '@/api/course.api'
import { getGrobplanungenApi, getOutlinePlacementsApi } from '@/api/grobplanung.api'
import { useAuthStore } from '@/stores/authStore'
import type { OutlineClassPlan, OutlineContentPosition } from '@/types/grobplanung'
import {
  buildOutlineGroups,
  buildOutlineRows,
  readContentPositions,
  resolveContentPositions,
} from '@/utils/outlineContentLayout'
import { readOutlineWeekdays } from '@/utils/outlineLessons'
import type { Course } from '@/types/course'
import type { ModuleDetail } from '@/types/module'

const route = useRoute()
const moduleData = ref<ModuleDetail | null>(null)
const courses = ref<Course[]>([])
const courseId = ref<number | null>(null)
const error = ref('')
const loading = ref(false)
const retry = ref(0)
const authStore = useAuthStore()
const outlinePlans = shallowRef(new Map<number, OutlineClassPlan>())
const outlinePositions = ref<OutlineContentPosition[]>([])
const selectedWeekdays = ref<string[]>([])
const outlineError = ref('')
const settingsKey = computed(
  () => `cadence.outline-settings.${authStore.user?.id ?? 'local'}.${route.params.id}`,
)
const contentKey = computed(
  () => `cadence.outline-content.${authStore.user?.id ?? 'local'}.${route.params.id}`,
)
const outlineRows = computed(() => buildOutlineRows(courses.value, outlinePlans.value))
const outlineGroups = computed(() =>
  buildOutlineGroups(
    outlineRows.value,
    outlinePlans.value,
    selectedWeekdays.value,
    resolveContentPositions(outlineRows.value, outlinePlans.value, outlinePositions.value),
  ),
)
let outlineRequest = 0

function readOutlineSettings() {
  try {
    selectedWeekdays.value = readOutlineWeekdays(localStorage.getItem(settingsKey.value))
    outlinePositions.value = readContentPositions(localStorage.getItem(contentKey.value))
  } catch {
    selectedWeekdays.value = ['Montag']
    outlinePositions.value = []
  }
}
watch([settingsKey, contentKey], readOutlineSettings, { immediate: true })

async function loadOutlinePlans() {
  const request = ++outlineRequest
  const available = [...courses.value]
  const responses = await Promise.allSettled(
    available.map(async (course) => {
      const [days, outlines, placements] = await Promise.all([
        getCourseDaysApi(course.id),
        getGrobplanungenApi(course.id),
        getOutlinePlacementsApi(course.id),
      ])
      return { days, outlines, placements }
    }),
  )
  if (request !== outlineRequest) return
  const result = new Map<number, OutlineClassPlan>()
  const failed: string[] = []
  for (const [index, response] of responses.entries()) {
    const course = available[index]!
    if (response.status === 'fulfilled') result.set(course.id, response.value)
    else failed.push(course.title)
  }
  outlinePlans.value = result
  outlineError.value = failed.length
    ? `Die Grobplanung konnte nicht geladen werden für ${failed.join(', ')}.`
    : ''
}

function updateFromStorage(event: StorageEvent) {
  if (event.key === null || event.key === settingsKey.value || event.key === contentKey.value)
    readOutlineSettings()
}
function refreshOutline() {
  readOutlineSettings()
  if (!loading.value && courses.value.length) void loadOutlinePlans()
}
onMounted(() => {
  window.addEventListener('storage', updateFromStorage)
  window.addEventListener('focus', refreshOutline)
})
onBeforeUnmount(() => {
  outlineRequest++
  window.removeEventListener('storage', updateFromStorage)
  window.removeEventListener('focus', refreshOutline)
})

watch(
  [() => route.params.id, retry],
  async ([id], _, onCleanup) => {
    let current = true
    onCleanup(() => {
      current = false
    })
    moduleData.value = null
    courses.value = []
    courseId.value = null
    outlineRequest++
    outlinePlans.value = new Map()
    outlineError.value = ''
    error.value = ''
    loading.value = true
    try {
      const moduleId = Number(id)
      if (!Number.isSafeInteger(moduleId) || moduleId < 1) throw new Error('Ungültige Modul-ID.')
      const [module, allCourses] = await Promise.all([getModuleByIdApi(moduleId), getCoursesApi()])
      if (!current) return
      moduleData.value = module.data
      courses.value = allCourses.filter((course) => course.fk_module_id === moduleId)
      courseId.value = courses.value[0]?.id ?? null
      await loadOutlinePlans()
    } catch (cause) {
      if (current)
        error.value = cause instanceof Error ? cause.message : 'Modul konnte nicht geladen werden.'
    } finally {
      if (current) loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <AppNavbar />
  <SectionComp>
    <template v-if="!courseId || !moduleData">
      <header class="mx-4 my-6 sm:mx-8 sm:my-8">
        <h1 class="text-[var(--text-color)]">Feinplanung</h1>
        <p v-if="moduleData" class="mt-3 font-medium text-[var(--text-color-light)]">
          {{ moduleData.code }} - {{ moduleData.title }}
        </p>
      </header>
      <div class="mx-4 sm:mx-8">
        <p v-if="loading" role="status">Modul wird geladen …</p>
        <p v-else-if="error" role="alert" class="text-[var(--error-color)]">
          {{ error }} <button type="button" class="underline" @click="retry++">Erneut laden</button>
        </p>
        <p v-else>Für dieses Modul ist noch kein Kurs vorhanden.</p>
      </div>
    </template>
    <CourseDayPlan
      v-else
      :key="courseId"
      :course-id="courseId"
      :objectives="moduleData.learningObjectives ?? []"
      :outline-groups="outlineGroups"
      :outline-error="outlineError"
      @reload-outlines="refreshOutline"
    >
      <template #header="{ canAddEntry, locked, addEntry }">
        <header
          class="mx-4 my-6 flex flex-col items-stretch gap-5 sm:mx-8 sm:my-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-col gap-3">
            <h1 class="text-[var(--text-color)]">Feinplanung</h1>
            <p class="text-[var(--text-color-light)] font-medium">
              {{ moduleData.code }} - {{ moduleData.title }}
            </p>
          </div>
          <button
            v-if="canAddEntry"
            type="button"
            :disabled="locked"
            @click="addEntry"
            class="lift-hover transition duration-200 select-none border border-transparent cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-[var(--primary-color)] text-[var(--text-color-white)] w-full sm:w-fit text-nowrap rounded-lg shadow-lg disabled:pointer-events-none disabled:opacity-50"
          >
            <Svg>
              <i class="fa-solid fa-plus"></i>
            </Svg>
            <span>Zeile hinzufügen</span>
          </button>
        </header>
      </template>
    </CourseDayPlan>
  </SectionComp>
</template>
