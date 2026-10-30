<script lang="ts" setup>
import Svg from '@/components/ui/Svg.vue'
</script>

<template>
  <nav class="sticky inset-x-0 top-0 bg-[var(--surface-color)] px-6 py-3 grid grid-cols-8 gap-5 items-center justify-center w-full border border-transparent border-b-[var(--border-color)]">
    <RouterLink to="/dashboard" class="border-none! col-span-1 flex items-center justify-center min-w-[30px] h-full">
<!--      <div class="flex items-center justify-center h-full min-w-[100px] uppercase col-span-1 px-4 py-3 border border-transparent rounded-lg bg-gray-200">logo</div>-->
      <img src="../../assets/images/cadence-logo.svg" alt="logo" class="w-[120px]"/>
    </RouterLink>
    <div class="col-span-7 flex items-center justify-start gap-1">
      <RouterLink to="/dashboard" class="text-[var(--text-color-light)] cursor-pointer px-3 py-2 flex items-center justify-center h-full gap-2 text-sm font-semibold border border-transparent border-b-[3px]">
        <Svg class="svg">
          <i class="fa-regular fa-house text-lg"></i>
        </Svg>
        <span>Dashboard</span>
      </RouterLink>

      <RouterLink to="/modules" class="text-[var(--text-color-light)] cursor-pointer px-3 py-2 flex items-center justify-center h-full gap-2 text-sm font-semibold border border-transparent border-b-[3px]">
        <Svg class="svg">
          <i class="fa-solid fa-cubes-stacked"></i>
        </Svg>
        <span>Module</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active{
  font-weight: bold;
  border-bottom: 3px var(--secondary-color) solid;
  color: var(--text-color);
}

.router-link-active .svg{
  color: var(--secondary-color);
}
</style>
