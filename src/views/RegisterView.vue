<template>
  <div class="min-h-[100dvh] flex flex-col bg-surface text-on-surface">
    <header
      class="sticky top-0 z-50 flex w-full items-center justify-between border-none bg-surface/80 px-5 py-4 backdrop-blur-md"
    >
      <button
        type="button"
        class="flex items-center gap-1 text-primary transition-opacity hover:opacity-70 active:scale-95"
        aria-label="返回"
        @click="goBack"
      >
        <span class="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>
      <h1 class="text-body-lg font-semibold text-on-surface">创建账户</h1>
      <div class="w-6 shrink-0" aria-hidden="true" />
    </header>

    <main class="mx-auto flex w-full max-w-lg flex-grow flex-col items-center justify-center px-5 py-8">
      <div
        class="mb-8 w-full overflow-hidden rounded-[32px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
      >
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB21jKVDDzo85PK03WFvZltHqx8beMOXm-jz_686uHhOMdtMvFXEx66HDgcKoDq3ekh70K8mlG9KT4tVfhu64qGV7r7iDdB5ynEFaZmDkbGrfdqdi9MD2DSK5woh2oFihYPwYWE6tBgtaZv1PsD4Ni3l7MhL_D0RAfyXdxAeeGXmbrpfzzwKasDfJM2AvEMvRSD24O7daizkPu_jYDbo1Y2kupTIKFBECtPN27D2Q6zGfuHfOhe_sRaIa0px0UnRjRtIP2MUTDtw8CC"
          alt="协作学习插画"
          class="max-h-64 w-full object-contain opacity-90"
        />
      </div>

      <div class="w-full space-y-6">
        <div class="mb-8 text-center">
          <h2 class="text-h1 text-on-surface">加入 CourseFlow</h2>
          <p class="mt-2 text-body-md text-on-surface-variant">轻松管理课程与日程，保持从容。</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div v-if="error" class="text-center text-label-sm text-error" role="alert">
            {{ error }}
          </div>

          <div class="space-y-1">
            <label class="ml-1 text-label-sm text-on-surface-variant" for="reg-username">用户名</label>
            <div class="group relative">
              <input
                id="reg-username"
                v-model="username"
                type="text"
                autocomplete="username"
                class="w-full rounded-[20px] border-none bg-surface-container-low py-4 pl-4 pr-12 text-body-lg outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container focus:ring-2 focus:ring-primary-container"
                placeholder="设置唯一用户名"
              />
              <span
                class="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary"
              >
                person
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <label class="ml-1 text-label-sm text-on-surface-variant" for="reg-password">密码</label>
            <div class="group relative">
              <input
                id="reg-password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                class="w-full rounded-[20px] border-none bg-surface-container-low py-4 pl-4 pr-12 text-body-lg outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container focus:ring-2 focus:ring-primary-container"
                placeholder="至少 8 位"
              />
              <span
                class="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary"
              >
                lock
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <label class="ml-1 text-label-sm text-on-surface-variant" for="reg-password2">确认密码</label>
            <div class="group relative">
              <input
                id="reg-password2"
                v-model="passwordConfirm"
                type="password"
                autocomplete="new-password"
                class="w-full rounded-[20px] border-none bg-surface-container-low py-4 pl-4 pr-12 text-body-lg outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container focus:ring-2 focus:ring-primary-container"
                placeholder="再次输入密码"
              />
              <span
                class="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary"
              >
                lock_reset
              </span>
            </div>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              class="w-full rounded-full bg-primary py-4 text-h3 text-on-primary shadow-[0_4px_12px_rgba(46,99,133,0.2)] transition-all hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:opacity-50"
              :disabled="submitting"
            >
              {{ submitting ? '注册中…' : '注册' }}
            </button>
          </div>
        </form>

        <div class="pt-6 text-center">
          <RouterLink
            to="/login"
            class="text-body-md font-semibold text-primary transition-opacity hover:opacity-70"
          >
            已有账号？去登录
          </RouterLink>
        </div>

        <div class="mt-8 flex justify-center gap-3 opacity-30 pointer-events-none">
          <div class="h-12 w-12 rounded-full bg-primary-container blur-sm" />
          <div class="h-16 w-16 translate-y-4 rounded-full bg-secondary-container blur-sm" />
          <div class="h-10 w-10 rounded-full bg-tertiary-container blur-sm" />
        </div>
      </div>
    </main>

    <footer class="mt-auto px-5 pb-8 text-center">
      <p class="text-label-xs text-outline-variant">
        注册即表示你同意服务条款与隐私政策（由后端/运营侧最终文案为准）。
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerWithPassword } from '../services/authService'
import { isLoggedIn } from '../utils/auth.js'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const submitting = ref(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.replace('/login')
  }
}

async function handleSubmit() {
  error.value = ''
  const u = username.value.trim()
  if (!u || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }
  if (password.value.length < 8) {
    error.value = '密码至少 8 位'
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  submitting.value = true
  try {
    const result = await registerWithPassword(u, password.value)
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect ? route.query.redirect : '/'
    if (result.autoLogin || isLoggedIn()) {
      await router.replace(redirect || '/')
    } else {
      await router.replace({ path: '/login', query: { registered: '1' } })
    }
  } catch (e) {
    error.value = e?.message || '注册失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>
