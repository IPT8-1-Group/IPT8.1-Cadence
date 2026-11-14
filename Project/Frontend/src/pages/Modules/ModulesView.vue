<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
</script>
<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mx-8 my-8">
      <div class="flex flex-col items-start justify-center gap-3 min-w-0">
        <h1 class="text-center sm:text-left">Module verwalten</h1>
        <p class="text-[var(--text-color-light)] text-center sm:text-left ">
          Verwalte deine Module und behalte den Überblick über alle Inhalte,
          Kurse und zugehörigen Planungen.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
        <label class="flex h-10 w-full sm:w-[220px] md:w-[240px] lg:w-[260px] min-w-0 items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color-light)]">
          <i class="fa-solid fa-magnifying-glass text-sm shrink-0"></i>
          <input
            type="text"
            placeholder="Module suchen ..."
            class="w-full min-w-0 bg-transparent text-sm text-[var(--text-color)] placeholder:text-[var(--text-color-light)] outline-none" />
        </label>
        <button
          type="button"
          class="flex h-10 w-auto shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--primary-color,#0A2A66)] px-4 text-sm font-medium text-white shadow-lg">
          <i class="fa-solid fa-plus"></i>
          Neues Modul
        </button>
      </div>
    </header>
    <div class="grid grid-cols-1 gap-3 mx-8 my-8">
      <div
        class="hover:shadow-xl lift-hover cursor-pointer shadow-lg col-span-1 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-6 py-4 border border-[var(--border-color)] bg-[var(--surface-color)] rounded-2xl" >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <Svg class="w-[60px] h-[60px] shrink-0 rounded-lg bg-[var(--secondary-color-light)] text-[var(--secondary-color)]">
            <i class="fa-brands fa-python text-[40px]"></i>
          </Svg>
          <div class="min-w-0">
            <h3 class="font-semibold text-[var(--text-color)]">
              M323 - Python
            </h3>
            <p class="mt-1 text-sm text-[var(--text-color-light)] hidden sm:block">
              Programmierung in Python mit Fokus auf praktische Anwendungen.
            </p>
          </div>
        </div>
       
        <div class="flex flex-wrap lg:flex-nowrap items-center gap-x-4 gap-y-3 lg:gap-6 xl:gap-8 shrink-0">
          <div class="border-l border-[var(--border-color)] pl-5">
            <span class="text-sm text-[var(--text-color-light)]">Kurse</span>
            <p class="mt-1  text-sm text-[var(--text-color)]">2</p>
          </div>
          <div class="border-l border-[var(--border-color)] pl-5">
            <span class="text-sm text-[var(--text-color-light)]">Erstellt am</span>
            <p class="mt-1 text-sm text-[var(--text-color)]">12.09.2026</p>
          </div>
          <div class="border-l border-[var(--border-color)] pl-5">
            <span class="text-sm text-[var(--text-color-light)]">Zuletzt bearbeitet</span>
            <p class="mt-1 text-sm  text-[var(--text-color)]">18.09.2026</p>
          </div>
        </div>
        <!-- Aktionen: auf kleinen Bildschirmen ausgeblendet -->
        <div class="hidden sm:flex items-center justify-end gap-3 shrink-0">
          <button
            type="button" aria-label="Python bearbeiten"
            class="flex h-11 w-11 cursor-pointer items-center justify-center
            rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]"
            @click.stop>
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button
            type="button" aria-label="Weitere Aktionen"
            class="flex h-11 w-11 cursor-pointer items-center justify-center
            rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]"
            @click.stop>
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    </div>
  </SectionComp>
</template>
