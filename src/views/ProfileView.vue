<template>
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

  <div class="px-5 py-6 space-y-6">
    <div
      v-if="toast"
      class="fixed top-20 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-full bg-error text-on-error text-label-sm shadow-soft-2"
      role="status"
    >
      {{ toast }}
    </div>

    <!-- Email Section -->
      <section
        class="bg-surface-container-lowest p-6 rounded-[24px] shadow-soft-2 space-y-5 border border-white/50"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-h3 text-on-surface">邮箱绑定</h3>
        </div>

        <div v-if="profile.emailAccount?.username && !editingEmail" class="space-y-4">
          <div>
            <label class="block text-label-sm text-outline mb-1 ml-1">当前邮箱</label>
            <div class="w-full bg-background p-4 rounded-xl text-on-surface-variant font-body-md border border-transparent">
              {{ profile.emailAccount.username }}
            </div>
            <div class="text-label-xs text-on-surface-variant mt-2 truncate ml-[5px]">
              IMAP：{{ profile.emailAccount.imapHost }}:{{ profile.emailAccount.imapPort }} / {{ profile.emailAccount.folder }}
            </div>
          </div>
          <button
            class="w-full bg-primary-container text-on-primary-container py-3 rounded-full text-h3 active:scale-95 transition-transform duration-200"
            type="button"
            @click="startEditEmail"
          >
            更新邮箱
          </button>
          <button
            class="w-full bg-surface-container-low text-outline py-3 rounded-full text-h3 active:scale-95 transition-transform duration-200"
            type="button"
            @click="handleSyncToday"
          >
            触发今日邮件同步
          </button>
        </div>

        <div v-else class="space-y-3">
          <label class="block text-label-sm text-outline ml-1" for="bind-email">邮箱地址</label>
          <input
            id="bind-email"
            v-model="bindForm.username"
            type="email"
            class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
            placeholder="name@example.com"
          />
          <label class="block text-label-sm text-outline ml-1" for="imap-host">IMAP 服务器</label>
          <input
            id="imap-host"
            v-model="bindForm.imapHost"
            type="text"
            class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
            placeholder="imap.163.com"
          />
          <label class="block text-label-sm text-outline ml-1" for="imap-port">IMAP 端口</label>
          <input
            id="imap-port"
            v-model="bindForm.imapPort"
            type="number"
            class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
            placeholder="993"
          />
          <label class="block text-label-sm text-outline ml-1" for="imap-password">IMAP 密码</label>
          <input
            id="imap-password"
            v-model="bindForm.password"
            type="password"
            class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
            placeholder="你的 IMAP 密码"
          />
          <button
            class="w-full bg-primary text-on-primary py-3 rounded-full text-h3 active:scale-[0.98] transition-all disabled:opacity-50"
            type="button"
            :disabled="binding"
            @click="handleBindEmail"
          >
            {{
              binding
                ? '处理中…'
                : profile.emailAccount?.username
                  ? '更新邮箱'
                  : '绑定邮箱'
            }}
          </button>
        </div>
      </section>

      <!-- Whitelist Section -->
      <section class="bg-surface-container-lowest p-6 rounded-[24px] shadow-soft-2 border border-white/50">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-h3 text-on-surface">应用白名单</h3>
          <button
            class="flex items-center gap-1 text-primary text-label-sm hover:bg-sky-50 px-3 py-2 rounded-full transition-colors active:scale-95"
            type="button"
            @click="toggleWhitelistInput"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            添加
          </button>
        </div>

        <div v-if="showWhitelistInput" class="mb-6">
          <div class="flex items-center gap-2">
            <input
              v-model="whitelistInput"
              type="email"
              class="flex-1 h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
              placeholder="输入邮箱加入白名单"
            />
            <button
              class="h-12 px-4 rounded-full bg-primary-container text-on-primary-container active:scale-[0.98] transition-all disabled:opacity-50"
              type="button"
              :disabled="adding"
              @click="handleAddWhitelist"
            >
              {{ adding ? '添加中…' : '添加' }}
            </button>
            <button
              class="h-12 px-3 rounded-full bg-surface-container-low text-on-surface-variant active:scale-[0.98] transition-all"
              type="button"
              @click="cancelAddWhitelist"
              :disabled="adding"
            >
              取消
            </button>
          </div>
        </div>

        <div v-if="profile.emailWhitelist?.length" class="space-y-3">
          <div
            v-for="w in profile.emailWhitelist"
            :key="w.id"
            class="flex items-center justify-between p-4 bg-background rounded-2xl hover:bg-white transition-colors"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  w.iconBgClass || 'bg-surface-container-high/30'
                ]"
              >
                <span :class="w.iconTextClass || 'text-on-surface-variant'" class="material-symbols-outlined">
                  {{ w.icon || 'auto_stories' }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="text-[15px] font-semibold text-on-surface truncate">
                  {{ w.appName || w.email }}
                </p>
                <p class="text-label-xs text-outline mt-1 truncate">
                  {{ w.appType || 'Whitelisted' }}
                </p>
              </div>
            </div>

            <button
              class="text-outline-variant hover:text-outline transition-colors active:scale-95"
              type="button"
              aria-label="移除"
              @click="confirmRemove(w)"
            >
              <span class="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        <div v-else class="text-label-sm text-on-surface-variant">暂无白名单，请点击“添加”。</div>
      </section>

      <!-- Logout -->
      <div class="pt-4 pb-8">
        <button
          class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-outline-variant text-outline text-h3 hover:bg-error-container/10 hover:border-error hover:text-error transition-all active:scale-95 duration-200"
          type="button"
          @click="handleLogout"
        >
          <span class="material-symbols-outlined">logout</span>
          退出登录
        </button>
      </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import {
  addEmailToWhitelist,
  bindEmail,
  deleteEmailFromWhitelist,
  fetchProfile,
  triggerTodayEmailSync
} from '../services/profileService.js'
import { clearToken } from '../utils/auth.js'

const router = useRouter()

const toast = ref('')

const profile = ref({
  user: { id: null, username: '', email: null, role: '', avatarUrl: '' },
  emailAccount: null,
  emailWhitelist: []
})

const bindForm = ref({
  username: '',
  password: '',
  imapHost: 'imap.163.com',
  imapPort: 993,
  folder: 'INBOX',
  timeoutSeconds: 15,
  timezone: 'Asia/Shanghai',
  defaultColor: 'pink',
  defaultIcon: 'mail'
})

const whitelistInput = ref('')
const editingEmail = ref(false)
const showWhitelistInput = ref(false)
const binding = ref(false)
const adding = ref(false)

const confirm = ref({
  visible: false,
  title: '确认删除？',
  message: '',
  action: null
})

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

function validateEmail(v) {
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function fillBindFormFromAccount(account) {
  const a = account || {}
  bindForm.value.username = a.username || ''
  bindForm.value.imapHost = a.imapHost || bindForm.value.imapHost
  bindForm.value.imapPort = a.imapPort || bindForm.value.imapPort
  bindForm.value.folder = a.folder || bindForm.value.folder
  bindForm.value.timeoutSeconds = a.timeoutSeconds || bindForm.value.timeoutSeconds
  bindForm.value.timezone = a.timezone || bindForm.value.timezone
  bindForm.value.defaultColor = a.defaultColor || bindForm.value.defaultColor
  bindForm.value.defaultIcon = a.defaultIcon || bindForm.value.defaultIcon
  bindForm.value.password = ''
}

function startEditEmail() {
  editingEmail.value = true
  fillBindFormFromAccount(profile.value.emailAccount)
}

function toggleWhitelistInput() {
  showWhitelistInput.value = true
}

function cancelAddWhitelist() {
  showWhitelistInput.value = false
  whitelistInput.value = ''
}

function confirmRemove(item) {
  const name = item?.appName || item?.email || '该项'
  openConfirm({
    title: '移出白名单？',
    message: `确定移除 ${name} 吗？`,
    action: async () => {
      await handleRemoveWhitelist(item.id)
    }
  })
}

async function load() {
  toast.value = ''
  try {
    const p = await fetchProfile()
    profile.value = p
    editingEmail.value = !p.emailAccount?.username
    fillBindFormFromAccount(p.emailAccount)
  } catch (e) {
    toast.value = e?.message || '加载个人信息失败'
  }
}

onMounted(() => {
  void load()
})

async function handleBindEmail() {
  const username = (bindForm.value.username || '').trim()
  if (!validateEmail(username)) {
    toast.value = '请输入有效邮箱地址'
    return
  }
  const imapHost = (bindForm.value.imapHost || '').trim()
  const password = (bindForm.value.password || '').trim()
  const imapPort = Number(bindForm.value.imapPort)

  if (!imapHost) {
    toast.value = '请输入 IMAP 服务器地址'
    return
  }
  if (!Number.isFinite(imapPort) || imapPort <= 0) {
    toast.value = '请输入有效 IMAP 端口'
    return
  }
  if (!password) {
    toast.value = '请输入 IMAP 密码'
    return
  }

  binding.value = true
  toast.value = ''
  try {
    await bindEmail({
      imapHost,
      imapPort,
      username,
      password,
      folder: bindForm.value.folder,
      timeoutSeconds: Number(bindForm.value.timeoutSeconds),
      timezone: bindForm.value.timezone,
      defaultColor: bindForm.value.defaultColor,
      defaultIcon: bindForm.value.defaultIcon
    })
    await load()
    editingEmail.value = false
    showWhitelistInput.value = false
  } catch (e) {
    toast.value = e?.message || '邮箱绑定失败'
  } finally {
    binding.value = false
  }
}

async function handleSyncToday() {
  toast.value = ''
  try {
    const list = await triggerTodayEmailSync()
    toast.value = `同步完成：解析到 ${list.length} 条邮件`
  } catch (e) {
    toast.value = e?.message || '同步失败'
  }
}

async function handleAddWhitelist() {
  const email = (whitelistInput.value || '').trim()
  if (!validateEmail(email)) {
    toast.value = '请输入有效邮箱地址'
    return
  }
  adding.value = true
  toast.value = ''
  try {
    await addEmailToWhitelist(email)
    await load()
    whitelistInput.value = ''
    showWhitelistInput.value = false
  } catch (e) {
    toast.value = e?.message || '添加白名单失败'
  } finally {
    adding.value = false
  }
}

async function handleRemoveWhitelist(id) {
  try {
    await deleteEmailFromWhitelist(id)
    await load()
  } catch (e) {
    toast.value = e?.message || '移除失败'
  }
}

function handleLogout() {
  clearToken()
  router.replace({ path: '/login' })
}
</script>

