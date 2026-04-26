<template>
  <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-xl border-t border-blue-50/50 shadow-[0_-8px_24px_-4px_rgba(165,216,255,0.2)] rounded-t-[32px]">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="flex flex-col items-center justify-center px-6 py-2 rounded-2xl transition-all duration-300 ease-out active:scale-90"
      :class="isActive(item.path) ? activeClass(item) : inactiveClass"
    >
      <span class="material-symbols-outlined" :class="isActive(item.path) ? 'icon-filled' : ''">{{ item.icon }}</span>
      <span class="text-[12px] font-medium mt-1">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'schedule', path: '/', icon: 'calendar_view_day', label: 'Schedule' },
  { name: 'homework', path: '/homework', icon: 'assignment', label: 'Homework' }
]

function isActive(path) {
  if (path === '/') return route.path === '/' || route.path === '/calendar'
  return route.path === path
}

const inactiveClass = 'text-slate-400 hover:text-blue-400'

function activeClass(item) {
  if (item.path === '/homework') return 'bg-blue-50 text-blue-600'
  return 'bg-blue-50/50 text-blue-500'
}
</script>

<style scoped>
.icon-filled {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
