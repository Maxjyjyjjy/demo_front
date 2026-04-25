<template>
  <div class="px-5 py-4 flex flex-col gap-6">
    <!-- 课程模块库 -->
    <section class="bg-surface-container-low rounded-3xl p-4 shadow-sm border border-white">
      <div class="flex items-center justify-between mb-4 px-2">
        <h2 class="text-h3 text-on-surface">课程模块</h2>
        <span class="material-symbols-outlined text-on-surface-variant text-xl">category</span>
      </div>
      <div class="flex flex-col gap-2">
        <!-- 课程卡片 -->
        <div
          v-for="course in courseModules"
          :key="course.id"
          class="p-4 rounded-2xl border shadow-sm cursor-grab active:cursor-grabbing transition-colors"
          :class="courseCardClass(course.color)"
        >
          <div class="flex justify-between items-start">
            <div>
              <span
                class="text-label-xs uppercase tracking-wider mb-1 block"
                :class="courseTextClass(course.color)"
              >{{ course.category }}</span>
              <h3 class="text-h3" :class="courseTextClass(course.color)">{{ course.name }}</h3>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">drag_indicator</span>
            <span class="text-label-sm opacity-70" :class="courseTextClass(course.color)">Hold to drag</span>
          </div>
        </div>
      </div>

      <!-- 新增模块按钮 -->
      <button
        class="w-full mt-6 py-3 rounded-full border-2 border-dashed border-outline-variant text-outline flex items-center justify-center gap-2 text-label-sm hover:bg-surface-container-highest hover:text-on-surface-variant transition-all active:scale-[0.98]"
        @click="showAddModal = true"
      >
        <span class="material-symbols-outlined">add</span>
        新增模块
      </button>
    </section>

    <!-- 日期控制器 -->
    <div class="flex items-center justify-between bg-white p-2 rounded-full shadow-sm border border-blue-50/50">
      <button class="p-2 hover:bg-blue-50 rounded-full text-blue-500 transition-colors" @click="changeDate(-1)">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <div class="flex items-center gap-3 cursor-pointer" @click="goToCalendar">
        <span class="material-symbols-outlined text-blue-400">calendar_month</span>
        <span class="text-body-lg font-semibold text-on-surface">{{ formattedDate }}</span>
      </div>
      <button class="p-2 hover:bg-blue-50 rounded-full text-blue-500 transition-colors" @click="changeDate(1)">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>

    <!-- 时间轴 -->
    <div class="relative bg-white rounded-[32px] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-surface-container-high p-6">
      <div class="flex flex-col">
        <div
          v-for="(slot, index) in timeSlots"
          :key="slot.hour"
          class="relative flex border-t border-surface-container-highest/50 pt-3"
          :class="slotHasEvent(slot.hour) ? 'min-h-[100px]' : 'h-[100px]'"
        >
          <!-- 时间标签 -->
          <div class="w-14 shrink-0">
            <span class="text-label-sm text-on-surface-variant/60">{{ slot.label }}</span>
          </div>

          <div class="flex-grow relative">
            <!-- 已排课程 -->
            <div
              v-if="getEventAt(slot.hour)"
              class="absolute top-0 left-2 right-0 rounded-2xl p-4 shadow-md border-l-4 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
              :class="eventCardClass(getEventAt(slot.hour))"
              :style="{ height: getEventHeight(getEventAt(slot.hour)) + 'px' }"
              @click="openDetail(getEventAt(slot.hour))"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-h3" :class="eventTextClass(getEventAt(slot.hour))">{{ getEventAt(slot.hour).name }}</h3>
                <div class="flex items-center gap-2">
                  <div
                    v-if="getEventAt(slot.hour).status === 'live'"
                    class="bg-white/40 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="eventTextClass(getEventAt(slot.hour))"
                  >LIVE</div>
                  <span
                    v-if="getEventAt(slot.hour).location"
                    class="flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-base opacity-50">location_on</span>
                    <span class="text-label-sm opacity-70">{{ getEventAt(slot.hour).location }}</span>
                  </span>
                  <span class="material-symbols-outlined text-base opacity-50">more_horiz</span>
                </div>
              </div>
              <div v-if="getEventAt(slot.hour).description" class="flex-grow mt-2">
                <p class="text-body-md opacity-60 line-clamp-2">{{ getEventAt(slot.hour).description }}</p>
              </div>
              <div class="flex items-center justify-between opacity-80 mt-1">
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  <span class="text-body-md font-medium">{{ getEventAt(slot.hour).startTime }} - {{ getEventAt(slot.hour).endTime }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">drag_handle</span>
                  <div
                    class="w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-ns-resize"
                    :class="eventDotClass(getEventAt(slot.hour))"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 休息时间 -->
            <div
              v-if="slot.hour === 12"
              class="flex items-center justify-center h-full"
            >
              <div class="bg-surface-container-low px-4 py-1 rounded-full text-on-surface-variant/40 flex items-center gap-2">
                <span class="material-symbols-outlined text-base">lunch_dining</span>
                <span class="text-label-sm">Break Time</span>
              </div>
            </div>

            <!-- 当前时间指示线 -->
            <div
              v-if="slot.hour === currentTimeSlot"
              class="flex items-center w-full absolute"
              :style="{ top: currentTimeOffset + 'px' }"
            >
              <div class="w-full h-0.5 bg-blue-500/20 relative">
                <div class="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-blue-500"></div>
                <span class="absolute -top-6 left-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">CURRENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button
      class="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all duration-300 z-40"
      @click="showAddModal = true"
    >
      <span class="material-symbols-outlined text-3xl">add</span>
    </button>

    <!-- 课程详情抽屉 -->
    <CourseDetailDrawer
      :visible="showDetail"
      :course="selectedCourse"
      @close="showDetail = false"
    />

    <!-- 新增课程弹窗 -->
    <AddCourseModal
      :visible="showAddModal"
      @close="showAddModal = false"
      @save="addCourse"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CourseDetailDrawer from '../components/CourseDetailDrawer.vue'
import AddCourseModal from '../components/AddCourseModal.vue'

const router = useRouter()

const currentDate = ref(new Date(2026, 3, 25))

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const formattedDate = computed(() => {
  const d = currentDate.value
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`
})

function changeDate(offset) {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + offset)
  currentDate.value = d
}

function goToCalendar() {
  router.push('/calendar')
}

const courseModules = ref([
  { id: 1, name: '钢琴', category: 'Activity', color: 'blue' },
  { id: 2, name: '唱歌', category: 'Art', color: 'pink' },
  { id: 3, name: '书法', category: 'Skill', color: 'green' }
])

const scheduledEvents = ref([
  {
    id: 1,
    name: '钢琴',
    startTime: '10:00',
    endTime: '11:00',
    startHour: 10,
    duration: 1,
    color: 'blue',
    status: 'live',
    location: null,
    description: null
  },
  {
    id: 2,
    name: '唱歌',
    startTime: '14:00',
    endTime: '15:30',
    startHour: 14,
    duration: 1.5,
    color: 'pink',
    status: null,
    location: 'Studio B',
    description: 'Vocal training and warm-ups session.'
  }
])

const timeSlots = computed(() => {
  const slots = []
  for (let h = 10; h <= 16; h++) {
    slots.push({ hour: h, label: `${h}:00` })
  }
  return slots
})

function slotHasEvent(hour) {
  return scheduledEvents.value.some(e => e.startHour === hour)
}

function getEventAt(hour) {
  return scheduledEvents.value.find(e => e.startHour === hour) || null
}

function getEventHeight(event) {
  return Math.max(84, event.duration * 100)
}

const currentTimeSlot = ref(16)
const currentTimeOffset = ref(30)

function courseCardClass(color) {
  const map = {
    blue: 'course-card-blue',
    pink: 'course-card-pink',
    green: 'course-card-green'
  }
  return map[color] || map.blue
}

function courseTextClass(color) {
  const map = {
    blue: 'text-on-primary-container',
    pink: 'text-on-tertiary-container',
    green: 'text-on-secondary-container'
  }
  return map[color] || map.blue
}

function eventCardClass(event) {
  const map = {
    blue: 'bg-primary-container border-primary',
    pink: 'bg-tertiary-container border-tertiary',
    green: 'bg-secondary-container border-secondary'
  }
  return map[event.color] || map.blue
}

function eventTextClass(event) {
  const map = {
    blue: 'text-on-primary-container',
    pink: 'text-on-tertiary-container',
    green: 'text-on-secondary-container'
  }
  return map[event.color] || map.blue
}

function eventDotClass(event) {
  const map = {
    blue: 'bg-primary',
    pink: 'bg-tertiary',
    green: 'bg-secondary'
  }
  return map[event.color] || map.blue
}

const showDetail = ref(false)
const selectedCourse = ref(null)

function openDetail(event) {
  selectedCourse.value = event
  showDetail.value = true
}

const showAddModal = ref(false)

function addCourse(course) {
  courseModules.value.push({
    id: Date.now(),
    name: course.name,
    category: 'Custom',
    color: course.color
  })
  showAddModal.value = false
}
</script>
