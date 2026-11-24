<script lang="ts" setup>
const props = defineProps<{
  title: string
  subtitle: string
  beginTime: string
  endTime: string
  color?: string
}>()
</script>

<template>
  <div
    :style="{
      '--lesson-color': props.color ?? 'var(--secondary-color)',
      backgroundColor: 'color-mix(in srgb, var(--lesson-color) 12%, var(--surface-color))',
      borderColor: 'color-mix(in srgb, var(--lesson-color) 45%, var(--border-color))',
    }"
    :data-lesson-title="props.title"
    class="flex items-start justify-center grid-cols-1 p-3 rounded-lg border border-l-4"
  >
    <div class="mt-1 mr-4 flex items-center justify-center">
      <div
        class="min-w-[10px] min-h-[10px] rounded-full bg-[var(--lesson-color)]"
        aria-hidden="true"
      ></div>
    </div>

    <div class="w-full min-w-0 flex flex-wrap items-start justify-between gap-2 text-sm">
      <div class="min-w-0 flex flex-col items-start justify-center">
        <span class="text-[var(--text-color)] font-bold">{{ props.title }}</span>
        <span
          v-if="props.subtitle"
          class="text-[var(--text-color-light)] whitespace-pre-line wrap-anywhere"
          >{{ props.subtitle }}</span
        >
      </div>

      <span class="text-[var(--text-color-light)] text-nowrap"
        >{{ props.beginTime }} - {{ props.endTime }}</span
      >
    </div>
  </div>
</template>
