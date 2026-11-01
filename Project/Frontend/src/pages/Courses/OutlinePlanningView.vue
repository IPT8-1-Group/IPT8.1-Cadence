<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import Svg from '@/components/ui/Svg.vue'
import Divider from '@/components/ui/Divider.vue'
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <header class="mx-8 my-8 flex items-center justify-between gap-5">
      <div class="flex flex-col gap-3">
        <h1 class="text-[var(--text-color)]">Grobplanung</h1>
        <p class="text-[var(--text-color-light)] font-medium">
          Codierung, Kompression und Verschlüssung (muss ausgetauscht werden!)
        </p>
      </div>

      <div class="flex gap-2">
        <button
          class="lift-hover transition duration-200 select-none border border-transparent cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-[var(--surface-color)] text-[var(--text-color)] w-fit text-nowrap rounded-lg shadow-lg"
        >
          <Svg>
            <i class="fa-regular fa-eye"></i>
          </Svg>
          <span>Speichern</span>
        </button>
        <button
          class="lift-hover transition duration-200 select-none border border-transparent cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-[var(--secondary-color)] text-[var(--text-color)] w-fit text-nowrap rounded-lg shadow-lg"
        >
          <Svg>
            <i class="fa-regular fa-floppy-disk"></i>
          </Svg>
          <span>Speichern</span>
        </button>
      </div>
    </header>

    <div class="mx-8 my-8">
      <div
        class="grid grid-cols-4 w-full h-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-5"
      >
        <div class="col-span-2 px-3 pr-6 border border-transparent border-r-[var(--border-color)]">
          <h2>Organisatorisch</h2>

          <Divider color="var(--border-color)" class="my-3"></Divider>
          <div class="grid grid-cols-3 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]"
              >Kurstage</span
            >
            <div class="col-span-2 flex gap-2 items-center">
              <div
                class="px-2 py-1 w-fit flex gap-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg"
              >
                <Svg
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-sm"
                >
                  <i class="fa-solid fa-minus"></i>
                </Svg>
                <span class="text-[var(--text-color)] font-bold">3</span>
                <Svg
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-sm"
                >
                  <i class="fa-solid fa-plus"></i>
                </Svg>
              </div>

              <span class="text-sm text-[var(--text-color-light)] font-semibold">pro Woche</span>
            </div>
          </div>

          <Divider color="var(--border-color)" class="my-3"></Divider>
          <div class="grid grid-cols-3 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]">Daten</span>
            <div class="flex flex-wrap col-span-2 gap-2 items-center">
              <div
                class="px-3 py-1 w-fit flex gap-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg"
              >
                <span class="select-none text-[var(--text-color)] font-semibold">Montag</span>
                <Svg
                  class="hover:text-[var(--text-color)] transition duration-75 cursor-pointer text-[var(--text-color-light)] text-xs"
                >
                  <i class="fa-solid fa-xmark"></i>
                </Svg>
              </div>

              <div
                class="hover:text-[var(--text-color)] transition duration-75 col-span-1 cursor-pointer px-2 py-1 w-fit flex gap-1 bg-transparent border border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-color-light)]"
              >
                <Svg class="cursor-pointer text-sm">
                  <i class="fa-solid fa-plus"></i>
                </Svg>
                <span class="select-none font-medium">Tag</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-2 px-3 pl-6">
          <h2>Inhalt</h2>

          <Divider color="var(--border-color)" class="my-3"></Divider>

          <div class="grid grid-cols-3 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]">Modul</span>
            <div
              class="hover:text-[var(--text-color)] transition duration-75 text-[var(--text-color-light)] cursor-pointer col-span-2 flex gap-2 items-center"
            >
              <div class="px-2 py-1 w-fit flex gap-2">
                <p class="font-semibold">
                  <span
                    class="select-none h-fit w-fit text-xs font-bold bg-gray-100 rounded-sm px-2 py-1 mr-1 mb-1"
                  >
                    M114
                  </span>
                  Codierungs-, Kompressions- und Verschlüsselungsverfahren einsetzen.
                </p>
              </div>
              <Svg class="text-sm">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </Svg>
            </div>
          </div>

          <Divider color="var(--border-color)" class="my-3"></Divider>

          <div class="grid grid-cols-3 w-full">
            <span class="col-span-1 w-fit font-semibold text-[var(--text-color-light)]"
              >Kurskontrolle</span
            >
            <div
              class="hover:text-[var(--text-color)] transition duration-75 text-[var(--text-color-light)] col-span-2 flex flex-wrap gap-2 items-center"
            >
              <div
                class="cursor-pointer border border-[var(--border-color)] rounded-lg text-sm font-semibold px-2 py-1 w-fit flex items-center gap-1"
              >
                <Svg>
                  <i class="fa-regular fa-file"></i>
                </Svg>
                <span class="text-[var(--text-color)] text-nowrap">Theoretische Prüfung</span>
              </div>
            </div>
          </div>
        </div>

        <Divider color="var(--border-color)" class="col-span-full my-3"></Divider>

        <div class="col-span-full">
          <div class="flex items-center justify-between">
            <h2>Planung</h2>

            <div class="flex gap-3 items-center">
              <div class="flex gap-1 items-center">
                <div class="w-[7px] h-[7px] rounded-full bg-[var(--secondary-color)]"></div>
                <span class="text-sm font-medium text-[var(--text-color-light)]"
                  >Termine der gewählten Woche</span
                >
              </div>

              <div
                class="px-2 py-2 border border-[var(--border-color)] rounded-lg flex text-[var(--text-color-light)]"
              >
                <Svg class="text-sm cursor-pointer">
                  <i class="fa-solid fa-angle-left"></i>
                </Svg>

                <div
                  class="flex items-center gap-1 mx-2 px-2 border border-transparent border-x-[var(--border-color)]"
                >
                  <Svg>
                    <i class="fa-regular fa-calendar"></i>
                  </Svg>
                  <span class="font-semibold text-[var(--text-color)]">7.-11. September 2026</span>
                </div>

                <Svg class="text-sm cursor-pointer">
                  <i class="fa-solid fa-angle-right"></i>
                </Svg>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 text-xs text-[var(--text-color-light)]">
            <Svg>
              <i class="fa-solid fa-circle-info"></i>
            </Svg>
            <span>Unterrichtssequenzen ziehen, um zu verschieben.</span>
          </div>

          <table class="w-full mt-4 border border-[var(--border-color)] border-collapse">
            <tr
              class="text-[var(--text-color-light)] bg-[var(--background-color)] border border-[var(--border-color)]"
            >
              <th>Lektion</th>
              <th>Inhalt</th>
              <th>
                <Svg
                  class="lift-hover cursor-pointer text-sm text-[var(--text-color-light)] w-[35px] h-[35px] rounded-lg bg-[var(--surface-color)] border border-dashed border-[var(--border-color)]"
                >
                  <i class="fa-solid fa-plus"></i>
                </Svg>
              </th>
            </tr>
            <tr v-for="i in 5" :key="i">
              <td class="font-bold text-[var(--text-color)] text-base">{{ i }}</td>
              <td>
                <div
                  class="cursor-grab select-none flex items-center justify-between gap-2 border border-dashed border-[var(--border-color)] px-3 py-2 rounded-lg"
                >
                  <div class="flex items-center gap-2">
                    <Svg class="h-full text-xs text-[var(--text-color-light)]">
                      <i class="fa-solid fa-grip-vertical"></i>
                    </Svg>
                    <div class="flex flex-col items-start justify-center">
                      <span class="text-[var(--text-color)] font-medium">Logische Gatter</span>
                      <span class="text-[var(--text-color-light)] text-sm"
                        >AND, OR, NOT, XOR, und Wahrheitstabellen</span
                      >
                    </div>
                  </div>
                  <Svg
                    class="hover:text-[var(--text-color)] hover:border-[var(--text-color)] transition duration-200 cursor-pointer text-[var(--text-color-light)] w-[35px] h-[35px] rounded-lg border border-[var(--border-color)] text-sm"
                  >
                    <i class="fa-solid fa-pen"></i>
                  </Svg>
                </div>
              </td>
              <td></td>
            </tr>
          </table>
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
  border: 1px solid var(--border-color);
}
</style>
