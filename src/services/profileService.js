import { get, post, del } from '../utils/request.js'

const KEY = 'demo_front_profile_v1'

const WHITELIST_APP_META_BY_EMAIL = {
  // 示例：与 `screen.png` 保持一致
  'sarah.j@university.edu': {
    appName: 'Canvas LMS',
    appType: 'Educational Tool',
    icon: 'auto_stories',
    iconBgClass: 'bg-secondary-container/30',
    iconTextClass: 'text-on-secondary-container'
  },
  // Demo mock
  'demo@example.com': {
    appName: 'Canvas LMS',
    appType: 'Educational Tool',
    icon: 'auto_stories',
    iconBgClass: 'bg-secondary-container/30',
    iconTextClass: 'text-on-secondary-container'
  },
  'student@example.com': {
    appName: 'Discord 学习小组',
    appType: 'Communication',
    icon: 'forum',
    iconBgClass: 'bg-tertiary-container/30',
    iconTextClass: 'text-on-tertiary-container'
  }
}

function hasBase() {
  return Boolean(import.meta.env.VITE_API_BASE_URL)
}

function loadMockProfile() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  const init = {
    user: {
      id: 1,
      username: 'Sarah Jenkins',
      email: 'sarah.j@university.edu',
      role: '计算机科学专业大四学生',
      avatarUrl: ''
    },
    emailAccount: {
      id: 1,
      userId: 1,
      imapHost: 'imap.163.com',
      imapPort: 993,
      username: 'sarah.j@university.edu',
      folder: 'INBOX',
      timeoutSeconds: 15,
      timezone: 'Asia/Shanghai',
      defaultColor: 'pink',
      defaultIcon: 'mail',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    emailWhitelist: [
      { id: 1, email: 'sarah.j@university.edu' },
      { id: 2, email: 'student@example.com' }
    ]
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(init))
  } catch {
    /* ignore */
  }
  return init
}

function saveMockProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
}

function normalizeEmail(s) {
  return typeof s === 'string' ? s.trim().toLowerCase() : ''
}

function getAppMetaFromWhitelistEmail(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return {
      appName: 'Unknown',
      appType: 'Whitelisted',
      icon: 'auto_stories',
      iconBgClass: 'bg-surface-container-high/30',
      iconTextClass: 'text-on-surface-variant'
    }
  }

  const known = WHITELIST_APP_META_BY_EMAIL[normalizedEmail]
  if (known) return known

  // 兜底：用邮箱前缀做展示名（避免空白）
  const local = normalizedEmail.split('@')[0] || normalizedEmail
  const prettyLocal = local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    appName: prettyLocal,
    appType: 'Whitelisted',
    icon: 'auto_stories',
    iconBgClass: 'bg-surface-container-high/30',
    iconTextClass: 'text-on-surface-variant'
  }
}

function normalizeEmailAccount(account) {
  if (!account || typeof account !== 'object') return null
  return {
    id: account.id ?? account._id ?? null,
    userId: account.userId ?? account.user_id ?? null,
    imapHost: account.imapHost ?? account.imap_host ?? '',
    imapPort: Number(account.imapPort ?? account.imap_port ?? 993),
    username: account.username ?? account.email ?? '',
    folder: account.folder ?? 'INBOX',
    timeoutSeconds: Number(account.timeoutSeconds ?? account.timeout_seconds ?? 15),
    timezone: account.timezone ?? 'Asia/Shanghai',
    defaultColor: account.defaultColor ?? 'pink',
    defaultIcon: account.defaultIcon ?? 'mail',
    createdAt: account.createdAt ?? null,
    updatedAt: account.updatedAt ?? null
  }
}

function normalizeProfile(payload) {
  if (!payload || typeof payload !== 'object') return loadMockProfile()

  const user = payload.user || payload.account || payload.data?.user || payload.data
  const emailAccount = normalizeEmailAccount(payload.emailAccount ?? payload.data?.emailAccount ?? payload.bindEmail)
  const emailWhitelistRaw =
    payload.emailWhitelist ||
    payload.whitelist ||
    payload.email_white_list ||
    payload.data?.emailWhitelist ||
    payload.data?.whitelist ||
    []

  const normalizedWhitelist = Array.isArray(emailWhitelistRaw)
    ? emailWhitelistRaw
        .map((x, idx) => {
          const email = x?.email ?? x?.address ?? x?.value ?? (typeof x === 'string' ? x : '')
          if (!email) return null
          const extra = x && typeof x === 'object' ? x : {}
          return { id: x?.id ?? idx + 1, email, ...extra }
        })
        .filter(Boolean)
    : []

  const normalizedUser = {
    id: user?.id ?? user?._id ?? user?.userId ?? 1,
    username: user?.username ?? user?.name ?? 'user',
    email: user?.email ?? null,
    role: user?.role ?? user?.major ?? user?.studyRole ?? '',
    avatarUrl: user?.avatarUrl ?? user?.avatar ?? user?.picture ?? ''
  }

  const mappedWhitelist = normalizedWhitelist.map((w) => {
    const meta = getAppMetaFromWhitelistEmail(w.email)
    return {
      ...w,
      appName: w.appName ?? w.name ?? w.title ?? meta.appName,
      appType: w.appType ?? w.type ?? w.category ?? meta.appType,
      icon: w.icon ?? meta.icon,
      iconBgClass: w.iconBgClass ?? meta.iconBgClass,
      iconTextClass: w.iconTextClass ?? meta.iconTextClass
    }
  })

  return {
    user: normalizedUser,
    emailAccount,
    emailWhitelist: mappedWhitelist
  }
}

export async function fetchProfile() {
  if (!hasBase()) return normalizeProfile(loadMockProfile())

  // 1) 用户信息（头像/姓名/角色等，profile header 使用）
  let userPayload = null
  try {
    const data = await get('/api/auth/me')
    userPayload =
      data?.user ?? data?.account ?? data?.data?.user ?? data?.data ?? data ?? null
  } catch {
    userPayload = null
  }
  if (!userPayload) {
    userPayload = loadMockProfile().user
  }

  // 2) IMAP 绑定信息（绑定邮箱/服务器参数）
  let emailAccount = null
  try {
    const accountData = await get('/api/homework/bind-email')
    emailAccount = accountData
  } catch (e) {
    if (e?.status === 404) {
      emailAccount = null
    } else {
      throw e
    }
  }

  // 3) 邮箱白名单
  const whitelistData = await get('/api/homework/email-whitelist')

  const combined = {
    user: userPayload,
    emailAccount,
    emailWhitelist: Array.isArray(whitelistData) ? whitelistData : []
  }

  const out = normalizeProfile(combined)

  // 用绑定的 username 作为页面“当前邮箱”来源（后端统一口径通常是 email/username）
  if (out.emailAccount?.username) {
    out.user.email = out.emailAccount.username
  }

  return out
}

export async function bindEmail(imapPayload) {
  const payload = imapPayload && typeof imapPayload === 'object' ? imapPayload : null

  if (!hasBase()) {
    const p = loadMockProfile()
    const username = payload?.username || ''
    p.user.email = username
    p.emailAccount = {
      ...(p.emailAccount || {}),
      imapHost: payload?.imapHost || p.emailAccount?.imapHost || '',
      imapPort: Number(payload?.imapPort ?? p.emailAccount?.imapPort ?? 993),
      username,
      folder: payload?.folder ?? p.emailAccount?.folder ?? 'INBOX',
      timeoutSeconds:
        Number(payload?.timeoutSeconds ?? p.emailAccount?.timeoutSeconds ?? 15),
      timezone: payload?.timezone ?? p.emailAccount?.timezone ?? 'Asia/Shanghai',
      defaultColor: payload?.defaultColor ?? p.emailAccount?.defaultColor ?? 'pink',
      defaultIcon: payload?.defaultIcon ?? p.emailAccount?.defaultIcon ?? 'mail',
      updatedAt: new Date().toISOString()
    }
    // demo 模式：把绑定邮箱加入白名单（避免演示空状态）
    if (username) {
      const exists = p.emailWhitelist.some((x) => x.email === username)
      if (!exists) {
        p.emailWhitelist = [...p.emailWhitelist, { id: Date.now(), email: username }]
      }
    }
    saveMockProfile(p)
    return
  }

  // 接口：POST /api/homework/bind-email
  await post('/api/homework/bind-email', payload)
}

export async function addEmailToWhitelist(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return

  if (!hasBase()) {
    const p = loadMockProfile()
    const exists = p.emailWhitelist.some((x) => normalizeEmail(x.email) === normalizedEmail)
    if (!exists) {
      p.emailWhitelist = [...p.emailWhitelist, { id: Date.now(), email: normalizedEmail }]
      saveMockProfile(p)
    }
    return
  }

  // 覆盖式保存：需要把“全量 emails”提交给后端
  const current = await get('/api/homework/email-whitelist')
  const list = Array.isArray(current) ? current : []
  const set = new Set(list.map((x) => normalizeEmail(x.email)).filter(Boolean))
  set.add(normalizedEmail)
  await post('/api/homework/email-whitelist', { emails: Array.from(set) })
}

export async function deleteEmailFromWhitelist(whitelistId) {
  if (!hasBase()) {
    const p = loadMockProfile()
    p.emailWhitelist = p.emailWhitelist.filter((x) => String(x.id) !== String(whitelistId))
    saveMockProfile(p)
    return
  }

  // 覆盖式保存：先拉取当前白名单，再删除对应项并提交全量 emails
  const current = await get('/api/homework/email-whitelist')
  const list = Array.isArray(current) ? current : []
  const targetId = String(whitelistId)
  const next = list.filter((x) => String(x.id) !== targetId)
  const emails = next.map((x) => normalizeEmail(x.email)).filter(Boolean)
  await post('/api/homework/email-whitelist', { emails })
}

export async function triggerTodayEmailSync() {
  if (!hasBase()) return []
  const data = await get('/api/homework/from-email')
  return Array.isArray(data) ? data : []
}

