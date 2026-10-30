<script lang="ts" setup>
const props = defineProps<{
  title: string
  subtitle: string
  beginTime: string
  endTime: string
}>()
</script>

<template>
  <div
    class="flex items-start justify-center grid-cols-1 p-3 rounded-lg bg-[var(--secondary-color-light)]"
  >
    <div class="mt-1 mr-4 flex items-center justify-center">
      <div class="min-w-[10px] min-h-[10px] rounded-full bg-[var(--secondary-color)]"></div>
    </div>

    <div class="w-full flex items-start justify-between gap-5 text-sm">
      <div class="flex flex-col items-start justify-center text-nowrap">
        <span class="text-[var(--text-color)] font-bold">{{ props.title }}</span>
        <span class="text-[var(--text-color-light)]">{{ props.subtitle }}</span>
      </div>

      <span class="text-[var(--text-color-light)] text-nowrap"
        >{{ props.beginTime }} - {{ props.endTime }}</span
      >
    </div>
  </div>
</template>
