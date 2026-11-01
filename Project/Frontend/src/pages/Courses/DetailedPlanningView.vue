<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import Svg from '@/components/ui/Svg.vue'
import Divider from '@/components/ui/Divider.vue'
import LessonBlock from '@/components/planning/LessonBlock.vue'
import LearningObjectives from '@/components/planning/LearningObjectives.vue'
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <header class="mx-8 my-8 flex items-center justify-between gap-5">
      <div class="flex flex-col gap-3">
        <h1 class="text-[var(--text-color)]">Feinplanung</h1>
        <p class="text-[var(--text-color-light)] font-medium">
          M295 - Webentwicklung mit HTML, CSS und JS
        </p>
      </div>

      <button
        class="lift-hover transition duration-200 select-none border border-transparent cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-[var(--secondary-color)] text-[var(--text-color)] w-fit text-nowrap rounded-lg shadow-lg"
      >
        <Svg>
          <i class="fa-solid fa-plus"></i>
        </Svg>
        <span>Zeile hinzufügen</span>
      </button>
    </header>

    <div class="mx-8 my-8 grid grid-cols-5 gap-6">
      <div
        class="flex flex-col gap-5 col-span-3 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-5"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold text-base">Tagesübersicht</h2>

          <div
            class="flex gap-2 items-center justify-center rounded-full bg-[var(--secondary-color-light)] font-semibold text-[var(--text-color)] text-sm px-2 py-1"
          >
            <div
              class="animate-pulse w-[7px] h-[7px] rounded-full bg-[var(--secondary-color)]"
            ></div>
            <div>Tag 1 von 3</div>
          </div>
        </div>

        <div class="flex items-center justify-start gap-6">
          <div class="flex items-center justify-start gap-2">
            <Svg
              class="rounded-xl bg-[var(--background-color)] text-[var(--text-color-light)] w-[40px] h-[40px] text-sm"
            >
              <i class="fa-solid fa-person-chalkboard"></i>
            </Svg>
            <div class="flex flex-col items-start justify-center text-sm">
              <span class="font-bold">4</span>
              <span class="text-[var(--text-color-light)] font-medium">Lektionen</span>
            </div>
          </div>

          <div class="flex items-center justify-start gap-2">
            <Svg
              class="rounded-xl bg-[var(--background-color)] text-[var(--text-color-light)] w-[40px] h-[40px] text-sm"
            >
              <i class="fa-regular fa-clock"></i>
            </Svg>
            <div class="flex flex-col items-start justify-center text-sm">
              <span class="font-bold">180 Min</span>
              <span class="text-[var(--text-color-light)] font-medium">Verfügbare Zeit</span>
            </div>
          </div>
        </div>

        <Divider color="var(--border-color)"></Divider>

        <div class="grid grid-cols-2 gap-3">
          <LessonBlock
            v-for="i in 4"
            :key="i"
            title="Lektion 1"
            subtitle="Logische Gatter"
            begin-time="8:15"
            end-time="9:00"
          ></LessonBlock>
        </div>
      </div>

      <div
        class="flex flex-col gap-5 col-span-2 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-5"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold text-base">Lernziele</h2>

          <span class="text-[var(--text-color-light)] text-sm">3 Ziele</span>
        </div>

        <div v-for="i in 3" :key="i" class="flex flex-col items-start justify-center gap-3">
          <LearningObjectives
            :count="i"
            text="AND-, OR-, XOR-, und NOT-Gatter beschreiben"
          ></LearningObjectives>

          <Divider v-if="i < 3" color="var(--border-color)"></Divider>
        </div>
      </div>

      <div
        class="flex flex-col gap-5 col-span-5 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg"
      >
        <div class="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 class="font-semibold text-base">Unterrichtsablauf</h2>

          <div
            class="text-[var(--text-color-light)] text-xs flex items-center justify-center gap-1"
          >
            <Svg class="">
              <i class="fa-solid fa-circle-info"></i>
            </Svg>

            <p>Ziehen um anzupassen.</p>
          </div>
        </div>

        <table>
          <tr
            class="text-[var(--text-color-light)] bg-[var(--background-color)] border border-transparent border-bottom-[var(--border-color)] border-top-[var(--border-color)]"
          >
            <th></th>
            <th>Zeit total</th>
            <th>Zeit Lektion</th>
            <th>Dauer</th>
            <th>Inhalt</th>
            <th>Methode</th>
            <th>Mittel</th>
            <th>Kommentar</th>
          </tr>
          <tr v-for="i in 20">
            <td class="text-start p-0! cursor-grab min-w-[50px]">
              <Svg class="text-sm text-[var(--text-color-light)]">
                <i class="fa-solid fa-grip-vertical"></i>
              </Svg>
            </td>
            <td class="font-bold">0-10'</td>
            <td>
              <div class="flex items-center justify-start gap-2">
                <div
                  class="flex items-center justify-center gap-1 text-[var(--text-color-light)] font-semibold"
                >
                  <div class="w-[7px] h-[7px] rounded-full bg-[var(--secondary-color)]"></div>
                  <span class="uppercase text-xs">L1</span>
                </div>
                <span>0-10'</span>
              </div>
            </td>
            <td>
              <div
                class="flex items-center justify-center px-3 py-2 border border-[var(--border-color)] rounded-lg w-fit"
              >
                <input
                  type="number"
                  placeholder="0"
                  name="min"
                  id="min"
                  class="no-spinner outline-0 w-[35px] text-right"
                />
                <label for="min" class="text-[var(--text-color-light)] text-sm ml-2">Min</label>
              </div>
            </td>
            <td class="font-bold">Begrüssung und Überblick</td>
            <td>
              <select
                name="method"
                id="method"
                class="outline-none border border-[var(--border-color)] px-3 py-2 rounded-lg"
              >
                <option>-</option>
                <option>Plenum</option>
              </select>
            </td>
            <td>
              <select
                name="medium"
                id="medium"
                class="outline-none border border-[var(--border-color)] px-3 py-2 rounded-lg"
              >
                <option>-</option>
                <option>Beamer</option>
              </select>
            </td>
            <td>
              <input
                type="text"
                placeholder="Kommentar"
                class="outline-none border border-[var(--border-color)] px-3 py-2 rounded-lg text-sm"
              />
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div class="fixed bottom-0 inset-x-0 w-full bg-[var(--background-color)]">
      <div class="mx-auto w-[1400px] border border-transparent border-t-[var(--border-color)]">
        <div class="mx-8 -space-x-px flex items-center justify-start">
          <div
            v-for="i in 5"
            :key="i"
            class="select-none cursor-pointer px-6 py-2 text-[var(--text-color-light)] font-semibold w-fit border border-b-3 border-x-[var(--border-color)] border-transparent"
          >
            <span>{{ i }}. Tag</span>
          </div>

          <div
            class="flex gap-2 select-none cursor-pointer px-6 py-2 text-[var(--text-color-light)] font-semibold w-fit border border-x-[var(--border-color)] border-transparent"
          >
            <Svg>
              <i class="fa-solid fa-plus"></i>
            </Svg>
            <span>Tag hinzufügen</span>
          </div>
        </div>
      </div>
    </div>
  </SectionComp>
</template>

<style scoped>
td,
th {
  padding: 10px;
  text-align: left;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

/* Firefox */
.no-spinner {
  appearance: textfield;
}

/* Chrome, Edge und Safari */
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.day-active {
  background-color: var(--surface-color);
  border-bottom-color: var(--secondary-color);
  color: var(--text-color);
}
</style>
