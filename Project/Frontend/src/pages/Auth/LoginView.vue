<script lang="ts" setup>
import { ref } from 'vue'

const showPassword = ref(false)
</script>
<template>
  
  <section class="flex min-h-screen items-center justify-center bg-[var(--background-color)] px-6 py-12">
    <div class="w-full max-w-md">
    
      <form class="space-y-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 shadow-lg sm:p-8" action="#">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold text-[var(--text-color)]">Anmelden</h1>
          <p class="mt-2 text-sm  text-[var(--text-color-light)]">Melde dich an, um deine Unterrichsplanug forzusetzen.</p>
        </div>
        <div class="relative">
          <input
            type="email"
            name="email"
            id="email"
            class="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-2.5 pl-10 text-[var(--text-color)] placeholder:text-[var(--text-color-light)] focus:border-[var(--secondary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
            placeholder="E-Mail-Adresse"
            required>
          <i class="fa-regular fa-envelope pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-light)]" aria-hidden="true"></i>
        </div>
        <div>
          <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            name="password"
            id="password"
            placeholder="Passwort"
            class="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-2.5 pl-10 pr-10 text-[var(--text-color)] placeholder:text-[var(--text-color-light)] focus:border-[var(--secondary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
            required>
            <i class="fa-solid fa-lock pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-light)]" aria-hidden="true"></i>
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-color-light)] hover:text-[var(--text-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)]"
              :aria-label="showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword">
              <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <button type="submit"class="w-full rounded-xl bg-[var(--primary-color)] px-5 py-3 text-sm font-semibold text-[var(--text-color-white)] transition duration-200 hover:bg-[var(--primary-color-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)] focus-visible:ring-offset-2 active:scale-[0.98]">
          Anmelden ->
        </button>  
      </form>
    </div>
  </section>
  <img
        src="../../assets/images/bg-register.png"
        alt="background image register page"
        class="fixed inset-x-0 bottom-0 -z-1"
      />
</template>
