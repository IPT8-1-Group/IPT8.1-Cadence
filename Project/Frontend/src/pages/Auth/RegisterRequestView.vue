<script lang="ts" setup>
import SectionComp from '@/components/ui/SectionComp.vue'
import Logo from '@/components/ui/Logo.vue'
import Svg from '@/components/ui/Svg.vue'
import InputComp from '@/components/ui/InputComp.vue'
import Divider from '@/components/ui/Divider.vue'
import DividerVertical from '@/components/ui/DividerVertical.vue'
</script>

<template>
  <header class="fixed top-0 left-0 px-6 py-8 sm:px-10">
    <RouterLink
      to="/dashboard"
      class="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)]"
    >
      <Logo class="w-[120px]"></Logo>
    </RouterLink>
  </header>

  <SectionComp class="h-screen flex items-center justify-center">
    <img
      src="../../assets/images/bg-auth.png"
      alt="background image register page"
      class="fixed inset-x-0 bottom-0 -z-1"
    />

    <div
      class="max-w-[800px] w-full bg-[var(--surface-color)] shadow-xl rounded-xl px-8 py-7 flex flex-row-reverse gap-4"
    >
      <div
        class="min-w-[320px] min-h-full border border-transparent border-l-[var(--border-color)] px-4 py-3 flex items-center justify-center gap-6"
      >
        <div class="flex flex-col gap-1 items-center justify-start h-fit w-fit -mt-23">
          <Svg
            class="text-sm w-fit min-w-[25px] min-h-[25px] bg-[var(--secondary-color)] text-[var(--text-color-white)] rounded-full"
          >
            <i class="fa-solid fa-1"></i>
          </Svg>

          <DividerVertical color="var(--border-color)" class="min-h-[125px]"></DividerVertical>

          <Svg
            class="text-sm w-fit min-w-[25px] min-h-[25px] bg-[var(--secondary-color)] text-[var(--text-color-white)] rounded-full"
          >
            <i class="fa-solid fa-2"></i>
          </Svg>

          <DividerVertical color="var(--border-color)" class="min-h-[125px]"></DividerVertical>

          <Svg
            class="text-sm w-fit min-w-[25px] min-h-[25px] bg-[var(--secondary-color)] text-[var(--text-color-white)] rounded-full"
          >
            <i class="fa-solid fa-3"></i>
          </Svg>
        </div>

        <div class="flex flex-col gap-6">
          <div>
            <Svg
              class="text-[var(--text-color)] w-[60px] h-[60px] text-3xl bg-[var(--background-color)] rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                height="36px"
                width="36px"
                fill="#4A5C82"
              >
                <path
                  d="M13.85,34.05H27.6v-3H13.85v3Zm0-8.55h20.3v-3H13.85v3Zm0-8.55h20.3v-3H13.85v3ZM9,42q-1.2,0-2.1-0.9T6,39V9Q6,7.8 6.9,6.9T9,6H39q1.2,0 2.1,0.9T42,9V39q0,1.2-0.9,2.1T39,42H9Zm0-3H39V9H9V39ZM9,9V39V9Z"
                />
              </svg>
            </Svg>

            <h2 class="font-bold text-lg text-[var(--text-color)] mt-2">Anfrage senden</h2>
            <p class="text-sm text-[var(--text-color-light)] leading-5">
              Fülle das Formular aus und sende deine Anfrage an den Administrator.
            </p>
          </div>

          <div>
            <Svg
              class="text-[var(--text-color)] w-[60px] h-[60px] text-3xl bg-[var(--background-color)] rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                height="36px"
                width="36px"
                fill="#4A5C82"
              >
                <path
                  d="M7,40q-1.2,0-2.1-0.9T4,37V11Q4,9.8 4.9,8.9T7,8H41q1.2,0 2.1,0.9T44,11V37q0,1.2-0.9,2.1T41,40H7ZM24,24.9L7,13.75V37H41V13.75L24,24.9Zm0-3L40.8,11H7.25L24,21.9ZM7,13.75V11v2.75V37V13.75Z"
                />
              </svg>
            </Svg>

            <h2 class="font-bold text-lg text-[var(--text-color)] mt-2">Prüfung durch Admin</h2>
            <p class="text-sm text-[var(--text-color-light)] leading-5">
              Der Administrator prüft deine Angaben und erstellt dein Konto.
            </p>
          </div>

          <div>
            <Svg
              class="text-[var(--text-color)] w-[60px] h-[60px] text-3xl bg-[var(--background-color)] rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 40 40"
                height="36px"
                width="36px"
                fill="#4A5C82"
              >
                <path
                  d="M15.43,18.15q-1.82-1.82-1.82-4.57t1.82-4.57T20,7.19t4.57,1.82t1.82,4.57t-1.82,4.57T20,19.97t-4.57-1.82ZM6.67,33.33V29.17q0-1.53 0.77-2.67t2.01-1.74q2.72-1.26 5.32-1.9T20,22.22t5.22,0.65t5.31,1.88q1.26,0.6 2.03,1.74t0.77,2.67v4.17H6.67Zm2.78-2.78H30.56V29.17q0-0.6-0.34-1.13t-0.85-0.79q-2.53-1.24-4.76-1.74T20,25t-4.63,0.51t-4.76,1.74q-0.51,0.26-0.84,0.79T9.44,29.17v1.39Zm13.13-14.4q1.03-1.03 1.03-2.58t-1.03-2.58T20,9.97t-2.58,1.03t-1.03,2.58t1.03,2.58T20,17.19t2.58-1.03ZM20,13.58Zm0,16.97Z"
                />
              </svg>
            </Svg>

            <h2 class="font-bold text-lg text-[var(--text-color)] mt-2">Zugang erhalten</h2>
            <p class="text-sm text-[var(--text-color-light)] leading-5">
              Du erhälst eine E-Mail mit deinen Zugangsdaten und kannst dich anschliessend bei
              Cadence anmelden.
            </p>
          </div>
        </div>
      </div>
      <div>
        <h1 class="mt-4 text-[var(--text-color)]">Zugang anfragen</h1>

        <p class="text-[var(--text-color-light)] text-sm my-4">
          Sende eine Anfrage an den Administrator. Nach der Prüfung wird dein Konto erstellt und du
          erhälst eine E-Mail mit deinen Zugangsdaten.
        </p>

        <div class="flex flex-col w-full gap-3">
          <div class="w-full flex items-center justify-between gap-2">
            <InputComp type="text" placeholder="Vorname" label="vorname" class="w-full">
              <i class="fa-regular fa-user"></i>
            </InputComp>

            <InputComp type="text" placeholder="Nachname" label="nachname" class="w-full">
              <i class="fa-regular fa-user"></i>
            </InputComp>
          </div>

          <InputComp type="email" placeholder="E-Mail-Adresse" label="email-adresse">
            <i class="fa-regular fa-envelope"></i>
          </InputComp>

          <InputComp type="text" placeholder="Schule / Institution" label="schule oder institution">
            <i class="fa-solid fa-school"></i>
          </InputComp>

          <div
            class="focus-within:border-[var(--secondary-color)] flex items-center justify-center gap-2 text-[var(--text-color-light)] bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg px-4 py-3"
          >
            <Svg>
              <i class="fa-solid fa-people-group"></i>
            </Svg>

            <select
              name="function"
              id="function"
              class="w-full outline-none text-sm cursor-pointer"
            >
              <option value="">Funktion</option>
              <option value="teacher">Lehrperson</option>
              <option value="admin">Schuladministration</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>

          <div
            class="focus-within:border-[var(--secondary-color)] flex items-start justify-center gap-2 text-[var(--text-color-light)] bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg px-4 py-3"
          >
            <Svg>
              <i class="fa-regular fa-file"></i>
            </Svg>

            <textarea
              placeholder="Zusätzliche Informationen
(optional)"
              class="w-full outline-none text-sm min-h-[110px]"
            ></textarea>
          </div>

          <button
            @click.prevent
            class="cursor-pointer lift-hover flex items-center justify-center gap-3 w-full bg-[var(--primary-color)] text-[var(--text-color-white)] px-4 py-3 rounded-lg shadow-xl"
          >
            Anfrage senden
            <Svg>
              <i class="fa-solid fa-angle-right"></i>
            </Svg>
          </button>
        </div>
      </div>
    </div>
  </SectionComp>
</template>
