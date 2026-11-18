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
    <header
      class="mx-4 my-6 flex flex-col items-stretch gap-5 sm:mx-8 sm:my-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-col gap-3">
        <h1 class="text-[var(--text-color)]">Feinplanung</h1>
        <p class="text-[var(--text-color-light)] font-medium">
          M295 - Webentwicklung mit HTML, CSS und JS
        </p>
      </div>

      <button
        class="lift-hover transition duration-200 select-none border border-transparent cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-[var(--secondary-color)] text-[var(--text-color)] w-full sm:w-fit text-nowrap rounded-lg shadow-lg"
      >
        <Svg>
          <i class="fa-solid fa-plus"></i>
        </Svg>
        <span>Zeile hinzufügen</span>
      </button>
    </header>

    <div class="mx-4 my-6 grid grid-cols-1 gap-4 sm:mx-8 sm:my-8 sm:gap-6 lg:grid-cols-5">
      <div
        class="flex flex-col gap-5 lg:col-span-3 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-5"
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

        <div class="flex flex-wrap items-center justify-start gap-4 sm:gap-6">
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

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        class="flex flex-col gap-5 lg:col-span-2 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-5"
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
        class="flex flex-col gap-5 lg:col-span-5 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg"
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

        <table class="plan-table">
          <tr
            class="plan-head text-[var(--text-color-light)] bg-[var(--background-color)] border border-transparent border-bottom-[var(--border-color)] border-top-[var(--border-color)]"
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
          <tr v-for="i in 20" class="plan-row">
            <td class="text-start p-0! cursor-grab min-w-[50px]">
              <Svg class="text-sm text-[var(--text-color-light)]">
                <i class="fa-solid fa-grip-vertical"></i>
              </Svg>
            </td>
            <td class="font-bold" data-label="Zeit total">0-10'</td>
            <td data-label="Zeit Lektion">
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
            <td data-label="Dauer">
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
            <td class="font-bold" data-label="Inhalt">Begrüssung und Überblick</td>
            <td data-label="Methode">
              <select
                name="method"
                id="method"
                class="outline-none border border-[var(--border-color)] px-3 py-2 rounded-lg"
              >
                <option>-</option>
                <option>Plenum</option>
              </select>
            </td>
            <td data-label="Mittel">
              <select
                name="medium"
                id="medium"
                class="outline-none border border-[var(--border-color)] px-3 py-2 rounded-lg"
              >
                <option>-</option>
                <option>Beamer</option>
              </select>
            </td>
            <td data-label="Kommentar">
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
      <div class="mx-auto w-full max-w-[1400px] border border-transparent border-t-[var(--border-color)]">
        <div class="mx-4 -space-x-px flex items-center justify-start overflow-x-auto sm:mx-8">
          <div
            v-for="i in 5"
            :key="i"
            class="select-none cursor-pointer shrink-0 px-4 py-2 sm:px-6 text-[var(--text-color-light)] font-semibold w-fit border border-b-3 border-x-[var(--border-color)] border-transparent"
          >
            <span>{{ i }}. Tag</span>
          </div>

          <div
            class="flex shrink-0 gap-2 select-none cursor-pointer px-4 py-2 sm:px-6 text-nowrap text-[var(--text-color-light)] font-semibold w-fit border border-x-[var(--border-color)] border-transparent"
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


@media (max-width: 1023px) {
  .plan-table,
  .plan-table tbody {
    display: block;
    width: 100%;
  }

  .plan-head {
    display: none;
  }

  .plan-row {
    position: relative;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
    margin: 0 16px 16px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--background-color);
  }

  .plan-row > td {
    display: block;
    min-width: 0;
    padding: 0;
    border: 0;
    grid-column: span 6;
  }

  .plan-row > td[data-label]::before {
    content: attr(data-label);
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-color-light);
  }

 
  .plan-row > td:first-child {
    position: absolute;
    top: 8px;
    right: 8px;
    min-width: 0;
    grid-column: auto;
  }

 
  .plan-row > td:nth-child(2),
  .plan-row > td:nth-child(3),
 
  .plan-row > td:nth-child(6),
  .plan-row > td:nth-child(7) {
    grid-column: span 3;
  }

  .plan-row select,
  .plan-row input[type='text'] {
    width: 100%;
    box-sizing: border-box;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
 
  .plan-row > td:nth-child(2),
  .plan-row > td:nth-child(3),
  .plan-row > td:nth-child(4) {
    grid-column: span 2;
  }
}
</style>
