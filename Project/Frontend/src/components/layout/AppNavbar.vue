<script lang="ts" setup>
import Svg from '@/components/ui/Svg.vue'
import Logo from '@/components/ui/Logo.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { ref } from 'vue'
import router from '@/router'

const error = ref<string | null>(null)
const authStore = useAuthStore()
async function sendLogout() {
  error.value = ''
  try {
    if (!(await authStore.logout())) {
      return (error.value = authStore.error ?? 'Abmeldung fehlgeschlagen.')
    }
    await router.push('/login')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen'
  }
}
</script>

<template>
  <nav
    class="z-999 sticky inset-x-0 top-0 bg-[var(--surface-color)] px-3 py-3 md:px-6 grid grid-cols-2 md:grid-cols-8 gap-2 md:gap-5 items-center justify-center w-full border border-transparent border-b-[var(--border-color)]"
  >
    <RouterLink
      to="/dashboard"
      class="order-1 md:order-none border-none! col-span-1 flex items-center justify-center min-w-[30px] h-full"
    >
      <Logo class="w-[120px] min-w-[100px]"></Logo>
    </RouterLink>
    <div
      class="fixed inset-x-0 bottom-0 z-999 order-3 md:static md:order-none col-span-2 md:col-span-5 flex items-center justify-center gap-2 border-t border-[var(--border-color)] bg-[var(--surface-color)] px-3 pt-3 pb-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:gap-1 md:justify-start"
    >
      <RouterLink
        to="/dashboard"
        class="hover:border-b-[var(--border-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-4 py-3 md:px-3 md:py-2 flex items-center justify-center h-full gap-2 text-base md:text-sm font-semibold border border-transparent border-b-[3px]"
      >
        <Svg class="svg">
          <i class="fa-regular fa-house text-lg"></i>
        </Svg>
        <span>Dashboard</span>
      </RouterLink>

      <RouterLink
        to="/modules"
        class="hover:border-b-[var(--border-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-4 py-3 md:px-3 md:py-2 flex items-center justify-center h-full gap-2 text-base md:text-sm font-semibold border border-transparent border-b-[3px]"
      >
        <Svg class="svg">
          <i class="fa-solid fa-cubes-stacked text-lg"></i>
        </Svg>
        <span>Module</span>
      </RouterLink>
    </div>

    <div class="order-2 md:order-none col-span-1 md:col-span-2 flex items-center justify-end gap-1">
      <RouterLink
        to="/settings"
        aria-label="Einstellungen"
        class="hover:border-[var(--secondary-color)] hover:text-[var(--secondary-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-3 py-2 flex items-center justify-center h-full gap-2 text-sm font-semibold border border-[var(--border-color)] rounded-xl"
      >
        <Svg class="svg">
          <i class="fa-solid fa-gear"></i>
        </Svg>
      </RouterLink>

      <button
        @click="sendLogout"
        type="button"
        aria-label="Abmelden"
        class="hover:border-[var(--secondary-color)] hover:text-[var(--secondary-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-3 py-2 flex items-center justify-center h-full gap-2 text-sm font-semibold border border-[var(--border-color)] rounded-xl"
      >
        <Svg class="svg">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </Svg>
        <span class="hidden sm:inline">Abmelden</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  font-weight: bold;
  border-bottom: 3px var(--secondary-color) solid;
  color: var(--text-color);
}

.router-link-active .svg {
  color: var(--secondary-color);
}
</style>
