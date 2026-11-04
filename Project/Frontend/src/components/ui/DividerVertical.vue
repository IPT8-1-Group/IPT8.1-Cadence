<script lang="ts" setup>
const props = defineProps<{
  color: string
}>()
</script>

<template>
  <div class="w-[1px] min-h-[100px] h-full" :style="{ 'background-color': props.color }"></div>
</template>
