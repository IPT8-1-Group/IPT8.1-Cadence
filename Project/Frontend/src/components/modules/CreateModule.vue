<script setup lang="ts">
import { reactive } from 'vue'
import Svg from '@/components/ui/Svg.vue'
import type { CreateModuleRequest, CreateModuleRequestALearningObj } from '@/types/module.ts'

const form = reactive({
  code: '',
  title: '',
  description: '',
  learningObjectives: [''],
})

function addLernziel() {
  return form.learningObjectives.push('')
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', value: CreateModuleRequestALearningObj): void
}>()

function onClose() {
  emit('close')
  form.code = ''
  form.title = ''
  form.description = ''
  form.learningObjectives = ['']
}

function onCreate() {
  emit('create', {
    code: form.code,
    title: form.title,
    description: form.description,
    learningObjectives: form.learningObjectives,
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--text-color)_30%,transparent)] p-4 backdrop-blur-sm"
  >
    <form
      @submit.prevent="onCreate"
      class="max-h-[600px] overflow-y-auto flex h-full w-full max-w-[640px] flex-col rounded-3xl bg-[color:var(--surface-color)] shadow-2xl font-[family-name:var(--font-family)]"
    >
      <div
        class="flex items-center justify-between border-b border-[color:var(--border-color)] px-7 py-6"
      >
        <div class="flex items-center gap-4">
          <h1 class="font-bold leading-tight text-[var(--primary-color)]">Neues Modul erstellen</h1>
        </div>
        <Svg
          @click.stop="onClose"
          class="lift-hover h-[35px] w-[35px] rounded-lg bg-[var(--primary-color-light)] text-[var(--primary-color)] cursor-pointer"
        >
          <i class="fa-solid fa-x"></i>
        </Svg>
      </div>

      <div class="space-y-5 px-7 py-6">
        <div class="grid grid-cols-[1fr_1.6fr] gap-4">
          <div>
            <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]"
              >Modulnummer *</label
            >
            <input
              required
              v-model="form.code"
              type="text"
              placeholder="z. B. M321"
              class="focus:outline-1 outline-[var(--primary-color)] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"
            />
          </div>
          <div>
            <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]"
              >Titel *</label
            >
            <input
              required
              v-model="form.title"
              type="text"
              placeholder="z. B. Verteilte Systeme"
              class="focus:outline-1 outline-[var(--primary-color)] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"
            />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]"
            >Beschreibung</label
          >
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Worum geht es in diesem Modul?"
            class="focus:outline-1 outline-[var(--primary-color)] max-h-[250px] min-h-[100px] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"
          ></textarea>
        </div>

        <div>
          <div class="mb-2 flex items-baseline gap-2">
            <span class="text-[15px] font-semibold text-[color:var(--primary-color)]"
              >Lernziele</span
            >
            <span class="text-sm text-[color:var(--text-color-light)]">Optional</span>
          </div>
          <div class="flex flex-col gap-2 items-center justify-center">
            <input
              v-for="(lernziel, i) in form.learningObjectives"
              :key="i"
              v-model="form.learningObjectives[i]"
              type="text"
              placeholder="z. B. REST-Schnittstellen anwenden"
              class="focus:outline-1 outline-[var(--primary-color)] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"
            />
          </div>
          <div
            @click="addLernziel"
            class="hover:text-[var(--secondary-color)] cursor-pointer select-none mt-3 flex items-center gap-1 text-[15px] font-semibold text-[color:var(--primary-color)]"
          >
            <Svg>
              <i class="fa-solid fa-plus"></i>
            </Svg>
            Lernziel hinzufügen
          </div>
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
