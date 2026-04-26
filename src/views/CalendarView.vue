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
            v-if="selectedDay === day && !isToday(day)"
            class="absolute inset-2 bg-primary-container/50 rounded-2xl"
          ></div>
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

    <!-- 跳至今天：进入 Schedule 主页并切到今天 -->
    <div class="fixed bottom-[92px] left-0 w-full px-5 z-40">
      <button
        class="w-full h-14 rounded-full bg-primary text-on-primary text-h3 shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        @click="jumpToToday"
      >
        <span class="material-symbols-outlined">my_location</span>
        跳至今天
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const _initial = new Date()
const currentYear = ref(_initial.getFullYear())
const currentMonth = ref(_initial.getMonth())
const selectedDay = ref(null)

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
  const t = new Date()
  return (
    currentYear.value === t.getFullYear() &&
    currentMonth.value === t.getMonth() &&
    day === t.getDate()
  )
}

function isWeekend(day) {
  const d = new Date(currentYear.value, currentMonth.value, day).getDay()
  return d === 0 || d === 6
}

function getDayTextClass(day) {
  if (isToday(day)) return 'text-on-primary'
  if (selectedDay.value === day) return 'text-on-primary-container'
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
  selectedDay.value = day
  const d = new Date(currentYear.value, currentMonth.value, day)
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const returnTo = typeof route.query?.returnTo === 'string' && route.query.returnTo ? route.query.returnTo : '/'
  router.push({ path: returnTo, query: { date: iso } })
}

function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function jumpToToday() {
  const iso = toIso(new Date())
  router.push({ path: '/', query: { date: iso } })
}

function applyFromQuery() {
  const q = route.query?.date
  if (typeof q !== 'string' || !q) return
  const d = new Date(q)
  if (Number.isNaN(d.getTime())) return
  currentYear.value = d.getFullYear()
  currentMonth.value = d.getMonth()
  selectedDay.value = d.getDate()
}

applyFromQuery()
watch(() => route.query?.date, applyFromQuery)
</script>
