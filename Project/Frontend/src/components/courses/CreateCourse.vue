<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Svg from '@/components/ui/Svg.vue'
import type { CourseScheduleRequest, CreateCourseRequest } from '@/types/course.ts'
import { courseDateKey } from '@/utils/outlineWeek'

const props = defineProps<{
  fk_module_id: number
  busy?: boolean
  withSchedule?: boolean
  initialDate?: string
  initialDayCount?: number
  weekdays?: number[]
  created?: boolean
}>()

const titleInput = ref<HTMLInputElement | null>(null)
onMounted(() => titleInput.value?.focus())

const form = reactive({
  title: '',
  description: '',
  dayCount: props.initialDayCount ?? 1,
  firstDate: props.initialDate ?? courseDateKey(new Date()) ?? '',
  startTime: '08:15',
  endTime: '11:45',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', value: CreateCourseRequest, schedule?: CourseScheduleRequest): void
}>()

function onClose() {
  if (!props.busy) emit('close')
}

function onCreate() {
  if (
    props.busy ||
    !form.title.trim() ||
    !Number.isInteger(form.dayCount) ||
    form.dayCount < 1 ||
    form.dayCount > 365 ||
    (props.withSchedule && (!form.firstDate || form.endTime <= form.startTime))
  )
    return
  emit(
    'create',
    {
      title: form.title.trim(),
      desc: form.description.trim() || null,
      fk_module_id: props.fk_module_id,
      dayCount: form.dayCount,
    },
    props.withSchedule
      ? {
          firstDate: form.firstDate,
          startTime: form.startTime,
          endTime: form.endTime,
          weekdays: props.weekdays ?? [],
        }
      : undefined,
  )
}
</script>

<template>
  <div
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-[color:color-mix(in_srgb,var(--text-color)_30%,transparent)] p-4 backdrop-blur-sm"
  >
    <form
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-course-heading"
      @keydown.esc.stop="onClose"
      @submit.prevent="onCreate"
      class="max-h-[600px] overflow-y-auto flex h-fit w-full max-w-[640px] flex-col rounded-3xl bg-[color:var(--surface-color)] shadow-2xl font-[family-name:var(--font-family)]"
    >
      <div
        class="flex items-center justify-between border-b border-[color:var(--border-color)] px-7 py-6"
      >
        <div class="flex items-center gap-4">
          <h1 id="new-course-heading" class="font-bold leading-tight text-[var(--primary-color)]">
            Klasse hinzufügen
          </h1>
        </div>
        <button
          type="button"
          :disabled="busy"
          aria-label="Schliessen"
          @click="onClose"
          class="lift-hover size-[35px] cursor-pointer rounded-lg bg-[var(--primary-color-light)] text-[var(--primary-color)]"
        >
          <Svg><i class="fa-solid fa-x"></i></Svg>
        </button>
      </div>

      <div class="space-y-5 px-7 py-6">
        <div>
          <label
            for="new-course-title"
            class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]"
            >Klassenname</label
          >
          <input
            id="new-course-title"
            ref="titleInput"
            required
            maxlength="100"
            pattern=".*\S.*"
            :disabled="busy || created"
            v-model="form.title"
            type="text"
            placeholder="z. B. IMS24a"
            class="focus:outline-1 outline-[var(--primary-color)] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"
          />
        </div>

        <div>
          <label
            for="new-course-days"
            class="mb-2 block text-[15px] font-semibold text-[var(--primary-color)]"
          >
            Anzahl Kurstage
          </label>
          <input
            id="new-course-days"
            v-model.number="form.dayCount"
            type="number"
            min="1"
            max="365"
            step="1"
            required
            :disabled="busy || created"
            class="w-28 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-3 text-base"
          />
        </div>

        <div v-if="withSchedule" class="grid gap-4 sm:grid-cols-2">
          <label
            class="grid gap-2 text-[15px] font-semibold text-[var(--primary-color)] sm:col-span-2"
          >
            Erster Unterrichtstag
            <input
              v-model="form.firstDate"
              type="date"
              required
              max="2038-01-19"
              :disabled="busy || created"
              class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-3 text-base text-[var(--text-color)]"
            />
          </label>
          <label class="grid gap-2 text-[15px] font-semibold text-[var(--primary-color)]">
            Startzeit
            <input
              v-model="form.startTime"
              type="time"
              required
              :disabled="busy || created"
              class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-3 text-base text-[var(--text-color)]"
            />
          </label>
          <label class="grid gap-2 text-[15px] font-semibold text-[var(--primary-color)]">
            Endzeit
            <input
              v-model="form.endTime"
              type="time"
              required
              :disabled="busy || created"
              class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-3 text-base text-[var(--text-color)]"
            />
          </label>
          <p
            v-if="form.endTime <= form.startTime"
            role="alert"
            class="text-sm text-[var(--error-color)] sm:col-span-2"
          >
            Die Endzeit muss nach der Startzeit liegen.
          </p>
          <p class="text-sm font-normal text-[var(--text-color-light)] sm:col-span-2">
            Weitere Kurstage folgen den oben gewählten Wochentagen. Die Inhalte der gewählten Klasse
            werden übernommen.
          </p>
        </div>

        <div>
          <label
            for="new-course-description"
            class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]"
            >Beschreibung (optional)</label
          >
          <textarea
            id="new-course-description"
            maxlength="255"
            :disabled="busy || created"
            v-model="form.description"
            rows="3"
            placeholder="Kurze Beschreibung eingeben"
            class="focus:outline-1 outline-[var(--primary-color)] max-h-[250px] min-h-[100px] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"
          ></textarea>
        </div>
      </div>
      <div
        class="flex flex-col items-end gap-3 border-t border-[color:var(--border-color)] bg-[color:var(--background-color)] px-7 py-4"
      >
        <div class="flex gap-3">
          <button
            type="button"
            :disabled="busy"
            @click="onClose"
            class="lift-hover cursor-pointer transition duration-75 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] hover:bg-[color:var(--hover-light-color)] h-[50px] px-5 text-[15px] font-semibold text-[color:var(--primary-color)]"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            :disabled="busy"
            class="lift-hover cursor-pointer inline-flex items-center gap-1 rounded-xl bg-[color:var(--primary-color)] h-[50px] px-5 text-[15px] font-semibold text-[color:var(--text-color-white)]"
          >
            <Svg>
              <i class="fa-solid fa-plus"></i>
            </Svg>
            {{
              busy
                ? 'Wird gespeichert …'
                : created
                  ? 'Planung erneut speichern'
                  : 'Klasse erstellen'
            }}
          </button>
        </div>

        <slot></slot>
      </div>
    </form>
  </div>
</template>
