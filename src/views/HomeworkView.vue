<template>
  <div class="px-5 py-6 space-y-8">
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

    <!-- Welcome -->
    <section class="space-y-1">
      <h2 class="text-h2 text-on-background">Assignments</h2>
      <p class="text-body-md text-on-surface-variant">Stay on track with your study goals.</p>
    </section>

    <!-- 作业列表（来自邮件/自定义） -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-h3 text-on-background">Homework</h2>
        <span class="text-label-sm text-primary">拖动到下方时间表</span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="hw in sortedHomework"
          :key="hw.id"
          draggable="true"
          class="p-4 rounded-[24px] border shadow-[0_4px_12px_0px_rgba(0,0,0,0.03)] flex flex-col justify-between h-44 cursor-grab active:cursor-grabbing transition-colors relative"
          :class="homeworkCardClass(hw)"
          @dragstart="onHomeworkDragStart($event, hw)"
          @dragend="onHomeworkDragEnd"
        >
          <button
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/55 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center active:scale-95 transition-colors hover:bg-white/70"
            @click.stop="confirmDeleteHomework(hw.id)"
            aria-label="删除作业"
          >
            <span class="material-symbols-outlined text-[18px] text-outline">close</span>
          </button>

          <div class="flex justify-between items-start pr-8">
            <div class="bg-white/60 w-fit p-2 rounded-xl">
              <span class="material-symbols-outlined" :class="homeworkIconClass(hw)">{{ hw.icon }}</span>
            </div>
            <div v-if="isDueSoon(hw)" class="bg-error text-on-error px-3 py-1 rounded-full text-label-xs">DUE SOON</div>
          </div>

          <div class="space-y-1">
            <h3 class="text-h3" :class="homeworkTextClass(hw)">{{ hw.title }}</h3>
            <p class="text-label-sm" :class="homeworkMetaClass(hw)">截止：{{ formatDue(hw.dueAt) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 日期控制器（与 Schedule 一致） -->
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

    <!-- 时间表（可放多个作业） -->
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

        <div ref="timelineScrollEl" class="overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing pb-14">
          <div class="flex pb-4" :style="{ minWidth: `${timelineMinWidth}px` }">
            <div
              v-for="slot in timeSlots"
              :key="slot.key"
              class="flex-shrink-0 border-l border-surface-container-highest/50 relative min-h-[320px]"
              :class="[slotWidthClass, slotPaddingClass]"
              :data-slot="String(slot.key)"
              @dragover.prevent="onSlotDragOver($event, slot.key)"
              @drop.prevent="onDropOnSlot($event, slot.key)"
            >
              <span class="text-label-sm text-on-surface-variant/60 block mb-3 whitespace-nowrap">{{ slot.label }}</span>

              <div class="flex flex-col gap-2">
                <div
                  v-for="item in (homeworkSchedule[slot.key] || [])"
                  :key="item._scheduleId"
                  class="rounded-[14px] px-2 py-2 border shadow-sm relative"
                  :class="scheduledItemClass(item)"
                >
                  <div class="text-[11px] font-semibold leading-tight line-clamp-2">
                    {{ item.title }}
                  </div>
                  <div class="mt-1 text-[10px] opacity-70">
                    截止 {{ formatDueShort(item.dueAt) }}
                  </div>
                </div>
              </div>

              <div v-if="dropTargetKey === slot.key" class="absolute inset-y-0 right-0 w-1 bg-primary/20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Tasks -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-h3 text-on-background">Quick Tasks</h2>
        <button
          class="w-10 h-10 rounded-full bg-primary-container/60 hover:bg-primary-container/80 text-primary flex items-center justify-center active:scale-95 transition-all"
          @click="showAddQuickTask = true"
          aria-label="新增 Quick Task"
        >
          <span class="material-symbols-outlined">add</span>
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="t in quickTasks"
          :key="t.id"
          class="flex items-center gap-3 pl-4 pr-9 pt-2.5 pb-3 bg-surface-container-low rounded-[16px] border border-transparent active:scale-[0.98] transition-all relative"
        >
          <div class="w-6 h-6 shrink-0 rounded-full border-2 border-primary-container flex items-center justify-center">
            <div class="w-3 h-3 rounded-full bg-primary-container"></div>
          </div>
          <div class="flex-1 min-w-0 pr-1">
            <p class="text-body-md font-semibold text-on-surface">{{ t.title }}</p>
            <p class="text-label-xs text-on-surface-variant uppercase tracking-wider">{{ t.category }}</p>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant shrink-0 text-[20px]">chevron_right</span>

          <button
            class="absolute top-1.5 right-1.5 z-[1] w-5 h-5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 shadow-sm flex items-center justify-center active:scale-95 transition-colors hover:bg-white/80"
            @click.stop="confirmDeleteQuickTask(t.id)"
            aria-label="删除 Quick Task"
          >
            <span class="material-symbols-outlined text-[14px] leading-none text-outline">close</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FAB -->
    <button
      class="fixed right-6 bottom-32 w-14 h-14 bg-primary text-white rounded-2xl shadow-[0_8px_16px_-4px_rgba(46,99,133,0.4)] flex items-center justify-center active:scale-90 transition-transform z-40"
      @click="showAddHomework = true"
    >
      <span class="material-symbols-outlined">add</span>
    </button>

    <AddHomeworkModal :visible="showAddHomework" @close="showAddHomework = false" @save="addCustomHomework" />
    <AddQuickTaskModal :visible="showAddQuickTask" @close="showAddQuickTask = false" @save="addQuickTask" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AddHomeworkModal from '../components/AddHomeworkModal.vue'
import AddQuickTaskModal from '../components/AddQuickTaskModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { fetchHomeworkFromEmail } from '../services/homeworkService'

const route = useRoute()
const router = useRouter()

function parseQueryDate(value) {
  if (typeof value !== 'string' || !value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

const currentDate = ref(parseQueryDate(route.query?.date) || new Date())
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
  router.push({ path: '/calendar', query: { date: iso, returnTo: '/homework' } })
}

const dropHint = ref('')
const dropTargetKey = ref(null)
const useHalfHour = ref(false)
const slotWidthClass = computed(() => (useHalfHour.value ? 'w-9' : 'w-[72px]'))
const slotPaddingClass = computed(() => (useHalfHour.value ? 'px-2' : 'px-3'))
const timelineMinWidth = computed(() => 1728)

const homework = ref([])
const showAddHomework = ref(false)
const showAddQuickTask = ref(false)
const timelineScrollEl = ref(null)

async function scrollToDefaultHour() {
  await nextTick()
  const root = timelineScrollEl.value
  if (!root) return
  const el = root.querySelector('[data-slot="480"]') // 08:00
  if (!el) return
  el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' })
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

const homeworkSchedule = ref({})
let nextScheduleId = 1

const DRAG_MIME = 'application/x-demo-homework'

const quickTasks = ref([
  { id: 'qt-1', title: 'Email professor about quiz', category: 'Communication' },
  { id: 'qt-2', title: 'Buy new calculator batteries', category: 'General' }
])

const confirm = ref({
  visible: false,
  title: '确认删除？',
  message: '',
  action: null
})

onMounted(async () => {
  homework.value = await fetchHomeworkFromEmail()
  scrollToDefaultHour()
})

watch(
  () => useHalfHour.value,
  () => {
    homeworkSchedule.value = {}
    scrollToDefaultHour()
  }
)

const sortedHomework = computed(() => {
  const list = [...homework.value]
  list.sort((a, b) => new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0))
  return list
})

function isDueSoon(hw) {
  if (!hw?.dueAt) return false
  const due = new Date(hw.dueAt).getTime()
  const now = Date.now()
  const diff = due - now
  return diff > 0 && diff <= 24 * 60 * 60 * 1000
}

function formatDue(iso) {
  if (!iso) return '未设置'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '未设置'
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

function formatDueShort(iso) {
  if (!iso) return '--'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--'
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mi}`
}

function minutesToClock(totalMinutes) {
  const m = ((totalMinutes % 1440) + 1440) % 1440
  return { hour: Math.floor(m / 60), minute: m % 60 }
}

function formatTime(hour, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function homeworkCardClass(hw) {
  if (isDueSoon(hw)) return 'bg-error-container/60 border-error-container/40'
  const map = {
    blue: 'bg-primary-container/30 border-primary-container/20',
    pink: 'bg-tertiary-container/30 border-tertiary-container/20',
    green: 'bg-secondary-container/30 border-secondary-container/20',
    yellow: 'bg-yellow-pastel/40 border-amber-400/20',
    purple: 'bg-purple-pastel/40 border-purple-400/20'
  }
  return map[hw.color] || map.blue
}

function homeworkTextClass(hw) {
  const map = {
    blue: 'text-on-primary-container',
    pink: 'text-on-tertiary-container',
    green: 'text-on-secondary-container',
    yellow: 'text-amber-900',
    purple: 'text-purple-900'
  }
  return map[hw.color] || map.blue
}

function homeworkMetaClass(hw) {
  if (isDueSoon(hw)) return 'text-on-error-container'
  return 'text-on-surface-variant'
}

function homeworkIconClass(hw) {
  const map = { blue: 'text-primary', pink: 'text-tertiary', green: 'text-secondary', yellow: 'text-amber-700', purple: 'text-purple-700' }
  return map[hw.color] || map.blue
}

function scheduledItemClass(item) {
  if (isDueSoon(item)) return 'bg-error-container/70 border-error-container/40'
  const map = {
    blue: 'bg-primary-container/40 border-primary-container/30',
    pink: 'bg-tertiary-container/40 border-tertiary-container/30',
    green: 'bg-secondary-container/40 border-secondary-container/30',
    yellow: 'bg-yellow-pastel/60 border-amber-400/20',
    purple: 'bg-purple-pastel/60 border-purple-400/20'
  }
  return map[item.color] || map.blue
}

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

function onHomeworkDragStart(e, hw) {
  dropHint.value = '将作业拖到下方对应时间段'
  try {
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(hw))
    e.dataTransfer.setData('text/plain', hw.title)
  } catch {
    /* ignore */
  }
  e.dataTransfer.effectAllowed = 'copy'
}

function onHomeworkDragEnd() {
  dropHint.value = ''
  dropTargetKey.value = null
}

function onSlotDragOver(e, slotKey) {
  e.dataTransfer.dropEffect = 'copy'
  dropTargetKey.value = slotKey
}

function onDropOnSlot(e, slotKey) {
  const raw = e.dataTransfer.getData(DRAG_MIME) || e.dataTransfer.getData('text/plain')
  if (!raw) {
    onHomeworkDragEnd()
    return
  }
  let hw
  try {
    hw = raw.startsWith('{') ? JSON.parse(raw) : { title: raw, color: 'blue', id: `tmp-${Date.now()}`, dueAt: null, icon: 'assignment' }
  } catch {
    onHomeworkDragEnd()
    return
  }
  if (!hw.title) {
    onHomeworkDragEnd()
    return
  }
  const entry = { ...hw, _scheduleId: `s-${nextScheduleId++}` }
  const existing = homeworkSchedule.value[slotKey] || []
  homeworkSchedule.value = { ...homeworkSchedule.value, [slotKey]: [...existing, entry] }
  onHomeworkDragEnd()
}

function addCustomHomework(payload) {
  const now = new Date().toISOString()
  const item = {
    id: `custom-${Date.now()}`,
    title: payload.title,
    course: null,
    receivedAt: now,
    dueAt: payload.dueAt,
    color: payload.color,
    icon: 'assignment'
  }
  homework.value = [item, ...homework.value]
  showAddHomework.value = false
}

function deleteHomework(id) {
  homework.value = homework.value.filter((x) => x.id !== id)
  const next = {}
  for (const [k, list] of Object.entries(homeworkSchedule.value)) {
    next[k] = (list || []).filter((x) => x.id !== id)
  }
  homeworkSchedule.value = next
}

function removeScheduled(slotKey, scheduleId) {
  const list = homeworkSchedule.value[slotKey] || []
  homeworkSchedule.value = { ...homeworkSchedule.value, [slotKey]: list.filter((x) => x._scheduleId !== scheduleId) }
}

function deleteQuickTask(id) {
  quickTasks.value = quickTasks.value.filter((x) => x.id !== id)
}

function addQuickTask(payload) {
  quickTasks.value = [{ id: `qt-${Date.now()}`, title: payload.title, category: payload.category }, ...quickTasks.value]
  showAddQuickTask.value = false
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

function confirmDeleteHomework(id) {
  openConfirm({
    title: '删除作业？',
    message: '删除后将从列表和时间表中移除。',
    action: () => deleteHomework(id)
  })
}

function confirmRemoveScheduled(hour, scheduleId) {
  openConfirm({
    title: '删除该条安排？',
    message: '仅删除该时间段中的这一条作业安排。',
    action: () => removeScheduled(hour, scheduleId)
  })
}

function confirmDeleteQuickTask(id) {
  openConfirm({
    title: '删除 Quick Task？',
    message: '删除后不可恢复。',
    action: () => deleteQuickTask(id)
  })
}
</script>

