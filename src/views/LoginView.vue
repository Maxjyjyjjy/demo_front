<template>
  <div class="min-h-[calc(100dvh-0px)] px-5 py-10 flex items-center justify-center">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-primary-container/40 border border-primary-container/30 shadow-sm mb-4">
          <span class="material-symbols-outlined text-3xl text-primary">calendar_today</span>
        </div>
        <h1 class="text-h1 text-on-surface">欢迎回来</h1>
        <p class="text-body-md text-on-surface-variant mt-2">登录以同步你的课程与作业</p>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-[0_20px_60px_rgba(46,99,133,0.12)] p-6">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div v-if="error" class="text-label-sm text-error text-center -mt-1">
            {{ error }}
          </div>

          <div class="space-y-2">
            <label class="text-label-sm text-on-surface-variant ml-1">用户名</label>
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              class="w-full h-14 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
              placeholder="例如：hp"
            />
          </div>

          <div class="space-y-2">
            <label class="text-label-sm text-on-surface-variant ml-1">密码</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full h-14 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
              placeholder="至少 1 个字符"
            />
          </div>

          <button
            class="w-full h-14 bg-primary text-on-primary text-h3 rounded-full shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            :disabled="submitting"
            type="submit"
          >
            {{ submitting ? '登录中…' : '登录' }}
          </button>

          <p v-if="!useBackend" class="text-label-sm text-on-surface-variant text-center">
            未配置接口地址时为演示：任意非空账号密码即可登录
          </p>
          <p v-else class="text-label-sm text-on-surface-variant text-center">
            请使用后台账号密码登录（如 demo / demo123）
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithPassword } from '../services/authService'

const route = useRoute()
const router = useRouter()
const useBackend = Boolean(import.meta.env.VITE_API_BASE_URL)

const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!username.value.trim() || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  submitting.value = true
  try {
    await loginWithPassword(username.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect || '/')
  } catch (e) {
    error.value = e?.message || '登录失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>
