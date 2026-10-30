<script lang="ts" setup>
const props = defineProps<{
  count: number
  text: string
}>()
</script>

<template>
  <div class="flex items-center justify-start gap-4">
    <div
      class="text-sm flex items-center justify-center border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color-light)] rounded-full w-[30px] h-[30px]"
    >
      {{ props.count }}
    </div>

    <p class="font-medium text-[var(--text-color-light)] text-sm">
      {{ props.text }}
    </p>
  </div>
</template>
