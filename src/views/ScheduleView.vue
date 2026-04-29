<template>
  <div class="px-5 py-4 flex flex-col gap-6">
    <ConfirmDialog
      :visible="confirm.visible"
      :title="confirm.title"
      :message="confirm.message"
      confirm-text="删除"
      cancel-text="取消"
      :danger="true"
      @confirm="runConfirm"
      @cancel="closeConfirm"
    />

    <div
      v-if="toastMessage"
      class="fixed top-20 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-full bg-error text-on-error text-label-sm shadow-soft-2"
      role="status"
    >
      {{ toastMessage }}
    </div>

    <!-- 课程模块（网格） -->
    <section class="w-full">
      <div class="bg-surface-container-low rounded-[24px] p-4 shadow-sm border border-white">
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="text-h3 text-on-surface">课程模块</h2>
          <span class="material-symbols-outlined text-on-surface-variant text-[20px]">category</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="course in courseModules"
            :key="course.id"
            draggable="true"
            class="p-2 rounded-[16px] border shadow-sm flex flex-col items-center justify-center aspect-square text-center cursor-grab active:cursor-grabbing transition-colors select-none relative"
            :class="[moduleGridClass(course.color), { 'opacity-60 scale-[0.98]': draggingModuleId === course.id }]"
            @dragstart="onModuleDragStart($event, course)"
            @dragend="onModuleDragEnd"
            @pointerdown="onModulePointerDown($event, course)"
            @pointermove="onModulePointerMove($event)"
            @pointerup="onModulePointerUp"
            @pointercancel="onModulePointerCancel"
          >
            <button
              class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/55 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center active:scale-95 transition-colors hover:bg-white/70"
              @click.stop="confirmDeleteModule(course.id)"
              aria-label="删除课程模块"
            >
              <span class="material-symbols-outlined text-[16px] text-outline">close</span>
            </button>
            <span class="text-label-xs uppercase tracking-tight mb-1 opacity-60" :class="courseTextClass(course.color)">
              {{ course.category }}
            </span>
            <h3 class="font-bold text-sm" :class="courseTextClass(course.color)">{{ course.name }}</h3>
            <span class="material-symbols-outlined text-[14px] mt-1 opacity-50" :class="courseTextClass(course.color)">
              drag_indicator
            </span>
          </div>

          <button
            class="bg-white/40 p-2 rounded-[16px] border-2 border-dashed border-outline-variant/30 flex items-center justify-center aspect-square cursor-pointer hover:bg-white/60 transition-all active:scale-[0.98]"
            @click="showAddModal = true"
          >
            <span class="material-symbols-outlined text-outline/40">add</span>
          </button>
        </div>
      </div>
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

    <!-- 横向时间轴 -->
    <section class="flex-grow flex flex-col min-w-0">
      <div class="relative bg-white rounded-[32px] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-surface-container-high p-6 overflow-hidden">
        <div class="absolute bottom-4 left-4 z-10">
          <button
            class="h-9 px-3 rounded-full text-label-sm border transition-colors"
            :class="useHalfHour
              ? 'bg-primary text-on-primary border-primary/30'
              : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container'"
            type="button"
            @click="useHalfHour = !useHalfHour"
          >
            {{ useHalfHour ? '30m' : '1h' }}
          </button>
        </div>

        <p v-if="dropHint" class="text-label-sm text-primary text-center -mt-1 mb-3">{{ dropHint }}</p>

        <div
          ref="timelineScrollEl"
          class="overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing pb-14"
          @dragover.prevent="onTimelineDragOver"
        >
          <div class="flex pb-4" :style="{ minWidth: `${timelineMinWidth}px` }">
            <div
              v-for="slot in timeSlots"
              :key="slot.key"
              class="flex-shrink-0 border-l border-surface-container-highest/50 relative min-h-[300px]"
              :class="[slotWidthClass, slotPaddingClass]"
              :data-slot="String(slot.key)"
              @dragover.prevent="onSlotDragOver($event, slot.key)"
              @drop.prevent="onDropOnSlot($event, slot.key)"
            >
              <span class="text-label-sm text-on-surface-variant/60 block mb-4 whitespace-nowrap">{{ slot.label }}</span>

              <div
                v-if="slot.key === 720 && !getEventBySlotKey(720)"
                class="mt-12 bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant/40 flex items-center justify-center gap-1"
              >
                <span class="material-symbols-outlined text-[14px]">lunch_dining</span>
                <span class="text-[10px] font-semibold">Break</span>
              </div>

              <div
                v-if="getEventBySlotKey(slot.key)"
                class="rounded-[16px] p-3 shadow-md border-t-4 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow h-40"
                :class="eventCardClass(getEventBySlotKey(slot.key))"
                @click="openDetail(getEventBySlotKey(slot.key))"
              >
                <div class="flex items-center justify-between">
                  <h3 class="font-bold text-sm" :class="eventTextClass(getEventBySlotKey(slot.key))">
                    {{ getEventBySlotKey(slot.key).name }}
                  </h3>
                </div>

                <p
                  v-if="getEventBySlotKey(slot.key).description"
                  class="text-[10px] mt-1 line-clamp-2 leading-tight"
                  :class="eventTextClass(getEventBySlotKey(slot.key)) + '/60'"
                >
                  {{ getEventBySlotKey(slot.key).description }}
                </p>

                <div class="mt-auto">
                  <div class="flex items-center gap-1 text-[10px]" :class="eventTextClass(getEventBySlotKey(slot.key)) + '/80'">
                    <span class="material-symbols-outlined text-[12px]">schedule</span>
                    <span>{{ getEventBySlotKey(slot.key).startTime }} - {{ getEventBySlotKey(slot.key).endTime }}</span>
                  </div>
                </div>
              </div>

              <div v-if="dropTargetKey === slot.key" class="absolute inset-y-0 right-0 w-1 bg-primary/20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAB -->
    <button
      class="fixed w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center active:scale-90 transition-all duration-300 z-40"
      :style="fabStyle"
      @pointerdown="onFabPointerDown"
      @pointermove="onFabPointerMove"
      @pointerup="onFabPointerUp"
      @pointercancel="onFabPointerCancel"
      @click="onFabClick"
    >
      <span class="material-symbols-outlined text-[28px]">add</span>
    </button>

    <CourseDetailDrawer :visible="showDetail" :course="selectedCourse" @close="showDetail = false" @remove="confirmRemoveScheduledCourse" />
    <AddCourseModal :visible="showAddModal" @close="showAddModal = false" @save="addCourse" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CourseDetailDrawer from '../components/CourseDetailDrawer.vue'
import AddCourseModal from '../components/AddCourseModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import {
  createCourseModule,
  deleteCourseModule,
  fetchCourseModules
} from '../services/courseModuleService'
import {
  createScheduleEvent,
  deleteScheduleEvent,
  fetchScheduleEvents
} from '../services/scheduleService'

const router = useRouter()
const route = useRoute()
const timelineScrollEl = ref(null)
const useHalfHour = ref(false)
const dropTargetKey = ref(null)
const slotWidthClass = computed(() => (useHalfHour.value ? 'w-9' : 'w-[72px]'))
const slotPaddingClass = computed(() => (useHalfHour.value ? 'px-2' : 'px-3'))
const timelineMinWidth = computed(() => 1728)

async function scrollToDefaultHour() {
  await nextTick()
  const root = timelineScrollEl.value
  if (!root) return
  const el = root.querySelector('[data-slot="480"]') // 08:00
  if (!el) return
  el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' })
}

function parseQueryDate(value) {
  if (typeof value !== 'string' || !value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

const currentDate = ref(parseQueryDate(route.query?.date) || new Date())

const dayIso = computed(() => {
  const d = currentDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function hasApi() {
  return Boolean(import.meta.env.VITE_API_BASE_URL)
}

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
  const d = currentDate.value
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  router.push({ path: '/calendar', query: { date: iso, returnTo: route.path } })
}

watch(
  () => route.query?.date,
  (v) => {
    const d = parseQueryDate(v)
    if (!d) return
    currentDate.value = d
    scrollToDefaultHour()
  }
)

const courseModules = ref(
  hasApi()
    ? []
    : [
        { id: 1, name: '钢琴', category: 'Activity', color: 'blue' },
        { id: 2, name: '唱歌', category: 'Art', color: 'pink' },
        { id: 3, name: '书法', category: 'Skill', color: 'green' }
      ]
)

const draggingModuleId = ref(null)
const dropHint = ref('')
const nextEventId = ref(100)
const toastMessage = ref('')
let toastTimer = null
const confirm = ref({
  visible: false,
  title: '确认删除？',
  message: '',
  action: null
})

// Mobile long-press drag state (Pointer Events)
const activePointerId = ref(null)
const pendingDrag = ref(null) // { module, pointerId }
const isTouchDragging = ref(false)
let longPressTimer = null
let edgeHoldTimer = null
let edgeScrollTimer = null
let edgeDirection = 0 // -1: 左, 1: 右, 0: 停止

const EDGE_ZONE_PX = 56
const EDGE_HOLD_MS = 2000
const EDGE_SCROLL_STEP_PX = 24
const EDGE_SCROLL_INTERVAL_MS = 48

const fabX = ref(null)
const fabY = ref(null)
const fabPointerId = ref(null)
const fabStart = ref({ x: 0, y: 0, left: 0, top: 0, moved: false })
const suppressFabClick = ref(false)
const fabStyle = computed(() => {
  if (fabX.value == null || fabY.value == null) {
    return { right: '2rem', bottom: '6rem' }
  }
  return {
    left: `${fabX.value}px`,
    top: `${fabY.value}px`
  }
})

function showToast(message) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 1600)
}

function openConfirm({ title = '确认删除？', message = '', action }) {
  confirm.value = { visible: true, title, message, action }
}

function closeConfirm() {
  confirm.value = { ...confirm.value, visible: false, action: null }
}

function runConfirm() {
  const action = confirm.value.action
  closeConfirm()
  if (typeof action === 'function') action()
}

function clearLongPress() {
  if (longPressTimer) clearTimeout(longPressTimer)
  longPressTimer = null
  pendingDrag.value = null
}

function stopEdgeAutoScroll() {
  if (edgeHoldTimer) clearTimeout(edgeHoldTimer)
  edgeHoldTimer = null
  if (edgeScrollTimer) clearInterval(edgeScrollTimer)
  edgeScrollTimer = null
  edgeDirection = 0
}

function applyEdgeAutoScroll(direction) {
  if (direction === edgeDirection) return
  stopEdgeAutoScroll()
  if (!direction) return
  edgeDirection = direction
  edgeHoldTimer = setTimeout(() => {
    edgeScrollTimer = setInterval(() => {
      const root = timelineScrollEl.value
      if (!root) return
      root.scrollLeft += edgeDirection * EDGE_SCROLL_STEP_PX
    }, EDGE_SCROLL_INTERVAL_MS)
  }, EDGE_HOLD_MS)
}

function updateEdgeAutoScrollByX(clientX) {
  const root = timelineScrollEl.value
  if (!root) return
  const rect = root.getBoundingClientRect()
  const inY = clientX >= rect.left && clientX <= rect.right
  if (!inY) {
    stopEdgeAutoScroll()
    return
  }
  if (clientX <= rect.left + EDGE_ZONE_PX) {
    applyEdgeAutoScroll(-1)
    return
  }
  if (clientX >= rect.right - EDGE_ZONE_PX) {
    applyEdgeAutoScroll(1)
    return
  }
  stopEdgeAutoScroll()
}

function initFabPositionIfNeeded() {
  if (fabX.value != null && fabY.value != null) return
  const width = window.innerWidth
  const height = window.innerHeight
  fabX.value = Math.max(16, width - 32 - 56)
  fabY.value = Math.max(16, height - 96 - 56)
}

function clampFab(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function onFabPointerDown(e) {
  initFabPositionIfNeeded()
  fabPointerId.value = e.pointerId
  fabStart.value = {
    x: e.clientX,
    y: e.clientY,
    left: fabX.value ?? 0,
    top: fabY.value ?? 0,
    moved: false
  }
  try {
    e.currentTarget?.setPointerCapture?.(e.pointerId)
  } catch {
    /* ignore */
  }
}

function onFabPointerMove(e) {
  if (fabPointerId.value == null || fabPointerId.value !== e.pointerId) return
  const dx = e.clientX - fabStart.value.x
  const dy = e.clientY - fabStart.value.y
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
    fabStart.value.moved = true
  }
  const maxLeft = Math.max(16, window.innerWidth - 16 - 56)
  const maxTop = Math.max(16, window.innerHeight - 16 - 56)
  fabX.value = clampFab(fabStart.value.left + dx, 16, maxLeft)
  fabY.value = clampFab(fabStart.value.top + dy, 16, maxTop)
}

function endFabDrag(pointerId) {
  if (fabPointerId.value == null || fabPointerId.value !== pointerId) return
  suppressFabClick.value = fabStart.value.moved
  if (suppressFabClick.value) {
    setTimeout(() => {
      suppressFabClick.value = false
    }, 120)
  }
  fabPointerId.value = null
}

function onFabPointerUp(e) {
  endFabDrag(e.pointerId)
}

function onFabPointerCancel(e) {
  endFabDrag(e.pointerId)
}

function onFabClick() {
  if (suppressFabClick.value) return
  showAddModal.value = true
}

function findSlotKeyFromPoint(clientX, clientY) {
  const els = document.elementsFromPoint(clientX, clientY)
  for (const el of els) {
    if (el?.dataset?.slot != null) {
      const n = Number(el.dataset.slot)
      if (!Number.isNaN(n)) return n
    }
  }
  return null
}

function onModulePointerDown(e, module) {
  // Only improve touch UX; keep desktop native drag intact
  if (e.pointerType !== 'touch') return
  activePointerId.value = e.pointerId
  pendingDrag.value = { module, pointerId: e.pointerId }

  clearLongPress()
  pendingDrag.value = { module, pointerId: e.pointerId }
  longPressTimer = setTimeout(() => {
    if (!pendingDrag.value || pendingDrag.value.pointerId !== e.pointerId) return
    isTouchDragging.value = true
    draggingModuleId.value = module.id
    dropHint.value = '拖到对应时间段松手即可添加'
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
  }, 120)
}

function onModulePointerMove(e) {
  if (e.pointerType !== 'touch') return
  if (!activePointerId.value || e.pointerId !== activePointerId.value) return

  // Before long-press triggers, moving finger cancels to allow scrolling
  if (!isTouchDragging.value) return

  const key = findSlotKeyFromPoint(e.clientX, e.clientY)
  dropTargetKey.value = key
  updateEdgeAutoScrollByX(e.clientX)
  e.preventDefault()
}

function commitTouchDrop(slotKey) {
  if (slotKey == null) return
  const mod = pendingDrag.value?.module
  if (!mod) return
  void addEventToSlot(mod, slotKey)
}

function endTouchDrag() {
  clearLongPress()
  stopEdgeAutoScroll()
  isTouchDragging.value = false
  activePointerId.value = null
  draggingModuleId.value = null
  dropTargetKey.value = null
  dropHint.value = ''
}

function onModulePointerUp(e) {
  if (e.pointerType !== 'touch') return
  if (!activePointerId.value || e.pointerId !== activePointerId.value) return

  if (isTouchDragging.value) {
    commitTouchDrop(dropTargetKey.value)
  }
  endTouchDrag()
}

function onModulePointerCancel(e) {
  if (e.pointerType !== 'touch') return
  if (!activePointerId.value || e.pointerId !== activePointerId.value) return
  endTouchDrag()
}

const DRAG_MIME = 'application/x-demo-course-module'

function onModuleDragStart(e, course) {
  draggingModuleId.value = course.id
  dropHint.value = '将模块拖到下方对应时间段'
  try {
    const payload = JSON.stringify({
      id: course.id,
      name: course.name,
      category: course.category,
      color: course.color
    })
    e.dataTransfer.setData(DRAG_MIME, payload)
    e.dataTransfer.setData('text/plain', course.name)
  } catch {
    /* ignore */
  }
  e.dataTransfer.effectAllowed = 'copy'
}

function onModuleDragEnd() {
  stopEdgeAutoScroll()
  draggingModuleId.value = null
  dropTargetKey.value = null
  dropHint.value = ''
}

function onSlotDragOver(e, slotKey) {
  if (!draggingModuleId.value) return
  e.dataTransfer.dropEffect = 'copy'
  dropTargetKey.value = slotKey
  updateEdgeAutoScrollByX(e.clientX)
}

function onTimelineDragOver(e) {
  if (!draggingModuleId.value) return
  updateEdgeAutoScrollByX(e.clientX)
}

function onDropOnSlot(e, slotKey) {
  const raw = e.dataTransfer.getData(DRAG_MIME) || e.dataTransfer.getData('text/plain')
  if (!raw) {
    onModuleDragEnd()
    return
  }
  let mod
  try {
    mod = raw.startsWith('{') ? JSON.parse(raw) : { name: raw, color: 'blue', id: 0, category: '' }
  } catch {
    onModuleDragEnd()
    return
  }
  if (!mod.name) {
    onModuleDragEnd()
    return
  }
  void addEventToSlot(mod, slotKey).finally(() => onModuleDragEnd())
}

function minutesToClock(totalMinutes) {
  const m = ((totalMinutes % 1440) + 1440) % 1440
  return { hour: Math.floor(m / 60), minute: m % 60 }
}

function buildEventTiming(slotKey) {
  const startMinutes = slotKey
  const duration = useHalfHour.value ? 0.5 : 1 // hours
  const endMinutes = startMinutes + duration * 60
  return { startMinutes, endMinutes, duration }
}

function formatTime(hour, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const scheduledEvents = ref(
  hasApi()
    ? []
    : [
        {
          id: 1,
          name: '钢琴',
          startTime: '10:00',
          endTime: '11:00',
          startHour: 10,
          startMinute: 0,
          startSlotKey: 600,
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
          startMinute: 0,
          startSlotKey: 840,
          duration: 1.5,
          color: 'pink',
          status: null,
          location: 'Studio B',
          description: 'Vocal training and warm-ups session.'
        }
      ]
)

async function loadCourseModulesOnly() {
  if (!hasApi()) return
  try {
    courseModules.value = await fetchCourseModules()
  } catch (e) {
    showToast(e?.message || '加载失败')
  }
}

watch(
  dayIso,
  (iso) => {
    if (!hasApi()) return
    void fetchScheduleEvents(iso)
      .then((evs) => {
        scheduledEvents.value = evs
      })
      .catch((e) => {
        showToast(e?.message || '加载失败')
      })
  },
  { immediate: true }
)

onMounted(() => {
  if (hasApi()) {
    void loadCourseModulesOnly()
  }
  scrollToDefaultHour()
})

const timeSlots = computed(() => {
  const slots = []
  if (useHalfHour.value) {
    for (let m = 0; m < 1440; m += 30) {
      const { hour, minute } = minutesToClock(m)
      slots.push({ key: m, label: formatTime(hour, minute) })
    }
    return slots
  }
  for (let h = 0; h < 24; h++) {
    const m = h * 60
    slots.push({ key: m, label: formatTime(h, 0) })
  }
  return slots
})

function getEventBySlotKey(slotKey) {
  return (
    scheduledEvents.value.find(
      (e) => (e.startSlotKey ?? (e.startHour * 60 + (e.startMinute || 0))) === slotKey
    ) || null
  )
}

async function addEventToSlot(mod, slotKey) {
  if (getEventBySlotKey(slotKey)) {
    showToast('该时间段已存在课程模块')
    return
  }
  if (hasApi()) {
    try {
      const created = await createScheduleEvent({
        date: dayIso.value,
        name: mod.name,
        startSlotKey: slotKey,
        duration: useHalfHour.value ? 0.5 : 1,
        color: mod.color || 'blue',
        status: null,
        location: null,
        description: null,
        moduleId: mod.id
      })
      scheduledEvents.value = [...scheduledEvents.value, created]
    } catch (e) {
      showToast(e?.message || '添加失败')
    }
    return
  }
  const { startMinutes, endMinutes, duration } = buildEventTiming(slotKey)
  const { hour: sh, minute: sm } = minutesToClock(startMinutes)
  const { hour: eh, minute: em } = minutesToClock(endMinutes)
  const newEvent = {
    id: nextEventId.value++,
    name: mod.name,
    startTime: formatTime(sh, sm),
    endTime: formatTime(eh, em),
    startHour: sh,
    startMinute: sm,
    startSlotKey: slotKey,
    duration,
    color: mod.color || 'blue',
    status: null,
    location: null,
    description: null,
    moduleId: mod.id
  }
  scheduledEvents.value = [...scheduledEvents.value, newEvent]
}

watch(
  () => useHalfHour.value,
  () => {
    // 切换刻度时，把 startSlotKey 重新对齐到当前刻度的“槽位起点”
    scheduledEvents.value = scheduledEvents.value.map((ev) => {
      const startMins = ev.startHour * 60 + (ev.startMinute || 0)
      const slotMins = useHalfHour.value ? startMins - (startMins % 30) : startMins - (startMins % 60)
      const durHours = useHalfHour.value
        ? (ev.duration && ev.duration < 1 ? ev.duration : 0.5)
        : (ev.duration && ev.duration < 1 ? 1 : (ev.duration || 1))
      const endMins = slotMins + durHours * 60
      const s = minutesToClock(slotMins)
      const e = minutesToClock(endMins)
      return {
        ...ev,
        startSlotKey: slotMins,
        startHour: s.hour,
        startMinute: s.minute,
        startTime: formatTime(s.hour, s.minute),
        endTime: formatTime(e.hour, e.minute),
        duration: durHours
      }
    })
    scrollToDefaultHour()
  }
)

function courseCardClass(color) {
  const map = {
    blue: 'course-card-blue',
    pink: 'course-card-pink',
    green: 'course-card-green',
    yellow: 'course-card-yellow',
    purple: 'course-card-purple'
  }
  return map[color] || map.blue
}

function courseTextClass(color) {
  const map = {
    blue: 'text-on-primary-container',
    pink: 'text-on-tertiary-container',
    green: 'text-on-secondary-container',
    yellow: 'text-amber-900',
    purple: 'text-purple-900'
  }
  return map[color] || map.blue
}

function moduleGridClass(color) {
  const map = {
    blue: 'bg-primary-container/40 border-primary-container/60 hover:bg-primary-container/60',
    pink: 'bg-tertiary-container/40 border-tertiary-container/60 hover:bg-tertiary-container/60',
    green: 'bg-secondary-container/40 border-secondary-container/60 hover:bg-secondary-container/60',
    yellow: 'bg-yellow-pastel/50 border-amber-400/40 hover:bg-yellow-pastel/80',
    purple: 'bg-purple-pastel/50 border-purple-400/40 hover:bg-purple-pastel/80'
  }
  return map[color] || map.blue
}

function eventCardClass(event) {
  const map = {
    blue: 'bg-primary-container border-primary',
    pink: 'bg-tertiary-container border-tertiary',
    green: 'bg-secondary-container border-secondary',
    yellow: 'bg-yellow-pastel border-amber-500',
    purple: 'bg-purple-pastel border-purple-500'
  }
  return map[event.color] || map.blue
}

function eventTextClass(event) {
  const map = {
    blue: 'text-on-primary-container',
    pink: 'text-on-tertiary-container',
    green: 'text-on-secondary-container',
    yellow: 'text-amber-900',
    purple: 'text-purple-900'
  }
  return map[event.color] || map.blue
}

function eventDotClass(event) {
  const map = {
    blue: 'bg-primary',
    pink: 'bg-tertiary',
    green: 'bg-secondary',
    yellow: 'bg-amber-600',
    purple: 'bg-purple-600'
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

async function addCourse(course) {
  if (hasApi()) {
    try {
      const created = await createCourseModule({
        name: course.name,
        color: course.color,
        category: 'Custom'
      })
      courseModules.value = [...courseModules.value, created]
    } catch (e) {
      showToast(e?.message || '添加失败')
      return
    }
  } else {
    courseModules.value.push({
      id: Date.now(),
      name: course.name,
      category: 'Custom',
      color: course.color
    })
  }
  showAddModal.value = false
}

async function deleteModule(moduleId) {
  if (hasApi()) {
    try {
      await deleteCourseModule(moduleId)
    } catch (e) {
      showToast(e?.message || '删除失败')
      return
    }
  }
  courseModules.value = courseModules.value.filter((m) => m.id !== moduleId)
  scheduledEvents.value = scheduledEvents.value.filter((ev) => ev.moduleId !== moduleId)
  if (selectedCourse.value?.moduleId === moduleId) {
    showDetail.value = false
    selectedCourse.value = null
  }
}

async function removeScheduledCourse(eventId) {
  if (hasApi()) {
    try {
      await deleteScheduleEvent(eventId)
    } catch (e) {
      showToast(e?.message || '删除失败')
      return
    }
  }
  scheduledEvents.value = scheduledEvents.value.filter((ev) => ev.id !== eventId)
  if (selectedCourse.value?.id === eventId) {
    showDetail.value = false
    selectedCourse.value = null
  }
}

function confirmDeleteModule(moduleId) {
  openConfirm({
    title: '删除课程模块？',
    message: '删除后将同步移除该模块在时间表中的课程。',
    action: () => deleteModule(moduleId)
  })
}

function confirmRemoveScheduledCourse(eventId) {
  openConfirm({
    title: '移出日程？',
    message: '仅删除该时间段中的课程安排。',
    action: () => removeScheduledCourse(eventId)
  })
}
</script>
