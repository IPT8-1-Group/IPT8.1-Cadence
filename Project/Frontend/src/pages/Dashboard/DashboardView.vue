<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <header class="flex flex-col items-start justify-center gap-3 mx-8 my-8">
      <span class="subtitle">Übersicht</span>
      <h1>Stundenplaner Dashboard</h1>
      <p class="text-[var(--text-color-light)]">
        Wähle ein Fach oder eine Klasse aus, um die Details zu öffnen.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-3 mx-8 my-8">
      <div
        v-for="i in 20"
        :key="i"
        class="hover:shadow-xl lift-hover cursor-pointer shadow-lg col-span-1 w-full flex items-center justify-between gap-3 px-6 py-4 border border-[var(--border-color)] bg-[var(--surface-color)] rounded-2xl"
      >
        <div class="flex items-center justify-center gap-3">
          <Svg
            class="w-[60px] h-[60px] rounded-lg bg-[var(--secondary-color-light)] text-[var(--secondary-color)]"
          >
            <i class="fa-brands fa-python text-[40px]"></i>
          </Svg>

          <h3 class="font-semibold text-[var(--text-color)]">M323 - Python</h3>
        </div>
        <Svg>
          <i class="fa-solid fa-angle-right"></i>
        </Svg>
      </div>
    </div>
  </SectionComp>
</template>
