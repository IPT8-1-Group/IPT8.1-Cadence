<script lang="ts" setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import Svg from '@/components/ui/Svg.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import { useModuleStore } from '@/stores/moduleStore.ts'
import { onMounted, ref } from 'vue'
import { getModuleIcon } from '@/utils/moduleIcon.ts'
import { useRouter } from 'vue-router'

const moduleStore = useModuleStore()

const error = ref<string | null>(null)
onMounted(async () => {
  error.value = ''
  try {
    await moduleStore.getModules()
  } catch {}
})

const router = useRouter()
async function routerToModuleDetailed(id: number) {
  await router.push(`/moduleDetail/${id}`)
}
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <header class="flex flex-col items-start justify-center gap-3 mx-8 my-8">
      <span class="subtitle w-full sm:text-left text-center">Übersicht</span>
      <h1 class="sm:text-left text-center">Stundenplaner Dashboard</h1>
      <p class="text-[var(--text-color-light)]sm:text-left text-center">
        Wähle ein Fach oder eine Klasse aus, um die Details zu öffnen.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-3 mx-8 my-8">
      <div
        v-for="module in moduleStore.modulesData?.data"
        :key="module.id"
        @click="routerToModuleDetailed(module.id)"
        class="hover:shadow-xl lift-hover cursor-pointer shadow-lg col-span-1 w-full flex items-center justify-between gap-3 px-6 py-4 border border-[var(--border-color)] bg-[var(--surface-color)] rounded-2xl"
      >
        <div class="flex items-center justify-center gap-3">
          <Svg
            class="w-[60px] h-[60px] rounded-lg bg-[var(--secondary-color-light)] text-[var(--secondary-color)]"
          >
            <i :class="getModuleIcon(module.title)" class="text-[40px]"></i>
          </Svg>

          <h3 class="font-semibold text-[var(--text-color)]">
            {{ module.code }} - {{ module.title }}
          </h3>
        </div>
        <Svg>
          <i class="fa-solid fa-angle-right"></i>
        </Svg>
      </div>
    </div>
  </SectionComp>
</template>
