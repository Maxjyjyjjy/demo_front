<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-[60] backdrop-blur-xl bg-surface/70" @click="$emit('close')"></div>
    </transition>

    <transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-[70] flex items-center justify-center p-6">
        <div class="w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-white">
          <div class="p-8">
            <div class="mb-8">
              <h2 class="text-h2 text-on-surface text-center">新增 Quick Task</h2>
              <p class="text-body-md text-outline text-center mt-1">添加一个快速待办</p>
            </div>

            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-label-sm text-outline ml-1">标题</label>
                <input
                  v-model="title"
                  type="text"
                  class="w-full h-14 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
                  placeholder="例如：发邮件给老师"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-label-sm text-outline ml-1">分类</label>
                <input
                  v-model="category"
                  type="text"
                  class="w-full h-14 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
                  placeholder="例如：Communication"
                />
              </div>
            </div>

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
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'save'])

const title = ref('')
const category = ref('')

watch(
  () => props.visible,
  (v) => {
    if (!v) return
    title.value = ''
    category.value = ''
  }
)

function handleSave() {
  if (!title.value.trim()) return
  emit('save', {
    title: title.value.trim(),
    category: (category.value || 'General').trim()
  })
}
</script>

