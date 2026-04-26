<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>
    </transition>

    <!-- 抽屉 -->
    <transition name="drawer">
      <div
        v-if="visible"
        class="fixed bottom-0 left-0 right-0 z-[70] flex justify-center"
      >
        <div class="w-full max-w-md bg-white rounded-t-[32px] shadow-soft-2 border-t border-white/40 flex flex-col max-h-[85vh]">
          <!-- 拖拽手柄 -->
          <div class="flex justify-center pt-4 pb-1">
            <div class="w-10 h-1.5 bg-surface-container-highest rounded-full"></div>
          </div>

          <!-- 内容 -->
          <div class="px-5 pb-8 overflow-y-auto">
            <!-- 头部 -->
            <div class="flex justify-between items-start py-4">
              <div>
                <h2 class="text-h1 text-on-surface">{{ course?.name || '钢琴' }} (Piano)</h2>
                <div class="flex items-center gap-1 mt-1 text-on-surface-variant">
                  <span class="material-symbols-outlined text-xl">schedule</span>
                  <span class="text-body-lg">{{ course?.startTime || '10:00' }} - {{ course?.endTime || '11:30' }}</span>
                </div>
              </div>
              <button
                class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline active:scale-90 transition-all"
                @click="$emit('close')"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- 课程图片 -->
            <div class="relative w-full h-32 rounded-2xl overflow-hidden mb-6">
              <img
                src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=200&fit=crop"
                alt="Piano keys"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <!-- 提醒设置 -->
            <div class="mb-6">
              <label class="text-label-sm text-on-surface-variant flex items-center gap-1 ml-1 mb-2">
                <span class="material-symbols-outlined text-base">notifications</span>
                提醒设置
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="option in reminderOptions"
                  :key="option.value"
                  class="flex items-center justify-center py-4 rounded-xl transition-all active:scale-95"
                  :class="selectedReminder === option.value
                    ? 'bg-primary-container/50 border-2 border-primary/20 text-h3 text-primary'
                    : 'bg-surface-container-high border border-outline-variant/30 text-body-md text-on-surface-variant hover:bg-primary-container/20'"
                  @click="selectedReminder = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- 课程备注 -->
            <div class="mb-8">
              <label class="text-label-sm text-on-surface-variant flex items-center gap-1 ml-1 mb-2">
                <span class="material-symbols-outlined text-base">notes</span>
                课程备注
              </label>
              <textarea
                v-model="notes"
                class="w-full min-h-[100px] bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary-container p-4 text-body-md placeholder:text-outline/60 text-on-surface resize-none outline-none"
                placeholder="记录课程重点，如：带琴谱"
              ></textarea>
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-col gap-4">
              <button
                class="w-full py-4 bg-primary text-on-primary text-h3 rounded-full shadow-lg active:scale-[0.98] transition-all"
                @click="$emit('close')"
              >
                保存设置
              </button>
              <button
                class="w-full py-4 text-error text-h3 rounded-full hover:bg-error-container/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                @click="removeCourse"
              >
                <span class="material-symbols-outlined">delete_outline</span>
                移出日程
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: Boolean,
  course: Object
})

const emit = defineEmits(['close', 'remove'])

const reminderOptions = [
  { label: '不提醒', value: 0 },
  { label: '提前 5 分钟', value: 5 },
  { label: '提前 10 分钟', value: 10 },
  { label: '提前 30 分钟', value: 30 }
]

const selectedReminder = ref(10)
const notes = ref('')

function removeCourse() {
  if (!props.course?.id) return
  emit('remove', props.course.id)
  emit('close')
}
</script>
