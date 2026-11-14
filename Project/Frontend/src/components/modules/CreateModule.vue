<script setup>
import { reactive } from 'vue'

const form = reactive({
  nummer: '',
  titel: '',
  beschreibung: '',
  lernziele: [''],
})
</script>



<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--text-color)_30%,transparent)] p-4 backdrop-blur-sm">
    <div class="flex max-h-full w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-[color:var(--surface-color)] shadow-2xl font-[family-name:var(--font-family)]">
   
      <div class="flex items-center justify-between border-b border-[color:var(--border-color)] px-7 py-6">
        <div class="flex items-center gap-4">
          <Svg
            class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[color:var(--secondary-color-light,#FFF2E0)] text-[color:var(--secondary-color,#F2A51D)]"
          >
            <i class="fa-solid fa-book-open text-[22px]"></i>
          </Svg>
          <h2 class="text-[28px] font-bold leading-tight text-[color:var(--primary-color)]">Neues Modul</h2>
        </div>
        <span class="p-2 text-[color:var(--text-color-light)]">
          <span class="text-2xl leading-none">x</span>
        </span>
      </div>

      <div class="space-y-5 px-7 py-6">
        <div class="grid grid-cols-[1fr_1.6fr] gap-4">
          <div>
            <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]">Modulnummer *</label>
            <input v-model="form.nummer" type="text" placeholder="z. B. M321" class="w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]" />
          </div>
          <div>
            <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]">Titel *</label>
            <input v-model="form.titel" type="text" placeholder="z. B. Verteilte Systeme" class="w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]" />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-[15px] font-semibold text-[color:var(--primary-color)]">Beschreibung</label>
    <textarea v-model="form.beschreibung" rows="3" placeholder="Worum geht es in diesem Modul?" class="h-[100px] w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]"></textarea>
        </div>

        <div>
          <div class="mb-2 flex items-baseline gap-2">
            <span class="text-[15px] font-semibold text-[color:var(--primary-color)]">Lernziele</span>
            <span class="text-sm text-[color:var(--text-color-light)]">Optional</span>
          </div>
          <input v-model="form.lernziele[0]" type="text" placeholder="z. B. REST-Schnittstellen anwenden" class="w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] px-4 py-3 text-base text-[color:var(--text-color)] placeholder:text-[color:var(--text-color-light)]" />
          <div class="mt-3 flex items-center gap-2 text-[15px] font-semibold text-[color:var(--primary-color)]">
            + Lernziel hinzufügen
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 border-t border-[color:var(--border-color)] bg-[color:var(--background-color)] px-7 py-4">
        <button class="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] hover:bg-[color:var(--hover-light-color)] h-[50px] px-5 text-[15px] font-semibold text-[color:var(--primary-color)]">
          Abbrechen
        </button>
        <button class="inline-flex items-center gap-2 rounded-xl bg-[color:var(--primary-color)] h-[50px] px-5 text-[15px] font-semibold text-[color:var(--text-color-white)]">
        
           + Modul erstellen
        </button>
      </div>
    </div>
  </div>
</template>