
<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
</script>

<template>
  <AppNavbar></AppNavbar>
    <SectionComp>
      <header class="flex items-start justify-between gap-6 mx-8 my-8">
        <div class="flex items-start gap-[34px]">
          <Svg class="w-[102px] h-[102px] shrink-0 rounded-2xl bg-[var(--secondary-color-light,#FFF2E0)] text-[var(--secondary-color,#F2A51D)]">
            <i class="fa-solid fa-book-open text-[46px]"></i>
          </Svg>
          <div class="pt-1">
            <h1 class="text-[40px] font-bold leading-[48px] text-[var(--text-color)]">Module</h1>
            <p class="mt-1 text-[18px] leading-7 text-[var(--text-color-light)]">
              Verwalte deine Module und behalte den Überblick über alle Inhalte,<br />
              Kurse und zugehörigen Planungen.
            </p>
          </div>
        </div>

        <div class="mt-1.5 flex items-center gap-[18px]">
          <label class="flex h-[52px] w-[319px] items-center gap-3.5 rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] px-[18px] text-[var(--text-color-light)]">
            <i class="fa-solid fa-magnifying-glass text-[18px]"></i>
            <input type="text" placeholder="Module suchen ..." class="w-full bg-transparent text-[17px] text-[var(--text-color)] placeholder:text-[var(--text-color-light)] outline-none"/>
          </label>
          <button type="button" class="flex h-[52px] w-[199px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[var(--primary-color,#0A2A66)] text-[18px] font-medium text-white shadow-lg">
            <i class="fa-solid fa-plus"></i> Neues Modul
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-4 mx-8 my-8">
        <div class="hover:shadow-xl lift-hover cursor-pointer shadow-sm col-span-1 w-full flex items-center h-[129px] pl-[27px] pr-[26px] border border-[var(--border-color)] bg-[var(--surface-color)] rounded-xl">
          <Svg class="w-[74px] h-[74px] shrink-0 rounded-xl bg-[var(--primary-color-light,#E8F0FB)] text-[var(--primary-color,#0F2B5B)]">
            <i class="fa-brands fa-python text-[34px]"></i>
          </Svg>

          <div class="ml-11 min-w-0 flex-1">
            <h3 class="text-[21px] font-semibold leading-7 text-[var(--text-color)]">M323 – Python</h3>
            <p class="mt-1 text-[17px] leading-7 text-[var(--text-color-light)]">
              Programmierung in Python mit Fokus auf<br />
              praktische Anwendungen.
            </p>
          </div>
          <div class="hidden lg:flex h-[74px] w-[171px] flex-col justify-center border-l border-[var(--border-color)] pl-[31px]">
            <span class="text-[16px] leading-6 text-[var(--text-color-light)]">Kurse</span>
            <span class="mt-2 text-[18px] leading-6 text-[var(--text-color)]">2</span>
          </div>
          <div class="hidden lg:flex h-[74px] w-[192px] flex-col justify-center border-l border-[var(--border-color)] pl-[31px]">
            <span class="text-[16px] leading-6 text-[var(--text-color-light)]">Erstellt am</span>
            <span class="mt-2 text-[18px] leading-6 text-[var(--text-color)]">12.09.2026</span>
          </div>
          <div class="hidden lg:flex h-[74px] w-[319px] flex-col justify-center border-l border-[var(--border-color)] pl-[30px]">
            <span class="text-[16px] leading-6 text-[var(--text-color-light)]">Zuletzt bearbeitet</span>
            <span class="mt-2 text-[18px] leading-6 text-[var(--text-color)]">18.09.2026</span>
          </div>
          <div class="flex items-center gap-5">
            <button type="button" aria-label="M323 – Python bearbeiten" class="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]" @click.stop>
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button type="button" aria-label="Weitere Aktionen" class="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]" @click.stop>
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>

        <div class="hover:shadow-xl lift-hover cursor-pointer shadow-sm col-span-1 w-full flex items-center h-[129px] pl-[27px] pr-[26px] border border-[var(--border-color)] bg-[var(--surface-color)] rounded-xl">
          <Svg class="w-[74px] h-[74px] shrink-0 rounded-xl bg-[var(--primary-color-light,#E8F0FB)] text-[var(--primary-color,#0F2B5B)]">
            <i class="fa-solid fa-cloud text-[34px]"></i>
          </Svg>
          <div class="ml-11 min-w-0 flex-1">
            <h3 class="text-[21px] font-semibold leading-7 text-[var(--text-color)]">M410 – Cloud &amp; DevOps</h3>
            <p class="mt-1 text-[17px] leading-7 text-[var(--text-color-light)]">
              Deployment, Containerisierung und moderne<br />
              Cloud-Technologien.
            </p>
          </div>

          <div class="hidden lg:flex h-[74px] w-[171px] flex-col justify-center border-l border-[var(--border-color)] pl-[31px]">
            <span class="text-[16px] leading-6 text-[var(--text-color-light)]">Kurse</span>
            <span class="mt-2 text-[18px] leading-6 text-[var(--text-color)]">1</span>
          </div>
          <div class="hidden lg:flex h-[74px] w-[192px] flex-col justify-center border-l border-[var(--border-color)] pl-[31px]">
            <span class="text-[16px] leading-6 text-[var(--text-color-light)]">Erstellt am</span>
            <span class="mt-2 text-[18px] leading-6 text-[var(--text-color)]">10.05.2026</span>
          </div>
          <div class="hidden lg:flex h-[74px] w-[319px] flex-col justify-center border-l border-[var(--border-color)] pl-[30px]">
            <span class="text-[16px] leading-6 text-[var(--text-color-light)]">Zuletzt bearbeitet</span>
            <span class="mt-2 text-[18px] leading-6 text-[var(--text-color)]">22.08.2026</span>
          </div>
          <div class="flex items-center gap-5">
            <button type="button" aria-label="M410 – Cloud &amp; DevOps bearbeiten" class="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]" @click.stop>
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button type="button" aria-label="Weitere Aktionen" class="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)]" @click.stop>
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
      </div>
    </SectionComp>
</template>
