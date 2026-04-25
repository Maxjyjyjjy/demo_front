<template>
  <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 bg-white/90 backdrop-blur-lg border-t border-blue-50/30 shadow-[0_-4px_20px_rgba(165,216,255,0.1)] rounded-t-[32px]">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-300 ease-out active:scale-90"
      :class="isActive(item.path)
        ? 'text-blue-500 bg-blue-50/50'
        : 'text-slate-400 hover:text-blue-400'"
    >
      <span class="material-symbols-outlined">{{ item.icon }}</span>
      <span class="text-[11px] font-medium">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'schedule', path: '/', icon: 'event_note', label: 'Schedule' },
  { name: 'library', path: '/library', icon: 'category', label: 'Library' },
  { name: 'profile', path: '/profile', icon: 'person', label: 'Profile' }
]

function isActive(path) {
  if (path === '/') return route.path === '/' || route.path === '/calendar'
  return route.path === path
}
</script>
