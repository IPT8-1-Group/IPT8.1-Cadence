<script lang="ts" setup>
import NavbarLayout from '@/components/layout/NavbarLayout.vue'
</script>

<template>
  <NavbarLayout>
    <RouterLink
      to="/dashboard"
      class="hover:border-b-[var(--border-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-4 py-2 md:px-3 md:py-2 flex items-center justify-center h-full gap-2 text-base md:text-sm font-semibold border border-transparent border-b-[3px]"
    >
      <Svg class="svg">
        <i class="fa-regular fa-house text-lg"></i>
      </Svg>
      <span>Dashboard</span>
    </RouterLink>

    <RouterLink
      to="/modules"
      class="hover:border-b-[var(--border-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-4 py-2 md:px-3 md:py-2 flex items-center justify-center h-full gap-2 text-base md:text-sm font-semibold border border-transparent border-b-[3px]"
    >
      <Svg class="svg">
        <i class="fa-solid fa-cubes-stacked text-lg"></i>
      </Svg>
      <span>Module</span>
    </RouterLink>
  </NavbarLayout>
</template>

<style scoped>
.router-link-active {
  font-weight: bold;
  border-bottom: 3px var(--secondary-color) solid;
  color: var(--text-color);
}

.router-link-active .svg {
  color: var(--secondary-color);
}
</style>
