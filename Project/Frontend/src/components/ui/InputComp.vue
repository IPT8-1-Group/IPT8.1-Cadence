<script lang="ts" setup>
import Svg from '@/components/ui/Svg.vue'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  type: string
  required: boolean
  placeholder: string
  label: string
}>()
</script>

<template>
  <div
    class="focus-within:border-[var(--secondary-color)] flex items-center justify-center gap-2 text-[var(--text-color-light)] bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg px-4 py-3"
  >
    <Svg>
      <slot></slot>
    </Svg>
    <input
      v-model="model"
      :required="props.required"
      :aria-label="props.label"
      :type="props.type"
      :placeholder="props.placeholder"
      class="w-full outline-none text-sm"
    />
  </div>
</template>
