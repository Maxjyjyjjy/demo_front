import { get, post, del } from '../utils/request.js'

const MOCK_HOMEWORK = [
  {
    id: 'mail-1',
    title: 'Advanced Calculus — Problem Set',
    course: 'Advanced Calculus',
    receivedAt: '2026-04-26T09:12:00+08:00',
    dueAt: '2026-04-27T10:00:00+08:00',
    color: 'pink',
    icon: 'functions'
  },
  {
    id: 'mail-2',
    title: 'Physics Review Notes',
    course: 'Physics II',
    receivedAt: '2026-04-25T20:30:00+08:00',
    dueAt: '2026-04-28T18:00:00+08:00',
    color: 'green',
    icon: 'rocket_launch'
  },
  {
    id: 'mail-3',
    title: 'Modern History — Draft Outline',
    course: 'Modern History',
    receivedAt: '2026-04-25T08:05:00+08:00',
    dueAt: '2026-04-26T18:00:00+08:00',
    color: 'blue',
    icon: 'history_edu'
  }
]

function hasBase() {
  return Boolean(import.meta.env.VITE_API_BASE_URL)
}

function mockSortedHomework() {
  const list = [...MOCK_HOMEWORK]
  list.sort((a, b) => new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0))
  return list
}

/**
 * 全量作业（邮件类 + 自建类）
 */
export async function fetchAllHomework() {
  if (!hasBase()) {
    return mockSortedHomework()
  }
  const data = await get('/api/homework')
  return Array.isArray(data) ? data : []
}

/**
 * 仅来自邮件/同步通道的作业
 */
export async function fetchHomeworkFromEmail() {
  if (!hasBase()) {
    return mockSortedHomework()
  }
  const data = await get('/api/homework/from-email')
  return Array.isArray(data) ? data : []
}

/**
 * 创建自定义作业
 * @param {{ title: string, course?: string | null, dueAt?: string | null, color?: string, icon?: string }} body
 */
export async function createHomework(body) {
  if (!hasBase()) {
    const now = new Date().toISOString()
    return {
      id: `custom-${Date.now()}`,
      title: body.title,
      course: body.course != null ? body.course : null,
      receivedAt: now,
      dueAt: body.dueAt != null ? body.dueAt : null,
      color: body.color || 'blue',
      icon: body.icon || 'assignment'
    }
  }
  return post('/api/homework', body)
}

export async function deleteHomeworkById(homeworkId) {
  if (!hasBase()) return
  return del(`/api/homework/${encodeURIComponent(homeworkId)}`)
}

/**
 * 作业时间轴：新增
 */
export async function createHomeworkScheduleEntry(body) {
  if (!hasBase()) {
    const id = Date.now()
    return {
      id,
      scheduleId: id,
      homeworkId: body.homeworkId,
      date: body.date,
      startSlotKey: body.startSlotKey
    }
  }
  return post('/api/homework/schedule-entries', body)
}

export async function deleteHomeworkScheduleEntry(scheduleId) {
  if (!hasBase()) return
  return del(`/api/homework/schedule-entries/${scheduleId}`)
}
