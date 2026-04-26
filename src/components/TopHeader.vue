<template>
  <header
    v-if="mode === 'schedule'"
    class="fixed top-0 left-0 w-full z-50 flex items-center px-5 h-16 bg-white/80 backdrop-blur-md border-b border-blue-50/50 shadow-sm shadow-blue-100/20"
  >
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-blue-500">calendar_today</span>
      <h1 class="text-lg font-semibold tracking-tight text-blue-400">Today's Schedule</h1>
    </div>
  </header>

  <header
    v-else-if="mode === 'homework'"
    class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-white/80 backdrop-blur-lg shadow-[0_4px_12px_0px_rgba(165,216,255,0.15)]"
  >
    <div class="flex items-center gap-3">
      <span class="material-symbols-outlined text-blue-400">calendar_today</span>
      <h1 class="text-xl font-bold tracking-tight text-blue-500">CourseFlow</h1>
    </div>
    <div class="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden border-2 border-white shadow-sm">
      <img
        class="w-full h-full object-cover"
        alt="User Profile"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe-_eURhVWgerqi5ba_GmdMP_W5VwtvXV9NxLUDJJJD8vEAAd3Rin96ig-jvOtKQr48VKsFYe6KH26J0_5eFQfACdqkcKHCuJmZ69i2_uQOaFeb7ewhCMEUFm6UNi2b8n3y4NG6bglf04aZ93Pu4rEDtnpiEXYvXnYv-dTWK1bm8aJRtqoOXT6LU9Ho1YxShtHjiLcpM7wg2z1jOIvBoPp-MMOAjlwSF7a86ejcWDtN0FTaoLROXVsLfgdXfs_Eegjvg_xQYLj31e3"
      />
    </div>
  </header>

  <header
    v-else
    class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-white/80 backdrop-blur-md border-b border-blue-50/50 shadow-sm"
  >
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-blue-500">calendar_today</span>
      <h1 class="text-lg font-semibold tracking-tight text-blue-400">CourseFlow</h1>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const mode = computed(() => {
  if (route.path === '/' || route.path === '/calendar') return 'schedule'
  if (route.path === '/homework') return 'homework'
  return 'default'
})
</script>
