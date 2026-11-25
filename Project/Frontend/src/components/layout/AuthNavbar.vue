<script lang="ts" setup>
import NavbarLayout from '@/components/layout/NavbarLayout.vue'
import Svg from '@/components/ui/Svg.vue'
</script>

<template>
  <NavbarLayout>
    <RouterLink
      to="/registrationrequest"
      class="hover:border-b-[var(--border-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-4 py-2 md:px-3 md:py-2 flex items-center justify-center h-full gap-2 text-base md:text-sm font-semibold border border-transparent border-b-[3px]"
    >
      <Svg class="svg">
        <i class="fa-solid fa-bell"></i>
      </Svg>
      <span>Anfragen</span>
    </RouterLink>

    <RouterLink
      to="/users"
      class="hover:border-b-[var(--border-color)] transition duration-200 text-[var(--text-color-light)] cursor-pointer px-4 py-2 md:px-3 md:py-2 flex items-center justify-center h-full gap-2 text-base md:text-sm font-semibold border border-transparent border-b-[3px]"
    >
      <Svg class="svg">
        <i class="fa-solid fa-screwdriver-wrench"></i>
      </Svg>
      <span>Verwaltung</span>
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
