import { get, post, del } from '../utils/request.js'

const MOCK = [
  { id: 1, name: '钢琴', category: 'Activity', color: 'blue' },
  { id: 2, name: '唱歌', category: 'Art', color: 'pink' },
  { id: 3, name: '书法', category: 'Skill', color: 'green' }
]

function hasBase() {
  return Boolean(import.meta.env.VITE_API_BASE_URL)
}

export async function fetchCourseModules() {
  if (!hasBase()) {
    return [...MOCK]
  }
  return get('/api/course-modules')
}

export async function createCourseModule(body) {
  if (!hasBase()) {
    return {
      id: Date.now(),
      name: body.name,
      color: body.color || 'blue',
      category: body.category || 'Custom'
    }
  }
  return post('/api/course-modules', body)
}

export async function deleteCourseModule(id) {
  if (!hasBase()) return
  return del(`/api/course-modules/${id}`)
}
