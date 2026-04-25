<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[60] backdrop-blur-xl bg-surface/70"
        @click="$emit('close')"
      ></div>
    </transition>

    <!-- 弹窗 -->
    <transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[70] flex items-center justify-center p-6"
      >
        <div class="w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-white">
          <div class="p-8">
            <!-- 标题 -->
            <div class="mb-8">
              <h2 class="text-h2 text-on-surface text-center">新增课程模块</h2>
              <p class="text-body-md text-outline text-center mt-1">为您的日程添加一个新的活动</p>
            </div>

            <!-- 输入区域 -->
            <div class="flex flex-col gap-6">
              <!-- 课程名称 -->
              <div class="flex flex-col gap-2">
                <label class="text-label-sm text-outline ml-1">课程名称</label>
                <input
                  v-model="courseName"
                  type="text"
                  class="w-full h-14 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
                  placeholder="请输入课程名称 (如：钢琴)"
                />
              </div>

              <!-- 背景颜色 -->
              <div class="flex flex-col gap-3">
                <label class="text-label-sm text-outline ml-1">背景颜色</label>
                <div class="flex justify-between items-center px-2">
                  <button
                    class="w-10 h-10 rounded-full bg-primary-container ring-offset-2 transition-transform active:scale-90"
                    :class="selectedColor === 'blue' ? 'ring-2 ring-primary' : ''"
                    @click="selectedColor = 'blue'"
                  ></button>
                  <button
                    class="w-10 h-10 rounded-full bg-tertiary-container ring-offset-2 transition-transform active:scale-90"
                    :class="selectedColor === 'pink' ? 'ring-2 ring-tertiary' : ''"
                    @click="selectedColor = 'pink'"
                  ></button>
                  <button
                    class="w-10 h-10 rounded-full bg-secondary-container ring-offset-2 transition-transform active:scale-90"
                    :class="selectedColor === 'green' ? 'ring-2 ring-secondary' : ''"
                    @click="selectedColor = 'green'"
                  ></button>
                  <button
                    class="w-10 h-10 rounded-full bg-yellow-pastel ring-offset-2 transition-transform active:scale-90"
                    :class="selectedColor === 'yellow' ? 'ring-2 ring-amber-400' : ''"
                    @click="selectedColor = 'yellow'"
                  ></button>
                  <button
                    class="w-10 h-10 rounded-full bg-purple-pastel ring-offset-2 transition-transform active:scale-90"
                    :class="selectedColor === 'purple' ? 'ring-2 ring-purple-400' : ''"
                    @click="selectedColor = 'purple'"
                  ></button>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="mt-10 flex flex-col gap-3">
              <button
                class="w-full h-14 bg-primary text-white text-h3 rounded-full shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
                @click="handleSave"
              >
                保存
              </button>
              <button
                class="w-full h-12 text-outline text-body-lg rounded-full hover:bg-surface-container transition-colors active:scale-[0.98]"
                @click="$emit('close')"
              >
                取消
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

defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'save'])

const courseName = ref('')
const selectedColor = ref('blue')

const colorOptions = [
  { value: 'blue', label: 'Blue', bgClass: 'bg-primary-container', ringClass: 'ring-primary' },
  { value: 'pink', label: 'Pink', bgClass: 'bg-tertiary-container', ringClass: 'ring-tertiary' },
  { value: 'green', label: 'Green', bgClass: 'bg-secondary-container', ringClass: 'ring-secondary' },
  { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-pastel', ringClass: 'ring-yellow-400/30' },
  { value: 'purple', label: 'Purple', bgClass: 'bg-purple-pastel', ringClass: 'ring-purple-400/30' }
]

function handleSave() {
  if (!courseName.value.trim()) return
  emit('save', {
    name: courseName.value.trim(),
    color: selectedColor.value
  })
  courseName.value = ''
  selectedColor.value = 'blue'
}
</script>
