<script lang="ts" setup>
import { ref } from 'vue'
import Logo from '@/components/ui/Logo.vue'
import Svg from '@/components/ui/Svg.vue'

const showPassword = ref(false)
</script>
<template>
  <header class="fixed top-0 left-0 px-6 py-8 sm:px-10">
    <RouterLink
      to="/"
      class="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)]"
    >
      <Logo class="w-[120px]"></Logo>
    </RouterLink>
  </header>

  <section class="flex min-h-screen items-center justify-center px-6 py-12">
    <img
      src="../../assets/images/bg-auth.png"
      alt="background image login page"
      class="fixed inset-x-0 bottom-0 -z-1"
    />

    <div class="w-full max-w-md">
      <form
        @submit.prevent
        class="space-y-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 shadow-lg sm:p-8 -z-1"
        action="#"
      >
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold text-[var(--text-color)]">Anmelden</h1>
          <p class="mt-2 text-sm text-[var(--text-color-light)]">
            Melde dich an, um deine Unterrichtsplanung fortzusetzen.
          </p>
        </div>
        <div class="relative">
          <input
            type="email"
            name="email"
            id="email"
            class="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-2.5 pl-10 text-[var(--text-color)] placeholder:text-[var(--text-color-light)] focus:border-[var(--secondary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--secondary-color)]"
            placeholder="E-Mail-Adresse"
            required
          />
          <i
            class="fa-regular fa-envelope pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-light)]"
            aria-hidden="true"
          ></i>
        </div>
        <div>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              name="password"
              id="password"
              placeholder="Passwort"
              class="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-2.5 pl-10 pr-10 text-[var(--text-color)] placeholder:text-[var(--text-color-light)] focus:border-[var(--secondary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--secondary-color)]"
              required
            />
            <i
              class="fa-solid fa-lock pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-light)]"
              aria-hidden="true"
            ></i>
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-color-light)] hover:text-[var(--text-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)]"
              :aria-label="showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <i
                class="cursor-pointer"
                :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"
                aria-hidden="true"
              ></i>
            </button>
          </div>
        </div>
        <button
          type="submit"
          class="flex items-center justify-center gap-1 cursor-pointer lift-hover w-full rounded-xl bg-[var(--primary-color)] px-5 py-3 text-sm font-semibold text-[var(--text-color-white)] transition duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Anmelden
          <Svg>
            <i class="fa-solid fa-angle-right"></i>
          </Svg>
        </button>
      </form>
    </div>
  </section>
</template>
