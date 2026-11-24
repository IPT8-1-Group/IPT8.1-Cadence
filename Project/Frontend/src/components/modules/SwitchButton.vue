<script setup lang="ts">
const props = defineProps<{
  isOn: boolean
}>()

const emit = defineEmits<{
  (e: 'switch', value: boolean): void
}>()
</script>

<template>
  <button
    v-if="!props?.isOn"
    @click.stop="emit('switch', !props?.isOn)"
    type="button"
    class="lift-hover flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)]"
  >
    <i class="fa-solid fa-pencil"></i>
    Bearbeiten
  </button>
  <button
    v-else
    @click.stop="emit('switch', !props?.isOn)"
    type="button"
    class="lift-hover flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--primary-color)] px-3 text-sm text-[var(--text-color-white)]"
  >
    <i class="fa-regular fa-floppy-disk"></i>
    Speichern
  </button>
</template>
