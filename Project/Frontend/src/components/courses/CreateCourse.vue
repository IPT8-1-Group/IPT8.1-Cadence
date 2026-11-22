<script setup lang="ts">
import { reactive } from 'vue'
import Svg from '@/components/ui/Svg.vue'
import type { CreateCourseRequest } from '@/types/course.ts'

const props = defineProps<{
  fk_module_id: number,
}>()

const form = reactive({
  title: '',
  description: '',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', value: CreateCourseRequest): void
}>()

function onClose() {
  emit('close')
  form.title = ''
  form.description = ''
}

function onCreate() {
  emit('create', {
    title: form.title,
    desc: form.description,
    fk_module_id:
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--text-color)_30%,transparent)] p-4 backdrop-blur-sm"
  >
    <form
      @submit.prevent="onCreate"
      class="max-h-[600px] overflow-y-auto flex h-fit w-full max-w-[640px] flex-col rounded-3xl bg-[color:var(--surface-color)] shadow-2xl font-[family-name:var(--font-family)]"
    >
      <div
        class="flex items-center justify-between border-b border-[color:var(--border-color)] px-7 py-6"
      >
        <div class="flex items-center gap-4">
          <h1 class="font-bold leading-tight text-[var(--primary-color)]">Kurs hinzufügen</h1>
        </div>
        <Svg
          @click.stop="onClose"
          class="lift-hover h-[35px] w-[35px] rounded-lg bg-[var(--primary-color-light)] text-[var(--primary-color)] cursor-pointer"
        >
          <i class="fa-solid fa-x"></i>
        </Svg>
      </div>

      <div class="space-y-5 px-7 py-6">
        <div>
          <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]"
            >Kurstitel *</label
          >
          <input
            required
            v-model="form.title"
            type="text"
            placeholder="z. B. Grundlagen der Codierung"
            class="focus:outline-1 outline-[var(--primary-color)] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"
          />
        </div>

        <div>
          <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]"
            >Beschreibung (optional)</label
          >
          <textarea
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
            @click.stop="onClose"
            class="lift-hover cursor-pointer transition duration-75 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] hover:bg-[color:var(--hover-light-color)] h-[50px] px-5 text-[15px] font-semibold text-[color:var(--primary-color)]"
          >
            Abbrechen
          </button>
          <button
            class="lift-hover cursor-pointer inline-flex items-center gap-1 rounded-xl bg-[color:var(--primary-color)] h-[50px] px-5 text-[15px] font-semibold text-[color:var(--text-color-white)]"
          >
            <Svg>
              <i class="fa-solid fa-plus"></i>
            </Svg>
            Modul erstellen
          </button>
        </div>

        <slot></slot>
      </div>
    </form>
  </div>
</template>
