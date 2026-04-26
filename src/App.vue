<template>
  <div class="min-h-screen bg-surface">
    <TopHeader v-if="!hideChrome" />
    <main :class="hideChrome ? 'pt-0 pb-0' : 'pt-16 pb-20'">
      <router-view />
    </main>
    <BottomNav v-if="!hideChrome" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopHeader from './components/TopHeader.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const hideChrome = computed(() => Boolean(route.meta?.hideChrome))
</script>
