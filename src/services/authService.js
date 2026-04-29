import { post } from '../utils/request.js'
import { setToken } from '../utils/auth.js'

function pickToken(payload) {
  if (!payload || typeof payload !== 'object') return null
  const t =
    payload.token ??
    payload.accessToken ??
    payload.access_token ??
    payload.data?.token
  return typeof t === 'string' && t ? t : null
}

/**
 * 注册。与登录相同：若 `data` 内含 token 则自动登录；否则由调用方跳转登录页。
 * 未配置 VITE_API_BASE_URL 时：演示写入 token 并视为 autoLogin。
 */
export async function registerWithPassword(username, password) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    setToken('demo')
    return { mock: true, autoLogin: true }
  }

  const res = await post(
    '/api/auth/register',
    { username, password },
    { auth: false }
  )
  const t = pickToken(res)
  if (t) setToken(t)
  return { ...res, autoLogin: Boolean(t) }
}

/**
 * 登录。未配置 VITE_API_BASE_URL 时仍为前端演示：直接写入本地 token。
 * 配置后端后，期望 POST { username, password } 返回 { token } 或 { accessToken } 等常见字段。
 */
export async function loginWithPassword(username, password) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    setToken('demo')
    return { mock: true }
  }

  const res = await post(
    '/api/auth/login',
    { username, password },
    { auth: false }
  )
  const t = pickToken(res)
  if (!t) {
    throw new Error('登录成功但未返回有效 token')
  }
  setToken(t)
  return res
}
