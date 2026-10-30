<script lang="ts" setup>
const props = defineProps<{
  color: string
}>()
</script>

<template>
  <div class="w-full h-[1px]" :style="{ 'background-color': props.color }"></div>
</template>
