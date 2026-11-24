<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import Svg from '@/components/ui/Svg.vue'

const actions = [
  { id: 'details', label: 'Moduldaten bearbeiten', icon: 'fa-regular fa-pen-to-square' },
  { id: 'outline', label: 'Grobplanung bearbeiten', icon: 'fa-regular fa-calendar' },
  { id: 'detailPlan', label: 'Feinplanung bearbeiten', icon: 'fa-solid fa-pen-ruler' },
] as const

type EditAction = (typeof actions)[number]['id']

const emit = defineEmits<{ select: [action: EditAction] }>()
</script>

<template>
  <Menu as="div" class="relative inline-flex" v-slot="{ open }" @click.stop>
    <MenuButton
      type="button"
      aria-label="Modul bearbeiten"
      class="hover:bg-[var(--hover-light-color)] hover:border-[var(--primary-color)] transition duration-75 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--primary-color)] focus:outline-1 outline-[var(--primary-color)]"
      :class="{ 'bg-[var(--hover-light-color)]': open }"
    >
      <Svg>
        <i class="fa-solid fa-pencil" aria-hidden="true"></i>
      </Svg>
    </MenuButton>

    <MenuItems
      class="outline-0 outline-[var(--primary-color)] absolute right-0 top-full z-30 mt-2 w-68 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-2 text-[var(--text-color)] text-sm shadow-xl"
    >
      <div aria-hidden="true" class="px-3 pb-2 pt-1 text-sm font-semibold">Bearbeiten</div>

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
    </MenuItems>
  </Menu>
</template>
