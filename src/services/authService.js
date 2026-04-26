import { post } from '../utils/request.js'
import { setToken } from '../utils/auth.js'

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
  const t = res?.token ?? res?.accessToken ?? res?.access_token ?? res?.data?.token
  if (typeof t !== 'string' || !t) {
    throw new Error('登录成功但未返回有效 token')
  }
  setToken(t)
  return res
}
