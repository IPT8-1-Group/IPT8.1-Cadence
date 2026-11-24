<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import Svg from '@/components/ui/Svg.vue'

const actions = [
  { id: 'duplicate', label: 'Modul duplizieren', icon: 'fa-regular fa-clone' },
] as const

type EditAction = (typeof actions)[number]['id']

const emit = defineEmits<{ select: [action: EditAction]; delete: [] }>()

function onDelete() {
  emit('delete')
}
</script>

<template>
  <Menu as="div" class="relative inline-flex" v-slot="{ open }" @click.stop>
    <MenuButton
      type="button"
      aria-label="Modul optionen"
      class="hover:bg-[var(--hover-light-color)] hover:border-[var(--primary-color)] transition duration-75 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--primary-color)] focus:outline-1 outline-[var(--primary-color)]"
      :class="{ 'bg-[var(--hover-light-color)]': open }"
    >
      <Svg>
        <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
      </Svg>
    </MenuButton>

    <MenuItems
      class="outline-0 outline-[var(--primary-color)] absolute right-0 top-full z-30 mt-2 w-68 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-2 text-[var(--text-color)] text-sm shadow-xl"
    >
      <div aria-hidden="true" class="px-3 pb-2 pt-1 text-sm font-semibold">Optionen</div>

      <MenuItem v-for="action in actions" :key="action.id" as="template" v-slot="{ active }">
        <button
          type="button"
          class="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition duration-75"
          :class="{ 'bg-[var(--hover-light-color)]': active }"
          @click="emit('select', action.id)"
        >
          <i
            :class="['fa-solid fa-fw text-[var(--primary-color)]', action.icon]"
            aria-hidden="true"
          ></i>
          {{ action.label }}
        </button>
      </MenuItem>

      <MenuItem as="template" v-slot="{ active }">
        <button
          type="button"
          class="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[var(--error-color)] transition duration-75"
          :class="{ 'bg-[var(--error-color-light)]': active }"
          @click="onDelete"
        >
          <i :class="['fa-fw', 'fa-solid fa-trash-can']" aria-hidden="true"></i>
          Modul löschen
        </button>
      </MenuItem>
    </MenuItems>
  </Menu>
</template>
