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
    class="fixed top-0 left-0 w-full z-50 flex items-center px-5 h-16 bg-white/80 backdrop-blur-lg shadow-[0_4px_12px_0px_rgba(165,216,255,0.15)]"
  >
    <div class="flex items-center gap-3">
      <span class="material-symbols-outlined text-blue-400">calendar_today</span>
      <h1 class="text-xl font-bold tracking-tight text-blue-500">CourseFlow</h1>
    </div>
  </header>

  <header
    v-else-if="mode === 'profile'"
    class="fixed top-0 left-0 w-full z-50 flex items-center px-5 h-16 bg-white/80 backdrop-blur-md border-b border-blue-50/50 shadow-sm"
  >
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-blue-500">account_circle</span>
      <h1 class="text-lg font-semibold tracking-tight text-blue-400">个人主页</h1>
    </div>
  </header>

  <header
    v-else
    class="fixed top-0 left-0 w-full z-50 flex items-center px-5 h-16 bg-white/80 backdrop-blur-md border-b border-blue-50/50 shadow-sm"
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
  if (route.path === '/profile') return 'profile'
  return 'default'
})
</script>
