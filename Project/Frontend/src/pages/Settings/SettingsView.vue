<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import Svg from '@/components/ui/Svg.vue'
import {
  applyThemePreference,
  getThemePreference,
  type ThemePreference,
} from '@/utils/theme.ts'
import { useAuthStore } from '@/stores/authStore.ts'


const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const authStore = useAuthStore()

async function changePassword() {
  passwordMessage.value = null

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordMessage.value = { type: 'error', text: 'Alle Passwortfelder müssen ausgefüllt sein.' }
    return
  }

  if (newPassword.value.length < 8) {
    passwordMessage.value = { type: 'error', text: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.' }
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = { type: 'error', text: 'Die neuen Passwörter stimmen nicht überein.' }
    return
  }

  if (newPassword.value === currentPassword.value) {
    passwordMessage.value = { type: 'error', text: 'Das neue Passwort muss sich vom aktuellen unterscheiden.' }
    return
  }

  const result = await authStore.changePassword(currentPassword.value, newPassword.value)

  if (!result) {
    passwordMessage.value = {
      type: 'error',
      text: authStore.error ?? 'Das Passwort konnte nicht geändert werden.',
    }
    return
  }

  passwordMessage.value = { type: 'success', text: 'Passwort erfolgreich geändert.' }
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

// Active navigation section
const activeSection = ref('account')

const sections = ['account', 'security', 'appearance'] as const
type SectionId = (typeof sections)[number]

// Update active section based on scroll position
const updateActiveSection = () => {
  const offset = 150

  const isAtBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 10

  if (isAtBottom) {
    activeSection.value = 'appearance'
    return
  }

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i]!
    const element = document.getElementById(section)

    if (element && element.getBoundingClientRect().top <= offset) {
      activeSection.value = section
      return
    }
  }

  activeSection.value = 'account'
}


const navigateTo = (section: SectionId) => {
  activeSection.value = section

  document.getElementById(section)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })

  history.replaceState(null, '', `#${section}`)
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  window.addEventListener('resize', updateActiveSection)

  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
  window.removeEventListener('resize', updateActiveSection)
})

const GOLD = '#E4A51F'


const palettes = {
  light: {
    page: '#F1F1F4',
    bar: '#FFFFFF',
    pill: '#1B2A4A',
    dash: '#E2DED3',
    card: '#FFFFFF',
    border: '#E5E0D2',
    line: '#4A5C82',
    muted: '#E2DED3',
  },
  dark: {
    page: '#0E1527',
    bar: '#172036',
    pill: '#FFFFFF',
    dash: '#3A4668',
    card: '#172036',
    border: '#2A3552',
    line: '#8C9CC0',
    muted: '#2E3A5A',
  },
}

const themes = [
  {
    id: 'light',
    label: 'Hell',
    description: 'Helle Benutzeroberfläche.',
    icon: 'fa-regular fa-sun',
    system: false,
    layers: [{ p: palettes.light, clip: undefined as string | undefined }],
  },
  {
    id: 'dark',
    label: 'Dunkel',
    description: 'Dunkle Benutzeroberfläche.',
    icon: 'fa-regular fa-moon',
    system: false,
    layers: [{ p: palettes.dark, clip: undefined as string | undefined }],
  },
  {
    id: 'system',
    label: 'System',
    description: 'Passt sich am System an.',
    icon: 'fa-solid fa-desktop',
    system: true,
    layers: [
      { p: palettes.light, clip: undefined as string | undefined },
      { p: palettes.dark, clip: 'polygon(62% 0, 100% 0, 100% 100%, 38% 100%)' },
    ],
  },
] as const

const selectedTheme = ref<ThemePreference>(getThemePreference())

function selectTheme(theme: ThemePreference) {
  selectedTheme.value = theme
  applyThemePreference(theme)
}
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <header class="mx-4 mb-8 mt-8 flex max-w-2xl flex-col items-start gap-3 sm:mx-8 sm:mb-10 sm:mt-10">
      <span class="subtitle text-[var(--text-color-light)]">
        Konto &amp; Einstellungen
      </span>

      <h1 class="tracking-tight">Einstellungen</h1>

      <p class="text-[var(--text-color-light)]">
        Verwalte dein Benutzerkonto, deine Sicherheit und das Erscheinungsbild von Cadence.
      </p>
    </header>

    <div class="mx-4 mb-12 grid grid-cols-1 gap-6 sm:mx-8 sm:mb-16 lg:grid-cols-[224px_1fr] lg:gap-8">

      <!-- Side navigation -->
      <nav aria-label="Einstellungen" class="lg:sticky lg:top-24 lg:self-start">
        <ul class="flex gap-1 overflow-x-auto lg:flex-col">

          <!-- My Account(Sidebar) -->
          <li class="shrink-0">
            <a href="#account" @click.prevent="navigateTo('account')"
              class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-200" :class="activeSection === 'account'
                ? 'bg-[var(--secondary-color-light)] font-semibold text-[var(--secondary-color)]'
                : 'text-[var(--text-color-light)] hover:bg-[var(--hover-light-color)] hover:text-[var(--text-color)]'
                " :aria-current="activeSection === 'account' ? 'location' : undefined">
              <Svg><i class="fa-regular fa-user"></i></Svg>
              <span class="text-nowrap">Mein Konto</span>
            </a>
          </li>

          <!-- Security(Sidebar) -->
          <li class="shrink-0">
            <a href="#security" @click.prevent="navigateTo('security')"
              class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-200" :class="activeSection === 'security'
                ? 'bg-[var(--secondary-color-light)] font-semibold text-[var(--secondary-color)]'
                : 'text-[var(--text-color-light)] hover:bg-[var(--hover-light-color)] hover:text-[var(--text-color)]'
                " :aria-current="activeSection === 'security' ? 'location' : undefined">
              <Svg><i class="fa-solid fa-shield-halved"></i></Svg>
              <span class="text-nowrap">Sicherheit</span>
            </a>
          </li>

         
          <li class="shrink-0">
            <a href="#appearance" @click.prevent="navigateTo('appearance')"
              class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-200" :class="activeSection === 'appearance'
                ? 'bg-[var(--secondary-color-light)] font-semibold text-[var(--secondary-color)]'
                : 'text-[var(--text-color-light)] hover:bg-[var(--hover-light-color)] hover:text-[var(--text-color)]'
                " :aria-current="activeSection === 'appearance' ? 'location' : undefined">
              <Svg><i class="fa-solid fa-palette"></i></Svg>
              <span class="text-nowrap">Darstellung</span>
            </a>
          </li>

        </ul>
      </nav>

      <div class="flex min-w-0 flex-col gap-6">

        <!-- Account -->
        <section id="account"
          class="scroll-mt-24 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] shadow-sm">
          <div class="p-5 sm:p-8">

            <header class="mb-6 flex items-start gap-4 sm:mb-8">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary-color-light)] text-[var(--secondary-color)]">
                <i class="fa-regular fa-user"></i>
              </div>

              <div class="flex flex-col gap-1">
                <h2 class="text-lg font-semibold text-[var(--text-color)]">
                  Mein Konto
                </h2>

                <p class="text-sm text-[var(--text-color-light)]">
                  Verwalte deine persönlichen Kontoinformationen.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">

              <!-- Email -->
              <div class="flex flex-col gap-2">
                <label for="email" class="text-xs font-semibold text-[var(--text-color)]">
                  E-Mail-Adresse
                </label>

                <div
                  class="flex h-11 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 transition duration-200 focus-within:border-[var(--secondary-color)] focus-within:ring-2 focus-within:ring-[var(--secondary-color)]/20">
                  <Svg class="text-[var(--text-color-light)]">
                    <i class="fa-regular fa-envelope"></i>
                  </Svg>

                  <input id="email" type="email" :value="authStore.email ?? ''" readonly
                    class="h-full min-w-0 flex-1 cursor-not-allowed bg-transparent text-sm text-[var(--text-color-light)] outline-none" />
                </div>
              </div>

              
              <div class="flex flex-col gap-2">
                <label for="role" class="text-xs font-semibold text-[var(--text-color)]">
                  Benutzerrolle
                </label>

                <div
                  class="flex h-11 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 transition duration-200 focus-within:border-[var(--secondary-color)] focus-within:ring-2 focus-within:ring-[var(--secondary-color)]/20">
                  <Svg class="text-[var(--text-color-light)]">
                    <i class="fa-regular fa-id-badge"></i>
                  </Svg>

                  <input id="role" type="text" value="Lehrperson" disabled
                    class="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--text-color)] outline-none disabled:cursor-not-allowed disabled:text-[var(--text-color-light)]" />

                  <Svg class="text-[var(--text-color-light)]">
                    <i class="fa-solid fa-lock"></i>
                  </Svg>
                </div>

                <p class="text-xs text-[var(--text-color-light)]">
                  Die Rolle wird von der Administration deiner Schule verwaltet.
                </p>
              </div>

            </div>
          </div>

          <footer
            class="flex items-center justify-end gap-3 border-t border-[var(--border-color)] bg-[var(--background-color)]/50 px-5 py-4 sm:px-8">
            <button type="button" disabled
              class="cursor-not-allowed rounded-xl bg-[var(--primary-color)] px-5 py-2.5 text-sm font-semibold text-[var(--text-color-white)] opacity-40">
              Änderungen speichern
            </button>
          </footer>
        </section>

        <!-- Security -->
        <section id="security"
          class="scroll-mt-24 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] shadow-sm">
          <div class="p-5 sm:p-8">

            <header class="mb-6 flex items-start gap-4 sm:mb-8">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary-color-light)] text-[var(--secondary-color)]">
                <i class="fa-solid fa-shield-halved"></i>
              </div>

              <div class="flex flex-col gap-1">
                <h2 class="text-lg font-semibold text-[var(--text-color)]">
                  Sicherheit
                </h2>

                <p class="text-sm text-[var(--text-color-light)]">
                  Schütze dein Konto mit einem sicheren Passwort.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">

              <!-- Current password -->
              <div class="flex flex-col gap-2">
                <label for="current-password" class="text-xs font-semibold text-[var(--text-color)]">
                  Aktuelles Passwort
                </label>

                <div
                  class="flex h-11 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 transition duration-200 focus-within:border-[var(--secondary-color)] focus-within:ring-2 focus-within:ring-[var(--secondary-color)]/20">
                  <Svg class="text-[var(--text-color-light)]">
                    <i class="fa-solid fa-lock"></i>
                  </Svg>

                  <input id="current-password" :type="showCurrentPassword ? 'text' : 'password'"
                    v-model="currentPassword"
                    autocomplete="current-password"
                    class="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--text-color)] outline-none" />

                  <button type="button" :aria-label="showCurrentPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
                    :aria-pressed="showCurrentPassword"
                    class="cursor-pointer text-[var(--text-color-light)] transition duration-200 hover:text-[var(--secondary-color)]"
                    @click="showCurrentPassword = !showCurrentPassword">
                    <i :class="showCurrentPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </button>
                </div>
              </div>

             
              <div class="flex flex-col gap-2">
                <label for="new-password" class="text-xs font-semibold text-[var(--text-color)]">
                  Neues Passwort
                </label>

                <div
                  class="flex h-11 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 transition duration-200 focus-within:border-[var(--secondary-color)] focus-within:ring-2 focus-within:ring-[var(--secondary-color)]/20">
                  <Svg class="text-[var(--text-color-light)]">
                    <i class="fa-solid fa-key"></i>
                  </Svg>

                  <input id="new-password" :type="showNewPassword ? 'text' : 'password'"
                    v-model="newPassword"
                    autocomplete="new-password"
                    class="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--text-color)] outline-none" />

                  <button type="button" :aria-label="showNewPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
                    :aria-pressed="showNewPassword"
                    class="cursor-pointer text-[var(--text-color-light)] transition duration-200 hover:text-[var(--secondary-color)]"
                    @click="showNewPassword = !showNewPassword">
                    <i :class="showNewPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </button>
                </div>

                <p class="text-xs text-[var(--text-color-light)]">
                  Mindestens 8 Zeichen.
                </p>
              </div>

              <!-- Confirm password -->
              <div class="flex flex-col gap-2">
                <label for="confirm-password" class="text-xs font-semibold text-[var(--text-color)]">
                  Neues Passwort bestätigen
                </label>

                <div
                  class="flex h-11 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 transition duration-200 focus-within:border-[var(--secondary-color)] focus-within:ring-2 focus-within:ring-[var(--secondary-color)]/20">
                  <Svg class="text-[var(--text-color-light)]">
                    <i class="fa-solid fa-key"></i>
                  </Svg>

                  <input id="confirm-password" :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    autocomplete="new-password"
                    class="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--text-color)] outline-none" />

                  <button type="button" :aria-label="showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
                    :aria-pressed="showConfirmPassword"
                    class="cursor-pointer text-[var(--text-color-light)] transition duration-200 hover:text-[var(--secondary-color)]"
                    @click="showConfirmPassword = !showConfirmPassword">
                    <i :class="showConfirmPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <footer
            class="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-color)] bg-[var(--background-color)]/50 px-5 py-4 sm:px-8">
            <p v-if="passwordMessage"
              class="mr-auto text-sm"
              :class="passwordMessage.type === 'success' ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'"
              role="status">
              {{ passwordMessage.text }}
            </p>
            <button type="button"
              :disabled="authStore.loading"
              @click="changePassword"
              class="cursor-pointer rounded-xl bg-[var(--primary-color)] px-5 py-2.5 text-sm font-semibold text-[var(--text-color-white)] transition duration-200 hover:bg-[var(--primary-color-light)] disabled:cursor-not-allowed disabled:opacity-50">
              {{ authStore.loading ? 'Wird geändert...' : 'Passwort ändern' }}
            </button>
          </footer>
        </section>

        <section id="appearance"
          class="scroll-mt-24 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] shadow-sm">
          <div class="p-5 sm:p-8">

            <header class="mb-6 flex items-start gap-4 sm:mb-8">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary-color-light)] text-[var(--secondary-color)]">
                <i class="fa-solid fa-palette"></i>
              </div>

              <div class="flex flex-col gap-1">
                <h2 class="text-lg font-semibold text-[var(--text-color)]">
                  Darstellung
                </h2>

                <p class="text-sm text-[var(--text-color-light)]">
                  Passe das Erscheinungsbild von Cadence an deine Vorlieben an.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-3">

          
              <button v-for="t in themes" :key="t.label" type="button"
                @click="selectTheme(t.id)"
                class="group flex cursor-pointer flex-col gap-4 rounded-xl border-2 bg-[var(--surface-color)] p-3 text-left transition duration-200 hover:border-[var(--secondary-color)]/60"
                :class="selectedTheme === t.id
                  ? 'border-[var(--secondary-color)] shadow-sm'
                  : 'border-[var(--border-color)]'
                  ">
                <!-- Theme preview -->
                <div class="relative w-full">
                  <div
                    class="relative aspect-[8/5] w-full overflow-hidden rounded-lg border border-[var(--border-color)]"
                    aria-hidden="true">
                    <div v-for="(layer, i) in t.layers" :key="i" class="absolute inset-0 flex flex-col" :style="{
                      background: layer.p.page,
                      clipPath: layer.clip,
                    }">
                      <div class="flex h-[16%] items-center gap-2 px-3" :style="{ background: layer.p.bar }">
                        <span class="h-1.5 w-5 rounded-full" :style="{ background: layer.p.pill }"></span>
                        <span class="h-1 w-4 rounded-full" :style="{ background: layer.p.dash }"></span>
                        <span class="h-1 w-4 rounded-full" :style="{ background: layer.p.dash }"></span>
                      </div>

                      <div class="flex flex-1 gap-3 p-3">
                        <div class="flex w-[20%] flex-col gap-2">
                          <span class="h-2 rounded-sm" :style="{ background: GOLD }"></span>
                          <span class="h-2 rounded-sm" :style="{ background: layer.p.muted }"></span>
                          <span class="h-2 rounded-sm" :style="{ background: layer.p.muted }"></span>
                        </div>

                        <div class="flex flex-1 flex-col gap-2">
                          <div class="flex-[2] rounded-md border p-2" :style="{
                            background: layer.p.card,
                            borderColor: layer.p.border,
                          }">
                            <span class="block h-1.5 w-1/2 rounded-full" :style="{ background: layer.p.line }"></span>
                          </div>

                          <div class="flex-1 rounded-md border p-2" :style="{
                            background: layer.p.card,
                            borderColor: layer.p.border,
                          }">
                            <span class="block h-1 w-1/3 rounded-full" :style="{ background: layer.p.line }"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <svg v-if="t.system" class="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="62" y1="0" x2="38" y2="100" :stroke="GOLD" stroke-width="1.5"
                        vector-effect="non-scaling-stroke" />
                    </svg>
                  </div>

                  <span v-if="selectedTheme === t.id"
                    class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--secondary-color)] text-xs text-[var(--text-color-white)]">
                    <i class="fa-solid fa-check"></i>
                  </span>
                </div>

       
                <div class="flex items-start gap-3 px-1 pb-1">
                  <Svg class="mt-0.5" :class="selectedTheme === t.id
                    ? 'text-[var(--secondary-color)]'
                    : 'text-[var(--text-color-light)]'
                    ">
                    <i :class="t.icon"></i>
                  </Svg>

                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-semibold text-[var(--text-color)]">
                      {{ t.label }}
                    </span>
                    <span class="text-xs text-[var(--text-color-light)]">
                      {{ t.description }}
                    </span>
                  </div>
                </div>
              </button>

            </div>

            <p class="mt-6 flex items-center gap-2 text-xs text-[var(--text-color-light)]  ">
              <i class="fa-regular fa-circle-check text-[var(--secondary-color)] "></i>
              Deine Auswahl wird automatisch gespeichert und bleibt auch nach einer erneuten Anmeldung erhalten.
            </p>

          </div>
        </section>

      </div>
    </div>
  </SectionComp>
</template>
