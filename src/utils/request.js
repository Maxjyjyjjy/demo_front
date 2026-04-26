import axios from 'axios'
import { getToken, clearToken } from './auth.js'
import router from '../router/index.js'

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const instance = axios.create({
  baseURL: BASE || undefined,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false
})

/**
 * 请求：附加 Bearer（_useAuth 为 true 时，默认与 auth 入参一致）
 */
instance.interceptors.request.use((config) => {
  if (config._useAuth !== false) {
    const t = getToken()
    if (t) {
      if (!config.headers) config.headers = {}
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${t}`
      }
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

/**
 * 带 token 的请求 401：清 token 并去登录
 */
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const { response, config } = error
    if (response?.status === 401 && config?._useAuth !== false) {
      clearToken()
      if (router.currentRoute.value?.name !== 'Login') {
        const full = router.currentRoute.value?.fullPath || '/'
        router.replace({ path: '/login', query: { redirect: full } })
      }
    }
    return Promise.reject(toAppError(error))
  }
)

function toAppError(error) {
  if (!axios.isAxiosError(error)) {
    return error
  }
  const res = error.response
  const data = res?.data
  const message =
    (typeof data === 'object' && data && data.message) ||
    (typeof data === 'string' && data) ||
    res?.statusText ||
    error.message ||
    '请求失败'
  const err = new Error(message)
  err.status = res?.status
  err.data = data
  return err
}

/**
 * 统一请求。默认在请求头携带 `Authorization: Bearer <token>`（auth: true）。
 * - `auth: false` 时不上 token（如登录等）
 * - 带 token 且返回 401 时，会 clearToken 并跳转登录
 */
export async function request(path, options = {}) {
  const { auth = true, method = 'GET', body, data: dataOpt, ...rest } = options
  const data = dataOpt !== undefined ? dataOpt : body
  const config = {
    url: path,
    method: String(method).toLowerCase(),
    _useAuth: auth,
    ...rest
  }
  if (data !== undefined && !['get', 'head'].includes(config.method)) {
    config.data = data
  }
  const res = await instance.request(config)
  if (res.status === 204) return null
  return res.data
}

export function get(path, options = {}) {
  return request(path, { ...options, method: 'GET' })
}

export function post(path, body, options = {}) {
  return request(path, { ...options, method: 'POST', body })
}

export function put(path, body, options = {}) {
  return request(path, { ...options, method: 'PUT', body })
}

export function patch(path, body, options = {}) {
  return request(path, { ...options, method: 'PATCH', body })
}

export function del(path, options = {}) {
  return request(path, { ...options, method: 'DELETE' })
}
