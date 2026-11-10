<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
</script>

<template>
  <AppNavbar />

  <SectionComp>
    <div class="mx-4 sm:mx-6 lg:mx-8 my-6 sm:my-8 flex flex-col gap-5">
      <div
        class="rounded-t-xl border border-b-0 border-[var(--border-color)] bg-[var(--surface-color)] px-4 sm:px-6 pt-5"
      >
        <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div class="flex items-start gap-4 sm:gap-6 min-w-0">
            <Svg
              class="h-16 w-16 sm:h-20 sm:w-20 lg:h-[102px] lg:w-[108px] shrink-0 rounded-xl bg-[var(--secondary-color-light,#FFF2E0)] text-[var(--secondary-color,#F2A51D)]"
            >
              <i class="fa-solid fa-book-open text-3xl sm:text-[40px]"></i>
            </Svg>
            <div class="min-w-0">
              <span class="block text-sm sm:text-base text-[var(--text-color-light)]"> Modul </span>
              <h1 class="text-2xl sm:text-3xl font-bold text-[var(--text-color)]">M323 – Python</h1>
              <p class="mt-1 text-sm sm:text-base text-[var(--text-color-light)]">
                Programmierung in Python mit Fokus auf praktische Anwendungen.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)] shadow-sm"
            >
              <i class="fa-solid fa-pencil"></i>
              Bearbeiten
            </button>
            <button
              type="button"
              class="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)] shadow-sm"
            >
              <i class="fa-regular fa-copy"></i>
              Kopieren
            </button>
            <button
              type="button"
              class="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#F08A8A] bg-[var(--surface-color)] px-3 text-sm text-[#E5383B] shadow-sm"
            >
              <i class="fa-regular fa-trash-can"></i>
              Löschen
            </button>
          </div>
        </div>
        <div
          class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] py-3"
        >
          <div class="px-5 py-2">
            <span class="block text-[var(--text-color-light)]">Modulnummer</span>
            <span class="mt-1 block text-sm text-base text-[var(--text-color)]">M323</span>
          </div>
          <div class="border-l border-[var(--border-color)] px-5 py-2">
            <span class="block text-[var(--text-color-light)]">Titel</span>
            <span class="mt-1 block text-sm text-base text-[var(--text-color)]">Python</span>
          </div>
          <div class="border-l border-[var(--border-color)] px-5 py-2">
            <span class="block text-[var(--text-color-light)]">Beschreibung</span>
            <span class="mt-1 block text-sm text-base text-[var(--text-color)]">
              Programmierung in Python mit Fokus auf praktische Anwendungen.
            </span>
          </div>
          <div class="border-l border-[var(--border-color)] px-5 py-2">
            <span class="block text-[var(--text-color-light)]">Erstellt am</span>
            <span class="mt-1 block text-sm text-base text-[var(--text-color)]">12.09.2026</span>
          </div>
          <div class="border-l border-[var(--border-color)] px-5 py-2">
            <span class="block text-[var(--text-color-light)]">Zuletzt bearbeitet</span>
            <span class="mt-1 block text-sm text-base text-[var(--text-color)]">18.09.2026</span>
          </div>
        </div>
        <div class="mt-6 flex gap-5 sm:gap-8 overflow-x-auto border-b border-[var(--border-color)]">
          <button
            type="button"
            class="-mb-px shrink-0 cursor-pointer border-b-[3px] border-[var(--secondary-color,#F2A51D)] px-3 pb-3 text-base font-semibold text-[var(--text-color)]"
          >
            Übersicht
          </button>
          <button
            type="button"
            class="shrink-0 cursor-pointer px-3 pb-3 text-base text-[var(--text-color-light)]"
          >
            Grobplanung
          </button>
          <button
            type="button"
            class="shrink-0 cursor-pointer px-3 pb-3 text-base text-[var(--text-color-light)]"
          >
            Feinplanung
          </button>
          <button
            type="button"
            class="shrink-0 cursor-pointer px-3 pb-3 text-base text-[var(--text-color-light)]"
          >
            Materialien
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.48fr] gap-5">
        <section
          class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-5 pb-5"
        >
          <h2
            class="flex h-14 items-center border-b border-[var(--border-color)] text-lg font-bold text-[var(--text-color)]"
          >
            Statistik
          </h2>
          <div class="flex flex-col gap-3 pt-3">
            <div class="flex items-center gap-5">
              <Svg class="h-12 w-12 shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]">
                <i class="fa-solid fa-graduation-cap text-xl"></i>
              </Svg>
              <div>
                <span class="block text-lg font-bold text-[var(--text-color)]">3</span>
                <span class="block text-sm text-[var(--text-color-light)]">Kurse</span>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <Svg class="h-12 w-12 shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]">
                <i class="fa-regular fa-calendar text-xl"></i>
              </Svg>
              <div>
                <span class="block text-lg font-bold text-[var(--text-color)]">12</span>
                <span class="block text-sm text-[var(--text-color-light)]">
                  Planungstage (gesamt)
                </span>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <Svg class="h-12 w-12 shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]">
                <i class="fa-regular fa-file-lines text-xl"></i>
              </Svg>
              <div>
                <span class="block text-lg font-bold text-[var(--text-color)]">48</span>
                <span class="block text-sm text-[var(--text-color-light)]">
                  Unterrichtssequenzen (gesamt)
                </span>
              </div>
            </div>
          </div>
        </section>
        <section class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-5 pb-5" >
          <div
            class="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-bold text-[var(--text-color)]">Modulbeschreibung</h2>
            <button
              type="button"
              class="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)]"
            >
              <i class="fa-solid fa-pencil"></i>
              Bearbeiten
            </button>
          </div>
          <p class="pt-5 text-sm sm:text-base leading-6 text-[var(--text-color-light)]">
            In diesem Modul lernen die Teilnehmenden die Programmiersprache Python von Grund auf
            kennen. Der Fokus liegt auf praktischen Anwendungen, einer verständlichen Einführung in
            die Syntax sowie der Entwicklung eigener kleiner Projekte. Das Modul bildet die
            Grundlage für weiterführende Themen wie Datenanalyse, Automatisierung und
            Webentwicklung.
          </p>
        </section>
      </div>

      <section
        class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-5 pb-5"
      >
        <div
          class="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border-color)]"
        >
          <h2 class="text-lg font-bold text-[var(--text-color)]">Lernziele</h2>

          <button
            type="button"
            class="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 text-sm text-[var(--text-color)]"
          >
            <i class="fa-solid fa-pencil"></i>
            Bearbeiten
          </button>
        </div>
        <ul class="space-y-3 pt-4 text-sm sm:text-base leading-6 text-[var(--text-color-light)]">
          <li class="flex items-start gap-4">
            <span
              class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"></span> Die Teilnehmenden kennen die grundlegende Syntax von Python.
          </li>
          <li class="flex items-start gap-4">
            <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"></span>
            Die Teilnehmenden können einfache Programme selbstständig entwickeln.
          </li>
          <li class="flex items-start gap-4">
            <span
              class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"
            ></span>
            Die Teilnehmenden wenden Python in praktischen Beispielen an.
          </li>
          <li class="flex items-start gap-4">
            <span
              class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"
            ></span>
            Die Teilnehmenden verstehen die Grundkonzepte der objektorientierten Programmierung.
          </li>
        </ul>
      </section>
    </div>
  </SectionComp>
</template>