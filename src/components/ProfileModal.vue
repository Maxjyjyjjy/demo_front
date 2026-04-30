<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>
    </transition>

    <transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-[90] flex items-center justify-center p-6">
        <div class="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.16)] border border-white overflow-hidden">
          <div class="p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-h3 text-on-surface">个人中心</h3>
                <p class="text-body-md text-on-surface-variant mt-1">账号信息、邮箱绑定与白名单管理</p>
              </div>
              <button
                class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline active:scale-95 transition-all"
                @click="$emit('close')"
                aria-label="关闭"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div v-if="toast" class="mt-4 text-label-sm text-error text-center" role="status">
              {{ toast }}
            </div>

            <div v-if="loading" class="mt-6 space-y-4">
              <div class="h-10 rounded-2xl bg-surface-container-low animate-pulse"></div>
              <div class="h-10 rounded-2xl bg-surface-container-low animate-pulse"></div>
              <div class="h-28 rounded-2xl bg-surface-container-low animate-pulse"></div>
            </div>

            <div v-else class="mt-6 space-y-6">
              <!-- Account -->
              <section class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-primary-container/60 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined">account_circle</span>
                  </div>
                  <div class="min-w-0">
                    <div class="text-body-md font-semibold truncate">{{ profile.user?.username || '用户' }}</div>
                    <div class="text-label-sm text-on-surface-variant mt-1 truncate">
                      UID：{{ profile.user?.id ?? '-' }}
                    </div>
                  </div>
                </div>
              </section>

              <!-- Email bind -->
              <section class="space-y-3">
                <h4 class="text-body-md font-semibold text-on-surface">邮箱绑定</h4>
                <div
                  v-if="profile.emailAccount?.username && !editingEmail"
                  class="space-y-4"
                >
                  <div class="min-w-0">
                    <div class="text-body-md truncate">{{ profile.emailAccount.username }}</div>
                    <div class="text-label-sm text-on-surface-variant mt-1">已绑定</div>
                    <div class="text-label-xs text-on-surface-variant mt-2 truncate">
                      IMAP：{{ profile.emailAccount.imapHost }}:{{ profile.emailAccount.imapPort }} / {{ profile.emailAccount.folder }}
                    </div>
                  </div>
                  <button
                    class="h-10 px-4 rounded-full bg-surface-container-low text-on-surface active:scale-95 transition-all"
                    type="button"
                    @click="startEditEmail"
                  >
                    重新填写
                  </button>

                  <button
                    class="h-10 px-4 rounded-full bg-primary-container text-on-primary-container active:scale-95 transition-all disabled:opacity-50"
                    type="button"
                    @click="handleSyncToday"
                  >
                    触发今日邮件同步
                  </button>
                </div>

                <div v-else class="space-y-3">
                  <label class="text-label-sm text-on-surface-variant ml-1" for="bind-email">邮箱地址</label>
                  <input
                    id="bind-email"
                    v-model="bindForm.username"
                    type="email"
                    class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
                    placeholder="name@example.com"
                  />

                  <label class="text-label-sm text-on-surface-variant ml-1" for="imap-host">IMAP 服务器</label>
                  <input
                    id="imap-host"
                    v-model="bindForm.imapHost"
                    type="text"
                    class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
                    placeholder="imap.163.com"
                  />

                  <label class="text-label-sm text-on-surface-variant ml-1" for="imap-port">IMAP 端口</label>
                  <input
                    id="imap-port"
                    v-model="bindForm.imapPort"
                    type="number"
                    class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
                    placeholder="993"
                  />

                  <label class="text-label-sm text-on-surface-variant ml-1" for="imap-password">IMAP 密码</label>
                  <input
                    id="imap-password"
                    v-model="bindForm.password"
                    type="password"
                    class="w-full h-12 px-5 bg-surface-container-low border-none rounded-2xl text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all outline-none"
                    placeholder="你的 IMAP 密码"
                  />
                </div>

                <div class="flex items-center gap-3">
                  <button
                    class="flex-1 h-12 rounded-full bg-primary text-on-primary text-body-lg active:scale-[0.98] transition-all disabled:opacity-50"
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

              <!-- Whitelist -->
              <section class="space-y-3">
                <h4 class="text-body-md font-semibold text-on-surface">应用白名单</h4>

                <div class="space-y-2">
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
                  </div>

                  <div v-if="profile.emailWhitelist?.length" class="space-y-2">
                    <div
                      v-for="w in profile.emailWhitelist"
                      :key="w.id"
                      class="flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] bg-surface-container-low border border-transparent"
                    >
                      <div class="min-w-0">
                        <div class="text-body-md truncate">{{ w.appName || w.email }}</div>
                        <div class="text-label-xs text-on-surface-variant mt-1 truncate">{{ w.appType || 'Whitelisted' }}</div>
                      </div>
                      <button
                        class="w-9 h-9 rounded-full bg-surface-container text-outline active:scale-95 transition-all"
                        type="button"
                        aria-label="移除"
                        @click="confirmRemove(w)"
                      >
                        <span class="material-symbols-outlined">delete_outline</span>
                      </button>
                    </div>
                  </div>
                  <div v-else class="text-label-sm text-on-surface-variant">暂无白名单，请添加。</div>
                </div>
              </section>
            </div>

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
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import {
  addEmailToWhitelist,
  bindEmail,
  deleteEmailFromWhitelist,
  fetchProfile,
  triggerTodayEmailSync
} from '../services/profileService.js'

const props = defineProps({
  visible: Boolean
})

defineEmits(['close'])

const loading = ref(false)
const toast = ref('')
const profile = ref({
  user: { id: null, username: '', email: null },
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

const editingEmail = ref(false)
const whitelistInput = ref('')
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

function confirmRemove(item) {
  openConfirm({
    title: '移出白名单？',
    message: `确定移除 ${item.appName || item.email} 吗？`,
    action: async () => {
      await handleRemoveWhitelist(item.id)
    }
  })
}

async function load() {
  loading.value = true
  toast.value = ''
  try {
    const p = await fetchProfile()
    profile.value = p
    editingEmail.value = !p.emailAccount?.username
    fillBindFormFromAccount(p.emailAccount)
  } catch (e) {
    toast.value = e?.message || '加载个人信息失败'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (v) => {
    if (!v) return
    void load()
  }
)

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
    const p = await fetchProfile()
    profile.value = p
    editingEmail.value = !p.emailAccount?.username
    fillBindFormFromAccount(p.emailAccount)
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
    const p = await fetchProfile()
    profile.value = p
    whitelistInput.value = ''
  } catch (e) {
    toast.value = e?.message || '添加白名单失败'
  } finally {
    adding.value = false
  }
}

async function handleRemoveWhitelist(id) {
  try {
    await deleteEmailFromWhitelist(id)
    const p = await fetchProfile()
    profile.value = p
  } catch (e) {
    toast.value = e?.message || '移除失败'
  }
}

</script>

