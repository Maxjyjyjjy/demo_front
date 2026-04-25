<template>
  <div class="px-5 py-4 max-w-md mx-auto w-full flex flex-col gap-6">
    <!-- 日历容器 -->
    <section class="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <!-- 月份选择器 -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex flex-col">
          <h2 class="text-h1 text-on-surface">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
          <span class="text-label-sm text-on-surface-variant uppercase tracking-widest">Select Date</span>
        </div>
        <div class="flex gap-2">
          <button
            class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-90"
            @click="prevMonth"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-90"
            @click="nextMonth"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- 星期标签 -->
      <div class="grid grid-cols-7 mb-4">
        <div
          v-for="(day, i) in weekLabels"
          :key="day"
          class="text-center text-label-sm"
          :class="i >= 5 ? 'text-secondary-fixed-dim' : 'text-outline'"
        >{{ day }}</div>
      </div>

      <!-- 日历格子 -->
      <div class="grid grid-cols-7 gap-y-2">
        <!-- 空白占位 -->
        <div
          v-for="n in firstDayOffset"
          :key="'empty-' + n"
          class="h-14"
        ></div>

        <!-- 日期 -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="h-14 flex flex-col items-center justify-center cursor-pointer relative"
          @click="selectDate(day)"
        >
          <div
            v-if="isToday(day)"
            class="absolute inset-2 bg-primary rounded-2xl shadow-lg"
          ></div>
          <span
            class="relative text-body-lg font-semibold"
            :class="getDayTextClass(day)"
          >{{ day }}</span>
          <div
            v-if="getDotColor(day)"
            class="relative w-1.5 h-1.5 rounded-full mt-1"
            :class="isToday(day) ? 'bg-on-primary' : getDotColor(day)"
          ></div>
        </div>
      </div>
    </section>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-primary-container/30 p-4 rounded-3xl border border-primary-container/20">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full bg-primary"></div>
          <span class="text-label-sm text-on-primary-container">Major Courses</span>
        </div>
        <p class="text-h2 text-primary">12 Sessions</p>
      </div>
      <div class="bg-secondary-container/30 p-4 rounded-3xl border border-secondary-container/20">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full bg-secondary"></div>
          <span class="text-label-sm text-on-secondary-container">Lab Works</span>
        </div>
        <p class="text-h2 text-secondary">4 Sessions</p>
      </div>
    </div>

    <!-- 今日预览卡片 -->
    <div class="p-5 bg-white rounded-3xl shadow-sm flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
        <span class="material-symbols-outlined text-primary">event_repeat</span>
      </div>
      <div class="flex-grow">
        <p class="text-label-sm text-outline">Upcoming Today</p>
        <h3 class="text-body-lg font-semibold text-on-surface">Advanced UI Design Lab</h3>
      </div>
      <span class="material-symbols-outlined text-outline-variant">chevron_right</span>
    </div>

    <!-- 跳至今天按钮 -->
    <div class="fixed bottom-[92px] left-0 w-full px-5 z-40">
      <button
        class="w-full h-14 rounded-full bg-primary text-on-primary text-h3 shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        @click="jumpToToday"
      >
        <span class="material-symbols-outlined">my_location</span>
        跳至今天
      </button>
    </div>

    <!-- FAB -->
    <button
      class="fixed bottom-32 right-6 w-14 h-14 rounded-2xl bg-primary text-on-primary shadow-xl flex items-center justify-center active:scale-90 transition-transform duration-200 z-40"
    >
      <span class="material-symbols-outlined">add</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const today = new Date(2026, 3, 9)
const currentYear = ref(2026)
const currentMonth = ref(3)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const weekLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOffset = computed(() => {
  const d = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return d === 0 ? 6 : d - 1
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function isToday(day) {
  return (
    currentYear.value === today.getFullYear() &&
    currentMonth.value === today.getMonth() &&
    day === today.getDate()
  )
}

function isWeekend(day) {
  const d = new Date(currentYear.value, currentMonth.value, day).getDay()
  return d === 0 || d === 6
}

function getDayTextClass(day) {
  if (isToday(day)) return 'text-on-primary'
  if (isWeekend(day)) return 'text-on-surface-variant'
  return 'text-on-surface'
}

const eventDots = {
  1: 'bg-primary-container',
  3: 'bg-tertiary-container',
  6: 'bg-secondary-fixed',
  8: 'bg-primary-container',
  9: 'bg-primary',
  13: 'bg-primary-container',
  15: 'bg-tertiary-container',
  17: 'bg-secondary-fixed',
  21: 'bg-primary-container',
  23: 'bg-tertiary-container',
  27: 'bg-secondary-fixed',
  30: 'bg-primary-container'
}

function getDotColor(day) {
  return eventDots[day] || null
}

function selectDate(day) {
  router.push('/')
}

function jumpToToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}
</script>
