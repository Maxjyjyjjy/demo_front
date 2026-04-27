import { get, post, del } from '../utils/request.js'

const MOCK = [
  { id: 1, title: 'Email professor about quiz', category: 'Communication' },
  { id: 2, title: 'Buy new calculator batteries', category: 'General' }
]

function hasBase() {
  return Boolean(import.meta.env.VITE_API_BASE_URL)
}

export async function fetchQuickTasks() {
  if (!hasBase()) {
    return [...MOCK]
  }
  return get('/api/quick-tasks')
}

export async function createQuickTask(body) {
  if (!hasBase()) {
    return { id: Date.now(), title: body.title, category: body.category || 'General' }
  }
  return post('/api/quick-tasks', body)
}

export async function deleteQuickTask(id) {
  if (!hasBase()) return
  return del(`/api/quick-tasks/${id}`)
}
