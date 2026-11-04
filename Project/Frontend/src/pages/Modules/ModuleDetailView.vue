<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <div class="mx-8 my-8 flex flex-col gap-6">
     
      <div
        class="rounded-t-xl border border-b-0 border-[var(--border-color)] bg-[var(--surface-color)] px-6 pt-6"
      >
       
        <div class="flex items-start justify-between gap-6">
          <div class="flex items-start gap-[33px]">
            <Svg
              class="h-[102px] w-[108px] shrink-0 rounded-xl bg-[var(--secondary-color-light,#FFF2E0)] text-[var(--secondary-color,#F2A51D)]"
            >
              <i class="fa-solid fa-book-open text-[44px]"></i>
            </Svg>

            <div>
              <span class="block text-[17px] leading-6 text-[var(--text-color-light)]">Modul</span>
              <h1 class="text-[38px] font-bold leading-[46px] text-[var(--text-color)]">
                M323 – Python
              </h1>
              <p class="mt-0.5 text-[18px] leading-7 text-[var(--text-color-light)]">
                Programmierung in Python mit Fokus auf praktische Anwendungen.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-[15px]">
            <button
              type="button"
              class="flex h-[54px] cursor-pointer items-center gap-3 rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] px-5 text-[18px] text-[var(--text-color)] shadow-sm"
            >
              <i class="fa-solid fa-pencil"></i>
              Bearbeiten
            </button>
            <button
              type="button"
              class="flex h-[54px] cursor-pointer items-center gap-3 rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] px-5 text-[18px] text-[var(--text-color)] shadow-sm"
            >
              <i class="fa-regular fa-copy"></i>
              Kopieren
            </button>
            <button
              type="button"
              class="flex h-[54px] cursor-pointer items-center gap-3 rounded-[10px] border border-[#F08A8A] bg-[var(--surface-color)] px-5 text-[18px] text-[#E5383B] shadow-sm"
            >
              <i class="fa-regular fa-trash-can"></i>
              Löschen
            </button>
          </div>
        </div>

     
        <div
          class="mt-[19px] flex rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] py-4"
        >
          <div class="w-[231px] pl-7">
            <span class="block text-[16px] leading-6 text-[var(--text-color-light)]">Modulnummer</span>
            <span class="mt-1 block text-[18px] leading-[23px] text-[var(--text-color)]">M323</span>
          </div>
          <div class="w-[240px] border-l border-[var(--border-color)] pl-7">
            <span class="block text-[16px] leading-6 text-[var(--text-color-light)]">Titel</span>
            <span class="mt-1 block text-[18px] leading-[23px] text-[var(--text-color)]">Python</span>
          </div>
          <div class="w-[500px] border-l border-[var(--border-color)] pl-6 pr-6">
            <span class="block text-[16px] leading-6 text-[var(--text-color-light)]">Beschreibung</span>
            <span class="mt-1 block text-[18px] leading-[23px] text-[var(--text-color)]">
              Programmierung in Python mit Fokus auf<br />
              praktische Anwendungen.
            </span>
          </div>
          <div class="w-[198px] border-l border-[var(--border-color)] pl-6">
            <span class="block text-[16px] leading-6 text-[var(--text-color-light)]">Erstellt am</span>
            <span class="mt-1 block text-[18px] leading-[23px] text-[var(--text-color)]">12.09.2026</span>
          </div>
          <div class="flex-1 border-l border-[var(--border-color)] pl-6">
            <span class="block text-[16px] leading-6 text-[var(--text-color-light)]">Zuletzt bearbeitet</span>
            <span class="mt-1 block text-[18px] leading-[23px] text-[var(--text-color)]">18.09.2026</span>
          </div>
        </div>

     
        <div class="mt-9 flex gap-10 border-b border-[var(--border-color)]">
          <button
            type="button"
            class="-mb-px cursor-pointer border-b-[3px] border-[var(--secondary-color,#F2A51D)] px-4 pb-[13px] text-[19px] font-semibold text-[var(--text-color)]"
          >
            Übersicht
          </button>
          <button
            type="button"
            class="cursor-pointer px-4 pb-[13px] text-[19px] text-[var(--text-color-light)]"
          >
            Grobplanung
          </button>
          <button
            type="button"
            class="cursor-pointer px-4 pb-[13px] text-[19px] text-[var(--text-color-light)]"
          >
            Feinplanung
          </button>
          <button
            type="button"
            class="cursor-pointer px-4 pb-[13px] text-[19px] text-[var(--text-color-light)]"
          >
            Materialien
          </button>
        </div>
      </div>

    
      <div class="grid grid-cols-1 gap-[23px] lg:grid-cols-[1fr_1.48fr]">
       
        <section
          class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] pb-5 pl-[29px] pr-6"
        >
          <h2
            class="flex h-[56px] items-center border-b border-[var(--border-color)] text-[22px] font-bold text-[var(--text-color)]"
          >
            Statistik
          </h2>

          <div class="flex flex-col gap-[11px] pt-2.5">
            <div class="flex items-center gap-[31px]">
              <Svg
                class="h-[60px] w-[60px] shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]"
              >
                <i class="fa-solid fa-graduation-cap text-[22px]"></i>
              </Svg>
              <div>
                <span class="block text-[20px] font-bold leading-6 text-[var(--text-color)]">3</span>
                <span class="block text-[17px] leading-6 text-[var(--text-color-light)]">Kurse</span>
              </div>
            </div>

            <div class="flex items-center gap-[31px]">
              <Svg
                class="h-[60px] w-[60px] shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]"
              >
                <i class="fa-regular fa-calendar text-[22px]"></i>
              </Svg>
              <div>
                <span class="block text-[20px] font-bold leading-6 text-[var(--text-color)]">12</span>
                <span class="block text-[17px] leading-6 text-[var(--text-color-light)]">Planungstage (gesamt)</span>
              </div>
            </div>

            <div class="flex items-center gap-[31px]">
              <Svg
                class="h-[60px] w-[60px] shrink-0 rounded-full bg-[#EEF1F6] text-[var(--text-color)]"
              >
                <i class="fa-regular fa-file-lines text-[22px]"></i>
              </Svg>
              <div>
                <span class="block text-[20px] font-bold leading-6 text-[var(--text-color)]">48</span>
                <span class="block text-[17px] leading-6 text-[var(--text-color-light)]">Unterrichtssequenzen (gesamt)</span>
              </div>
            </div>
          </div>
        </section>

     
        <section
          class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] pb-6 pl-6 pr-[19px]"
        >
          <div class="flex h-[58px] items-center justify-between border-b border-[var(--border-color)]">
            <h2 class="text-[22px] font-bold text-[var(--text-color)]">Modulbeschreibung</h2>
            <button
              type="button"
              class="flex h-[41px] cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-4 text-[16px] text-[var(--text-color)]"
            >
              <i class="fa-solid fa-pencil"></i>
              Bearbeiten
            </button>
          </div>

          <p class="pt-[26px] text-[17px] leading-[26.5px] text-[var(--text-color-light)]">
            In diesem Modul lernen die Teilnehmenden die Programmiersprache Python von Grund auf
            kennen. Der Fokus liegt auf praktischen Anwendungen, einer verständlichen Einführung in
            die Syntax sowie der Entwicklung eigener kleiner Projekte. Das Modul bildet die
            Grundlage für weiterführende Themen wie Datenanalyse, Automatisierung und
            Webentwicklung.
          </p>
        </section>
      </div>

      <section
        class="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] pb-7 pl-[29px] pr-[19px]"
      >
        <div class="flex h-[56px] items-center justify-between border-b border-[var(--border-color)]">
          <h2 class="text-[22px] font-bold text-[var(--text-color)]">Lernziele</h2>
          <button
            type="button"
            class="flex h-[41px] cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-4 text-[16px] text-[var(--text-color)]"
          >
            <i class="fa-solid fa-pencil"></i>
            Bearbeiten
          </button>
        </div>

        <ul class="space-y-[9px] pt-[15px] text-[17px] leading-6 text-[var(--text-color-light)]">
          <li class="flex items-center gap-[22px]">
            <span class="h-3 w-3 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"></span>
            Die Teilnehmenden kennen die grundlegende Syntax von Python.
          </li>
          <li class="flex items-center gap-[22px]">
            <span class="h-3 w-3 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"></span>
            Die Teilnehmenden können einfache Programme selbstständig entwickeln.
          </li>
          <li class="flex items-center gap-[22px]">
            <span class="h-3 w-3 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"></span>
            Die Teilnehmenden wenden Python in praktischen Beispielen an.
          </li>
          <li class="flex items-center gap-[22px]">
            <span class="h-3 w-3 shrink-0 rounded-full bg-[var(--secondary-color,#F2A51D)]"></span>
            Die Teilnehmenden verstehen die Grundkonzepte der objektorientierten Programmierung.
          </li>
        </ul>
      </section>
    </div>
  </SectionComp>
</template>