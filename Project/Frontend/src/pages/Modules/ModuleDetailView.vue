<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import { useModuleStore } from '@/stores/moduleStore.ts'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ModuleDetail } from '@/types/module.ts'
import { getModuleIcon } from '@/utils/moduleIcon.ts'
import SwitchButton from '@/components/modules/SwitchButton.vue'
import PushInNotification from '@/components/ui/PushInNotification.vue'
import router from '@/router'
import { notification, showNotification, undoNotification } from '@/utils/notification.ts'

const moduleStore = useModuleStore()

const route = useRoute()
const moduleId = computed(() => {
  return Number(route.params.id)
})

const moduleData = ref<ModuleDetail | null>(null)
onMounted(async () => {
  moduleData.value = (await moduleStore.getModuleById(moduleId.value)) ?? null

  if (moduleData.value !== undefined && moduleData.value !== null) {
    description.value = moduleData.value.description!
    learningObj.value = moduleData.value.learningObjectives
  }
})

const description = ref<string>('')
const descriptionEditIsOn = ref<boolean>(false)
const changeDescIsSuccessfull = ref<boolean | null>(null)
async function changeDescription(editOn: boolean) {
  changeDescIsSuccessfull.value = null
  if (editOn) {
    return (descriptionEditIsOn.value = !descriptionEditIsOn.value)
  }

  await moduleStore.patchModule(moduleId.value, {
    description: description.value,
  })

  changeDescIsSuccessfull.value = moduleStore.error == null
  return (descriptionEditIsOn.value = !descriptionEditIsOn.value)
}

const learningObj = ref<string[]>([])
const learningObjEditIsOn = ref<boolean>(false)
const changeLearningObjIsSuccessfull = ref<boolean | null>(null)
async function changeLearningObj(editOn: boolean) {
  changeLearningObjIsSuccessfull.value = null
  if (editOn) {
    return (learningObjEditIsOn.value = !learningObjEditIsOn.value)
  }

  await moduleStore.replaceLearningObjectives(moduleId.value, learningObj.value)
  changeLearningObjIsSuccessfull.value = moduleStore.error == null
  return (learningObjEditIsOn.value = !learningObjEditIsOn.value)
}

function addLearningObj() {
  learningObj.value.push('')
}

function updateLearningObjective(index: number, event: Event) {
  const objectives = moduleData.value?.learningObjectives
  const input = event.currentTarget

  if (objectives && input instanceof HTMLInputElement) {
    objectives[index] = input.value
  }
}

async function deleteModule() {
  const errorMessage = 'Modul konnte nicht gelöscht werden.'

  try {
    await moduleStore.deleteModule(moduleId.value)

    showNotification(moduleStore.error == null ? 'Modul gelöscht.' : errorMessage)

    if (moduleStore.error == null) {
      setTimeout(() => router.push('/modules'), 1000)
    }
  } catch {
    showNotification(errorMessage)
  }
}

function removeLearningObjective(index: number) {
  const [removed] = learningObj.value.splice(index, 1)
  if (removed === undefined) return

  showNotification('Lernziel entfernt.', () => {
    learningObj.value.splice(index, 0, removed)
  })
}
</script>

<template>
  <AppNavbar />

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

    <div class="mx-4 sm:mx-6 lg:mx-8 my-6 sm:my-8 flex flex-col gap-5">
      <div
        class="rounded-t-xl border border-b-0 border-[var(--border-color)] bg-[var(--surface-color)] px-4 sm:px-6 pt-5"
      >
        <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div class="flex items-start gap-4 sm:gap-6 min-w-0">
            <Svg
              class="h-16 w-16 sm:h-20 sm:w-20 lg:h-[102px] lg:w-[108px] shrink-0 rounded-xl bg-[var(--secondary-color-light,#FFF2E0)] text-[var(--secondary-color,#F2A51D)]"
            >
              <i
                :class="getModuleIcon(moduleData?.title ?? '')"
                class="text-3xl sm:text-[40px]"
              ></i>
            </Svg>
            <div class="min-w-0">
              <span class="block text-sm sm:text-base text-[var(--text-color-light)]"> Modul </span>
              <h1 class="text-2xl sm:text-3xl font-bold text-[var(--text-color)] break-words">
                {{ moduleData?.code }} – {{ moduleData?.title }}
              </h1>
              <p class="mt-1 text-sm sm:text-base text-[var(--text-color-light)]">
                {{ moduleData?.description?.trim().slice(0, 120) }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="lift-hover flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)] shadow-sm"
            >
              <i class="fa-solid fa-pencil"></i>
              Bearbeiten
            </button>
            <button
              type="button"
              class="lift-hover flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)] shadow-sm"
            >
              <i class="fa-regular fa-copy"></i>
              Kopieren
            </button>
            <button
              @click="deleteModule"
              type="button"
              class="lift-hover flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#F08A8A] bg-[var(--surface-color)] px-3 text-sm text-[#E5383B] shadow-sm"
            >
              <i class="fa-regular fa-trash-can"></i>
              Löschen
            </button>
          </div>
        </div>
        <!-- Responsiv: Trennlinien je nach Spaltenanzahl (1 / 2 / 3 / 5 Spalten) -->
        <div
          class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] py-3"
        >
          <div class="px-5 py-2">
            <span class="block text-[var(--text-color-light)]">Modulnummer</span>
            <span class="mt-1 block text-sm text-base text-[var(--text-color)]">{{
              moduleData?.code
            }}</span>
          </div>
          <div
            class="border-t sm:border-t-0 sm:border-l border-[var(--border-color)] px-5 py-2"
          >
            <span class="block text-[var(--text-color-light)]">Titel</span>
            <span class="mt-1 block text-sm text-base text-[var(--text-color)]">{{
              moduleData?.title
            }}</span>
          </div>
          <div
            class="border-t sm:border-t-0 sm:border-l-0 lg:border-l border-[var(--border-color)] px-5 py-2"
          >
            <span class="block text-[var(--text-color-light)]">Beschreibung</span>
            <span class="mt-1 block text-sm text-[var(--text-color)]">
              {{ moduleData?.description?.trim().slice(0, 120) }}
            </span>
          </div>
          <div
            class="border-t sm:border-t-0 sm:border-l lg:border-l-0 xl:border-l border-[var(--border-color)] px-5 py-2"
          >
            <span class="block text-[var(--text-color-light)]">Erstellt am</span>
            <span class="mt-1 block text-sm text-[var(--text-color)]">{{
              moduleData?.createdAt ?? 'Nicht gesetzt'
            }}</span>
          </div>
          <div
            class="border-t sm:border-t-0 sm:border-l-0 lg:border-l border-[var(--border-color)] px-5 py-2"
          >
            <span class="block text-[var(--text-color-light)]">Zuletzt bearbeitet</span>
            <span class="mt-1 block text-sm text-[var(--text-color)]">{{
              moduleData?.updatedAt ?? 'Nicht gesetzt'
            }}</span>
          </div>
        </div>
        <div
          class="mt-6 flex gap-5 sm:gap-8 overflow-x-auto border-b border-[var(--border-color)]"
        >
          <button
            type="button"
            class="-mb-px shrink-0 cursor-pointer border-b-[3px] border-[var(--secondary-color)] px-3 pb-3 text-base font-semibold text-[var(--text-color)]"
          >
            Übersicht
          </button>
          <RouterLink
            :to="`/outlinePlanning/${moduleId}`"
            type="button"
            class="-mb-px shrink-0 cursor-pointer border-b-[3px] border-transparent hover:border-[var(--secondary-color-light)] px-3 pb-3 text-base text-[var(--text-color-light)] hover:text-[var(--text-color)]"
          >
            Grobplanung
          </RouterLink>
          <RouterLink
            :to="`/detailedplanning/${moduleId}`"
            type="button"
            class="-mb-px shrink-0 cursor-pointer border-b-[3px] border-transparent hover:border-[var(--secondary-color-light)] px-3 pb-3 text-base text-[var(--text-color-light)] hover:text-[var(--text-color)]"
          >
            Feinplanung
          </RouterLink>
          <button
            type="button"
            class="-mb-px shrink-0 cursor-pointer border-b-[3px] border-transparent hover:border-[var(--secondary-color-light)] px-3 pb-3 text-base text-[var(--text-color-light)] hover:text-[var(--text-color)]"
          >
            Materialien
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.48fr] gap-5">
        <section
          class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-5 pb-5"
        >
          <h2
            class="flex h-14 items-center border-b border-[var(--border-color)] text-lg font-bold text-[var(--text-color)]"
          >
            Statistik
          </h2>
          <div class="flex flex-col gap-3 pt-3">
            <div class="flex items-center gap-5">
              <Svg class="h-12 w-12 shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]">
                <i class="fa-solid fa-graduation-cap text-xl"></i>
              </Svg>
              <div>
                <span class="block text-lg font-bold text-[var(--text-color)]">{{
                  moduleData?.statistics.courseCount
                }}</span>
                <span class="block text-sm text-[var(--text-color-light)]">Kurse</span>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <Svg class="h-12 w-12 shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]">
                <i class="fa-regular fa-calendar text-xl"></i>
              </Svg>
              <div>
                <span class="block text-lg font-bold text-[var(--text-color)]">{{
                  moduleData?.statistics.dayCount
                }}</span>
                <span class="block text-sm text-[var(--text-color-light)]">
                  Planungstage (gesamt)
                </span>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <Svg class="h-12 w-12 shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]">
                <i class="fa-regular fa-file-lines text-xl"></i>
              </Svg>
              <div>
                <span class="block text-lg font-bold text-[var(--text-color)]">{{
                  moduleData?.statistics.detailedEntryCount
                }}</span>
                <span class="block text-sm text-[var(--text-color-light)]">
                  Unterrichtssequenzen (gesamt)
                </span>
              </div>
            </div>
          </div>
        </section>
        <section
          class="flex flex-col min-h-0 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-5 pb-5"
        >
          <div
            class="flex flex-wrap min-h-14 items-center justify-between gap-3 border-b border-[var(--border-color)]"
          >
            <h2 class="text-lg font-bold text-[var(--text-color)]">Modulbeschreibung</h2>

            <div class="flex gap-2 items-center justify-center">
              <div v-if="changeDescIsSuccessfull != null" class="text-xs">
                <span
                  v-if="changeDescIsSuccessfull"
                  class="text-[var(--success-color)] flex items-center justify-center"
                >
                  <Svg>
                    <i class="fa-regular fa-thumbs-up"></i>
                  </Svg>
                  Gespeichert
                </span>

                <span v-else class="text-[var(--error-color)] flex items-center justify-center">
                  <Svg>
                    <i class="fa-solid fa-x"></i>
                  </Svg>
                  Fehlgeschlagen
                </span>
              </div>
              <SwitchButton :is-on="descriptionEditIsOn" @switch="changeDescription"></SwitchButton>
            </div>
          </div>
          <div
            class="pt-5 text-sm sm:text-base leading-6 text-[var(--text-color-light)] flex min-h-0 flex-1 flex-col"
          >
            <textarea
              v-model="description"
              placeholder="Gebe ein über was dieses Modul geht..."
              :readonly="!descriptionEditIsOn"
              :disabled="!descriptionEditIsOn"
              aria-label="Modulbeschreibung"
              maxlength="500"
              class="w-full h-full min-h-32 outline-0 text-wrap flex-1 resize-none"
            />
          </div>
        </section>
      </div>

      <section
        class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-5 pb-5"
      >
        <div
          class="flex flex-wrap min-h-14 items-center justify-between gap-3 border-b border-[var(--border-color)]"
        >
          <h2 class="text-lg font-bold text-[var(--text-color)]">Lernziele</h2>

          <div class="flex flex-wrap items-center justify-center gap-2">
            <button
              v-if="learningObjEditIsOn"
              @click.stop="addLearningObj"
              type="button"
              class="lift-hover flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)]"
            >
              <i class="fa-solid fa-plus"></i>
              Hinzufügen
            </button>
            <div v-if="changeLearningObjIsSuccessfull != null" class="text-xs">
              <span
                v-if="changeLearningObjIsSuccessfull"
                class="text-[var(--success-color)] flex items-center justify-center"
              >
                <Svg>
                  <i class="fa-regular fa-thumbs-up"></i>
                </Svg>
                Gespeichert
              </span>

              <span v-else class="text-[var(--error-color)] flex items-center justify-center">
                <Svg>
                  <i class="fa-solid fa-x"></i>
                </Svg>
                Fehlgeschlagen
              </span>
            </div>
            <SwitchButton :is-on="learningObjEditIsOn" @switch="changeLearningObj"></SwitchButton>
          </div>
        </div>
        <ul class="space-y-3 pt-4 text-sm sm:text-base leading-6 text-[var(--text-color-light)]">
          <li
            v-for="(learningObject, i) in moduleData?.learningObjectives"
            :key="i"
            class="flex items-start gap-4"
          >
            <div class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary-color)]"></div>
            <input
              @input="updateLearningObjective(i, $event)"
              :value="learningObject"
              maxlength="250"
              :disabled="!learningObjEditIsOn"
              :readonly="!learningObjEditIsOn"
              alt="lernziel"
              class="w-full min-w-0 max-w-[500px] focus:outline-1 outline-[var(--primary-color)] border border-[var(--primary-color)] rounded-lg px-2 py-1"
            />
            <Svg
              v-if="learningObjEditIsOn"
              @click="removeLearningObjective(i)"
              class="lift-hover w-[35px] h-[35px] shrink-0 rounded-lg bg-[var(--error-color-light)] text-[var(--error-color)] cursor-pointer"
            >
              <i class="fa-solid fa-trash-can"></i>
            </Svg>
          </li>

          <li v-if="moduleData && moduleData.learningObjectives.length === 0">
            <div class="flex items-start gap-4">
              <div class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary-color)]"></div>
              Keine Lernziele festgelegt
            </div>
          </li>
        </ul>
      </section>
    </div>
  </SectionComp>
</template>

<style scoped>
.notification-leave-active {
  transition:
    opacity 250ms ease-out,
    transform 250ms ease-out;
  pointer-events: none;
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>