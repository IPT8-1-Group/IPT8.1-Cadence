<script lang="ts" setup>
import Svg from '@/components/ui/Svg.vue'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  notification: string
  undoOn: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'undo'): void
}>()

let timeout: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  timeout = setTimeout(() => emit('close'), 6000)
})

onUnmounted(() => {
  clearTimeout(timeout)
})
</script>

<template>
  <div class="inset-x-0 top-20 flex items-center justify-center fixed z-99 mx-auto">
    <div
      class="notification-card relative overflow-hidden mx-4 px-4 py-3 flex items-center justify-center gap-6 min-w-[250px] bg-[var(--surface-color)] rounded-xl shadow-lg text-sm text-[var(--text-color)] border border-[var(--border-color)]"
    >
      <div
        aria-hidden="true"
        class="notification-progress inset-x-0 bg-[var(--primary-color)] h-[3px] absolute top-0 origin-left"
      ></div>

      <Svg class="text-[var(--primary-color)] text-lg">
        <slot></slot>
      </Svg>
      <span>{{ props.notification }}</span>
      <div class="flex items-center justify-center gap-1">
        <Svg
          v-if="undoOn"
          @click="emit('undo')"
          aria-label="Aktion zurücksetzen"
          class="hover:text-[var(--primary-color)] duration-75 transition w-[30px] h-[30px] cursor-pointer text-xs"
        >
          <i class="fa-solid fa-arrow-rotate-left"></i>
        </Svg>
        <Svg
          @click="emit('close')"
          aria-label="Meldung schliessen"
          class="hover:text-[var(--primary-color)] duration-75 transition w-[30px] h-[30px] cursor-pointer text-xs"
        >
          <i class="fa-solid fa-x" aria-hidden="true"></i>
        </Svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-card {
  animation: pushIn 0.5s ease-out;
}

.notification-progress {
  animation: countdown 6s linear forwards;
}

@keyframes pushIn {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 100%;
  }
}

@keyframes countdown {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
