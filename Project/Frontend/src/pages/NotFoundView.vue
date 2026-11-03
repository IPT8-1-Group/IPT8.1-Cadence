<script lang="ts" setup>
import { useRouter } from 'vue-router'
import Svg from '@/components/ui/Svg.vue'

const router = useRouter()
const year = new Date().getFullYear()

const goBack = () => {
  // Fall back to the dashboard when there's no history entry (direct links / new tab)
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[var(--background-color)]">
    <header class="px-6 py-8 sm:px-10">
      <RouterLink to="/dashboard"
        class="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)]">
        <img src="../assets/images/cadence-logo.svg" alt="Cadence" class="w-[120px]" />
      </RouterLink>
    </header>

    <main class="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div class="flex w-full max-w-lg flex-col items-center gap-8">

        <!-- Animated 404 illustration -->
        <div class="relative">
          <div aria-hidden="true"
            class="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--secondary-color-light)] opacity-70 blur-2xl">
          </div>

          <div class="relative flex items-center justify-center gap-3 text-[var(--text-color)]" role="img"
            aria-label="404">
            <span class="text-[clamp(70px,15vw,160px)] font-extrabold leading-none tracking-tighter"
              aria-hidden="true">4</span>

            <svg viewBox="-12 -16 144 168"
              class="h-[clamp(80px,12vw,140px)] w-[clamp(80px,12vw,140px)] overflow-visible" aria-hidden="true">
              <g class="calendar-float">
                <!-- Calendar rings -->
                <rect x="26" y="0" width="12" height="28" rx="6" fill="var(--secondary-color)" />
                <rect x="82" y="0" width="12" height="28" rx="6" fill="var(--secondary-color)" />

                <!-- Calendar frame -->
                <rect x="0" y="12" width="120" height="120" rx="22" fill="currentColor" />

                <!-- Calendar page -->
                <rect x="12" y="44" width="96" height="76" rx="10" fill="var(--surface-color)" />

                <!-- Calendar days -->
                <g fill="var(--hover-light-color)">
                  <rect class="calendar-day day-1" x="24" y="58" width="20" height="20" rx="5" />
                  <rect class="calendar-day day-2" x="50" y="58" width="20" height="20" rx="5" />
                  <rect class="calendar-day day-3" x="76" y="58" width="20" height="20" rx="5" />
                  <rect class="calendar-day day-4" x="24" y="86" width="20" height="20" rx="5" />
                  <rect class="calendar-day day-5" x="76" y="86" width="20" height="20" rx="5" />
                </g>

                <!-- Missing calendar day -->
                <rect class="calendar-missing" x="51" y="87" width="18" height="18" rx="5" fill="none"
                  stroke="var(--text-color-light)" stroke-width="1.5" stroke-dasharray="3 3" />

                <!-- Folded corner -->
                <rect class="calendar-corner" x="88" y="104" width="26" height="26" rx="5" fill="var(--secondary-color)"
                  stroke="var(--surface-color)" stroke-width="3" />
              </g>
            </svg>

            <span class="text-[clamp(70px,15vw,160px)] font-extrabold leading-none tracking-tighter"
              aria-hidden="true">4</span>
          </div>
        </div>

        <!-- Error message -->
        <div class="flex flex-col items-center gap-3">
          <h1 class="text-balance text-3xl sm:text-4xl">Diese Seite wurde nicht gefunden.</h1>
          <p class="max-w-md text-pretty text-sm leading-relaxed text-[var(--text-color-light)]">
            Die gesuchte Seite existiert nicht oder wurde verschoben. Überprüfe die URL oder kehre
            zum Dashboard zurück.
          </p>
        </div>

        <!-- Navigation actions -->
        <div class="flex flex-wrap items-center justify-center gap-3">
          <RouterLink to="/dashboard"
            class="flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-5 py-3 text-sm font-semibold text-[var(--text-color-white)] transition duration-200 hover:bg-[var(--primary-color-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)] active:scale-[0.98]">
            <Svg><i class="fa-regular fa-house"></i></Svg>
            <span>Zum Dashboard</span>
          </RouterLink>

          <button type="button"
            class="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-5 py-3 text-sm font-semibold text-[var(--text-color)] transition duration-200 hover:border-[var(--secondary-color)] hover:text-[var(--secondary-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)] active:scale-[0.98]"
            @click="goBack">
            <Svg><i class="fa-solid fa-arrow-left"></i></Svg>
            <span>Zurück</span>
          </button>
        </div>
      </div>
    </main>

    <footer class="py-8 text-center text-xs text-[var(--text-color-light)]">
      © {{ year }} Cadence
    </footer>
  </div>
</template>

<style scoped>
/* ---------- Base ---------- */
.calendar-float,
.calendar-day,
.calendar-missing,
.calendar-corner {
  transform-box: fill-box;
  transform-origin: center;
}

/* Calendar gently floats (whole group) */
.calendar-float {
  animation: calendarFloat 4s ease-in-out infinite;
}

/* Days reveal one by one, hold, then fade out as a wave */
.calendar-day {
  opacity: 0.25;
  animation: dayReveal 4s ease-in-out infinite;
}

.day-1 {
  animation-delay: 0s;
}

.day-2 {
  animation-delay: 0.12s;
}

.day-3 {
  animation-delay: 0.24s;
}

.day-4 {
  animation-delay: 0.36s;
}

.day-5 {
  animation-delay: 0.48s;
}

/* Missing slot pulses right after the last day appears */
.calendar-missing {
  animation: missingPulse 4s ease-in-out infinite;
}

/* Folded corner sways gently — base 12° from the SVG stays on the rect */
.calendar-corner {
  animation: cornerSway 4s ease-in-out infinite;
}

/* ---------- Keyframes ---------- */

@keyframes calendarFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@keyframes dayReveal {

  0%,
  10% {
    opacity: 0.25;
    transform: scale(0.8);
  }

  25%,
  85% {
    opacity: 1;
    transform: scale(1);
  }

  95%,
  100% {
    opacity: 0.25;
    transform: scale(0.8);
  }
}

@keyframes missingPulse {

  0%,
  25%,
  75%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  45%,
  55% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes cornerSway {

  0%,
  100% {
    transform: rotate(-4deg);
  }

  50% {
    transform: rotate(4deg);
  }
}

/* ---------- Accessibility ---------- */
@media (prefers-reduced-motion: reduce) {

  .calendar-float,
  .calendar-day,
  .calendar-missing,
  .calendar-corner {
    animation: none;
  }

  .calendar-day {
    opacity: 1;
  }

  .calendar-missing {
    opacity: 0.6;
  }
}
</style>
