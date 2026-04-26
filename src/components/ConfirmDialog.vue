<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
        @click="$emit('cancel')"
      ></div>
    </transition>

    <transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-[90] flex items-center justify-center p-6">
        <div class="w-full max-w-sm bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.16)] border border-white overflow-hidden">
          <div class="p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-h3 text-on-surface">{{ title }}</h3>
                <p v-if="message" class="text-body-md text-on-surface-variant mt-1">{{ message }}</p>
              </div>
              <button
                class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline active:scale-95 transition-all"
                @click="$emit('cancel')"
                aria-label="关闭"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="mt-6 flex gap-3">
              <button
                class="flex-1 h-12 rounded-full bg-surface-container-low text-on-surface text-body-lg active:scale-[0.98] transition-all"
                @click="$emit('cancel')"
              >
                {{ cancelText }}
              </button>
              <button
                class="flex-1 h-12 rounded-full text-white text-body-lg shadow-lg active:scale-[0.98] transition-all"
                :class="danger ? 'bg-error' : 'bg-primary'"
                @click="$emit('confirm')"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: Boolean,
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: true }
})

defineEmits(['confirm', 'cancel'])
</script>

