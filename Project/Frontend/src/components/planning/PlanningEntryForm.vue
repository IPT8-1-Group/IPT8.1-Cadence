<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { CreateFeinplanungRequest, Feinplanung } from '@/types/feinplanung'

const props = defineProps<{ entry: Feinplanung | null; dayId: number; busy: boolean }>()
const emit = defineEmits<{ save: [data: CreateFeinplanungRequest]; cancel: [] }>()
const topicInput = ref<HTMLInputElement | null>(null)
onMounted(() => topicInput.value?.focus())
const draft = reactive({
  topic: props.entry?.topic ?? '',
  desc: props.entry?.desc ?? '',
  dur_min: props.entry?.dur_min ?? 15,
  method: props.entry?.method ?? '',
  medium: props.entry?.medium ?? '',
  comment: props.entry?.comment ?? '',
})

const labelClass = 'grid content-start gap-1 text-sm'
const fieldClass =
  'w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 focus-visible:outline focus-visible:outline-[var(--secondary-color)]'
const buttonClass =
  'cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 text-sm disabled:opacity-50'

function submit() {
  if (!draft.topic.trim() || !Number.isInteger(draft.dur_min) || draft.dur_min < 1) return
  emit('save', {
    fk_course_day: props.dayId,
    topic: draft.topic.trim(),
    dur_min: draft.dur_min,
    desc: draft.desc.trim() || null,
    method: draft.method.trim() || null,
    medium: draft.medium.trim() || null,
    comment: draft.comment.trim() || null,
  })
}
</script>

<template>
  <form
    class="rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] p-4"
    @submit.prevent="submit"
  >
    <fieldset :disabled="busy" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <legend class="mb-3 font-semibold">{{ entry ? 'Zeile bearbeiten' : 'Neue Zeile' }}</legend>
      <label :class="labelClass"
        >Inhalt
        <input
          :class="fieldClass"
          ref="topicInput"
          v-model="draft.topic"
          required
          maxlength="100"
          pattern=".*\S.*"
      /></label>
      <label :class="labelClass"
        >Dauer in Minuten
        <input
          :class="fieldClass"
          v-model.number="draft.dur_min"
          type="number"
          min="1"
          max="2147483647"
          step="1"
          required
      /></label>
      <label :class="labelClass"
        >Methode
        <input :class="fieldClass" v-model="draft.method" maxlength="100" list="planning-methods"
      /></label>
      <datalist id="planning-methods">
        <option>Plenum</option>
        <option>Einzelarbeit</option>
        <option>Partnerarbeit</option>
        <option>Gruppenarbeit</option>
      </datalist>
      <label :class="labelClass"
        >Mittel
        <input :class="fieldClass" v-model="draft.medium" maxlength="100" list="planning-media"
      /></label>
      <datalist id="planning-media">
        <option>Beamer</option>
        <option>Whiteboard</option>
        <option>Arbeitsblatt</option>
      </datalist>
      <label :class="labelClass"
        >Beschreibung <textarea :class="fieldClass" v-model="draft.desc" maxlength="255" rows="2" />
      </label>
      <label :class="labelClass"
        >Kommentar <textarea :class="fieldClass" v-model="draft.comment" maxlength="255" rows="2" />
      </label>
      <div class="flex gap-3 sm:col-span-full">
        <button
          type="submit"
          :class="buttonClass"
          class="bg-[var(--secondary-color-light)]! font-bold"
        >
          Speichern
        </button>
        <button type="button" :class="buttonClass" @click="emit('cancel')">Abbrechen</button>
      </div>
    </fieldset>
  </form>
</template>
