<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Draggable from 'vuedraggable'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import Svg from '@/components/ui/Svg.vue'
import Divider from '@/components/ui/Divider.vue'

import { useModuleStore } from '@/stores/moduleStore.ts'
import { useCourseStore } from '@/stores/courseStore.ts'
import { useGrobplanungStore } from '@/stores/grobplanungStore.ts'
import { useFeinplanungStore } from '@/stores/feinplanungStore.ts'
import type { ModuleDetail } from '@/types/module.ts'
import CreateCourse from '@/components/courses/CreateCourse.vue'

type Topic = {
  id: number
  title: string
  description: string
}

type PlanningDay = {
  id: number
  label: string
  courses: Topic[]
}

const route = useRoute()
const moduleStore = useModuleStore()
const courseStore = useCourseStore()
const grobplanungStore = useGrobplanungStore()
const feinplanungStore = useFeinplanungStore()

const moduleData = ref<ModuleDetail | null>(null)
const days = ref<PlanningDay[]>([])

onMounted(async () => {
  const moduleId = Number(route.params.id)

  const [module, courses, outlines, details] = await Promise.all([
    moduleStore.getModuleById(moduleId),
    courseStore.getCourses(),
    grobplanungStore.getGrobplanungen(),
    feinplanungStore.getFeinplanungen(),
  ])

  moduleData.value = module ?? null
  if (!courses || !outlines || !details) return

  const courseIds = new Set(
    courses.filter((course) => course.fk_module_id === moduleId).map((course) => course.id),
  )

  const topics = new Map<number, Topic>()

  for (const outline of outlines) {
    if (!courseIds.has(outline.fk_course)) continue

    topics.set(outline.id, {
      id: outline.id,
      title: outline.title,
      description: outline.desc ?? '',
    })
  }

  const unassigned = new Map(topics)
  const topicsByDay = new Map<number, Map<number, Topic>>()

  for (const detail of details) {
    if (detail.fk_outline_planning === null) continue

    const topic = topics.get(detail.fk_outline_planning)
    if (!topic) continue

    const dayTopics = topicsByDay.get(detail.fk_course_day) ?? new Map<number, Topic>()
    dayTopics.set(topic.id, topic)
    topicsByDay.set(detail.fk_course_day, dayTopics)
    unassigned.delete(topic.id)
  }

  days.value = [...topicsByDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, dayTopics], index) => ({
      id,
      label: `${index + 1}. Tag`,
      courses: [...dayTopics.values()],
    }))

  if (unassigned.size > 0) {
    days.value.push({
      id: 0,
      label: 'Nicht zugeordnet',
      courses: [...unassigned.values()],
    })
  }
})

const isCreateCoursesVisible = ref<boolean>(false)
async function sendCreateCourse() {
  await courseStore.createCourse({
    fk_module_id: 0,
    title: '',
    desc: '',
  })
}
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
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
      <CreateCourse v-if="isCreateCoursesVisible"></CreateCourse>

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
                <Svg
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-sm"
                >
                  <i class="fa-solid fa-minus"></i>
                </Svg>
                <span class="text-[var(--text-color)] font-bold">3</span>
                <Svg
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-sm"
                >
                  <i class="fa-solid fa-plus"></i>
                </Svg>
              </div>

              <span class="text-sm text-[var(--text-color-light)] font-semibold">pro Woche</span>
            </div>
          </div>

          <Divider color="var(--border-color)" class="my-3"></Divider>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]">Daten</span>
            <div class="flex flex-wrap sm:col-span-2 gap-2 items-center">
              <div
                class="px-3 py-1 w-fit flex gap-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg"
              >
                <span class="select-none text-[var(--text-color)] font-semibold">Montag</span>
                <Svg
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-xs"
                >
                  <i class="fa-solid fa-xmark"></i>
                </Svg>
              </div>

              <div
                class="hover:text-[var(--text-color)] transition duration-75 col-span-1 cursor-pointer px-2 py-1 w-fit flex gap-1 bg-transparent border border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-color-light)]"
              >
                <Svg class="cursor-pointer text-sm">
                  <i class="fa-solid fa-plus"></i>
                </Svg>
                <span class="select-none font-medium">Tag</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 px-0 lg:px-3 lg:pl-6">
          <h2>Inhalt</h2>

          <Divider color="var(--border-color)" class="my-3"></Divider>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]">Modul</span>
            <div
              class="hover:text-[var(--text-color)] transition duration-75 text-[var(--text-color-light)] cursor-pointer sm:col-span-2 flex gap-2 items-center"
            >
              <div class="px-0 sm:px-2 py-1 w-fit flex gap-2">
                <p class="font-semibold">
                  <span
                    class="select-none h-fit w-fit text-xs font-bold bg-gray-100 rounded-sm px-2 py-1 mr-1 mb-1"
                  >
                    M114
                  </span>
                  Codierungs-, Kompressions- und Verschlüsselungsverfahren einsetzen.
                </p>
              </div>
              <Svg class="text-sm shrink-0">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </Svg>
            </div>
          </div>

          <Divider color="var(--border-color)" class="my-3"></Divider>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]"
              >Kurskontrolle</span
            >
            <div
              class="hover:text-[var(--text-color)] transition duration-75 text-[var(--text-color-light)] sm:col-span-2 flex flex-wrap gap-2 items-center"
            >
              <div
                class="cursor-pointer border border-[var(--border-color)] rounded-lg text-sm font-semibold px-2 py-1 w-fit flex items-center gap-1"
              >
                <Svg>
                  <i class="fa-regular fa-file"></i>
                </Svg>
                <span class="text-[var(--text-color)] text-nowrap">Theoretische Prüfung</span>
              </div>
            </div>
          </div>
        </div>

        <Divider color="var(--border-color)" class="col-span-full my-3"></Divider>

        <div class="col-span-full">
          <div
            class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2>Planung</h2>

            <div
              class="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3"
            >
              <div class="flex gap-1 items-center">
                <div class="w-[7px] h-[7px] rounded-full bg-[var(--secondary-color)]"></div>
                <span class="text-sm font-medium text-[var(--text-color-light)]"
                  >Termine der gewählten Woche</span
                >
              </div>

              <div
                class="px-2 py-2 border border-[var(--border-color)] rounded-lg flex w-full justify-between sm:w-auto sm:justify-start text-[var(--text-color-light)]"
              >
                <Svg class="text-sm cursor-pointer">
                  <i class="fa-solid fa-angle-left"></i>
                </Svg>

                <div
                  class="flex items-center gap-1 mx-2 px-2 border border-transparent border-x-[var(--border-color)]"
                >
                  <Svg>
                    <i class="fa-regular fa-calendar"></i>
                  </Svg>
                  <span class="font-semibold text-[var(--text-color)]">7.-11. September 2026</span>
                </div>

                <Svg class="text-sm cursor-pointer">
                  <i class="fa-solid fa-angle-right"></i>
                </Svg>
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-1 text-xs text-[var(--text-color-light)] sm:mt-0">
            <Svg>
              <i class="fa-solid fa-circle-info"></i>
            </Svg>
            <span>Unterrichtssequenzen ziehen, um zu verschieben.</span>
          </div>

          <table class="w-full mt-4 border border-[var(--border-color)] border-collapse">
            <thead>
              <tr
                class="text-[var(--text-color-light)] bg-[var(--background-color)] border border-[var(--border-color)]"
              >
                <th>Lektion</th>
                <th>Inhalt</th>
                <th>
                  <Svg
                    class="lift-hover cursor-pointer text-sm text-[var(--text-color-light)] w-[35px] h-[35px] rounded-lg bg-[var(--surface-color)] border border-dashed border-[var(--border-color)]"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </Svg>
                </th>
              </tr>
            </thead>

            <Draggable
              v-for="day in days"
              :key="day.id"
              v-model="day.courses"
              tag="tbody"
              item-key="id"
              group="courses"
              handle=".drag-handle"
              :animation="300"
            >
              <template #header>
                <tr class="bg-[var(--background-color)]">
                  <th colspan="3" scope="rowgroup" class="px-3 py-3 text-left">
                    {{ day.label }}
                    <span v-if="day.courses.length === 0" class="ml-2 text-sm font-normal">
                      Kurs hier ablegen
                    </span>
                  </th>
                </tr>
              </template>

              <template #item="{ element: course, index }">
                <tr>
                  <td class="px-3 py-2 text-center font-bold">{{ index + 1 }}</td>
                  <td class="py-2">
                    <div
                      class="hover:border-[var(--primary-color)] transition duration-100 flex items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--border-color)] px-2 py-2 sm:px-3"
                    >
                      <div class="flex min-w-0 items-center justify-center gap-2">
                        <Svg class="drag-handle shrink-0 cursor-grab" aria-hidden="true">
                          <i class="fa-solid fa-grip-vertical"></i>
                        </Svg>

                        <div class="min-w-0">
                          <div class="font-medium">{{ course.title }}</div>
                          <div class="text-sm text-[var(--text-color-light)]">
                            {{ course.description }}
                          </div>
                        </div>
                      </div>

                      <Svg
                        class="hover:text-[var(--text-color)] hover:border-[var(--text-color)] transition duration-200 cursor-pointer shrink-0 text-[var(--text-color-light)] w-[35px] h-[35px] rounded-lg border border-[var(--border-color)] text-sm"
                      >
                        <i class="fa-solid fa-pen"></i>
                      </Svg>
                    </div>
                  </td>
                  <td></td>
                </tr>
              </template>
            </Draggable>
          </table>
        </div>
      </div>

      <div class="flex items-center justify-center w-full">
        <button
          @click="isCreateCoursesVisible = !isCreateCoursesVisible"
          type="button"
          class="shadow-lg lift-hover w-full max-w-[500px] mt-5 cursor-pointer flex items-center justify-center gap-2 bg-[var(--primary-color)] rounded-lg text-sm text-[var(--text-color-white)] px-3 py-2"
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
