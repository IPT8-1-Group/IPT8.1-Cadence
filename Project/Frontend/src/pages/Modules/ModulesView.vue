<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import { useModuleStore } from '@/stores/moduleStore.ts'
import { computed, onMounted, ref } from 'vue'
import { getModuleIcon } from '@/utils/moduleIcon.ts'
import { useRouter } from 'vue-router'
import type { ModuleListResponse } from '@/types/module.ts'
import ModuleEditMenu from '@/components/modules/ModuleEditMenu.vue'
import ModuleOptionsMenu from '@/components/modules/ModuleOptionsMenu.vue'

const moduleStore = useModuleStore()

const searchModule = ref<string>('')
const moduleData = ref<ModuleListResponse | null>(null)
const filteredModuleData = computed(() => {
  if (!moduleData.value) return null

  const searchTerms = searchModule.value.toLowerCase().match(/\S+/g) ?? []

  return moduleData.value.data.filter((module) => {
    const fields = [
      module.code.toLowerCase(),
      module.title.toLowerCase(),
      module.description?.toLowerCase() ?? '',
    ]

    return searchTerms.every((term) => fields.some((field) => field.includes(term)))
  })
})

const error = ref<string | null>(null)
onMounted(async () => {
  error.value = ''
  try {
    await moduleStore.getModules()
    moduleData.value = moduleStore.modulesData
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Module fehlgeschlagen'
  }
})

async function sendCreateModule(code: string, title: string, description: string) {
  try {
    await moduleStore.createModule({
      code: code,
      title: title,
      description: description,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Module erstellen fehlgeschlagen'
  }
}

const router = useRouter()
async function routerToModuleDetailed(id: number) {
  await router.push(`/moduleDetail/${id}`)
}

function moduleEditHandler(moduleId: number, event: string) {
  if (event === 'details') {
    return
  }
  if (event === 'outline') return router.push(`/outlinePlanning/${moduleId}`)
  if (event === 'detailPlan') return router.push(`/detailedplanning/${moduleId}`)
  else return
}
</script>
<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mx-8 my-8">
      <div class="flex flex-col items-start justify-center gap-3 min-w-0">
        <h1>Module verwalten</h1>
        <p class="text-[var(--text-color-light)]">
          Verwalte deine Module und behalte den Überblick über alle Inhalte,
          Kurse und zugehörigen Planungen.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
        <label class="flex h-10 w-full sm:w-[220px] md:w-[240px] lg:w-[260px] min-w-0 items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color-light)]">
  <i class="fa-solid fa-magnifying-glass text-sm shrink-0"></i>
  <input
    type="text"
    placeholder="Module suchen ..."
    class="w-full min-w-0 bg-transparent text-sm text-[var(--text-color)] placeholder:text-[var(--text-color-light)] outline-none" />
</label>
       <button
  type="button"
  class="flex h-10 w-auto shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--primary-color,#0A2A66)] px-4 text-sm font-medium text-white shadow-lg">
  <i class="fa-solid fa-plus"></i>
  Neues Modul
</button>
      </div>
    </header>
    <div class="grid grid-cols-1 gap-3 mx-8 my-8">
      <div
        v-for="module in filteredModuleData"
        @click="routerToModuleDetailed(module.id)"
        :key="module.id"
        class="has-[button[aria-expanded=true]]:z-40 hover:shadow-xl lift-hover cursor-pointer shadow-lg col-span-1 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-6 py-4 border border-[var(--border-color)] bg-[var(--surface-color)] rounded-2xl"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <Svg
            class="w-[60px] h-[60px] shrink-0 rounded-lg bg-[var(--secondary-color-light)] text-[var(--secondary-color)]"
          >
            <i :class="getModuleIcon(module.title)" class="text-[40px]"></i>
          </Svg>
          <div class="min-w-0">
            <h3 class="font-semibold text-[var(--text-color)]">
              {{ module.code }} - {{ module.title.trim().slice(0, 120) }}
            </h3>
            <p class="mt-1 text-sm text-[var(--text-color-light)]">
              Programmierung in Python mit Fokus auf praktische Anwendungen.
            </p>
          </div>
        </div>
       
        <div class="flex flex-wrap lg:flex-nowrap items-center gap-x-4 gap-y-3 lg:gap-6 xl:gap-8 shrink-0">
          <div class="border-l border-[var(--border-color)] pl-5">
            <span class="text-sm text-[var(--text-color-light)]">Kurse</span>
            <p class="mt-1 text-sm text-[var(--text-color)]">
              {{ module.courseCount ?? 'Nicht gesetzt' }}
            </p>
          </div>
          <div class="border-l border-[var(--border-color)] pl-5">
            <span class="text-sm text-[var(--text-color-light)]">Erstellt am</span>
            <p class="mt-1 text-sm text-[var(--text-color)]">
              {{ module.createdAt ?? 'Nicht gesetzt' }}
            </p>
          </div>
          <div class="border-l border-[var(--border-color)] pl-5">
            <span class="text-sm text-[var(--text-color-light)]">Zuletzt bearbeitet</span>
            <p class="mt-1 text-sm text-[var(--text-color)]">
              {{ module.updatedAt ?? 'Nicht gesetzt' }}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 shrink-0">
          <ModuleEditMenu @select="moduleEditHandler(module.id, $event)"></ModuleEditMenu>
          <ModuleOptionsMenu></ModuleOptionsMenu>
        <!-- Aktionen: auf kleinen Bildschirmen ausgeblendet -->
        <div class="hidden sm:flex items-center justify-end gap-3 shrink-0">
          <button
            type="button" aria-label="Python bearbeiten"
            class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]"
            @click.stop>
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button
            type="button" aria-label="Weitere Aktionen"
            class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]"
            @click.stop>
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>

      <div
        v-if="filteredModuleData?.length === 0"
        class="px-6 py-4 col-span-1 w-full text-center flex items-center justify-center gap-2 text-[var(--text-color)] text-sm"
      >
        <Svg>
          <i class="fa-solid fa-magnifying-glass"></i>
        </Svg>
        <span>Keine Einträge gefunden.</span>
      </div>
    </div>
  </SectionComp>
</template>
