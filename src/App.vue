<template>
  <div class="min-h-screen bg-surface">
    <TopHeader />
    <main class="pt-16 pb-28">
      <router-view />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import TopHeader from './components/TopHeader.vue'
import BottomNav from './components/BottomNav.vue'
</script>
