import { get, post, del } from '../utils/request.js'

function hasBase() {
  return Boolean(import.meta.env.VITE_API_BASE_URL)
}

const MOCK_EVENTS = [
  {
    id: 1,
    name: '钢琴',
    startTime: '10:00',
    endTime: '11:00',
    startHour: 10,
    startMinute: 0,
    startSlotKey: 600,
    duration: 1,
    color: 'blue',
    status: 'live',
    location: null,
    description: null,
    moduleId: 1
  },
  {
    id: 2,
    name: '唱歌',
    startTime: '14:00',
    endTime: '15:30',
    startHour: 14,
    startMinute: 0,
    startSlotKey: 840,
    duration: 1.5,
    color: 'pink',
    status: null,
    location: 'Studio B',
    description: 'Vocal training and warm-ups session.',
    moduleId: 2
  }
]

/**
 * 按日拉取日程事件
 * @param {string} dateIso YYYY-MM-DD
 */
export async function fetchScheduleEvents(dateIso) {
  if (!hasBase()) {
    return [...MOCK_EVENTS]
  }
  return get(`/api/schedule/events?date=${encodeURIComponent(dateIso)}`)
}

/**
 * 新增事件（与课程表 slot 一致）
 */
export async function createScheduleEvent(body) {
  if (!hasBase()) {
    const startMinutes = body.startSlotKey
    const duration = body.duration != null ? body.duration : 1
    const endMinutes = startMinutes + duration * 60
    const sh = Math.floor(startMinutes / 60)
    const sm = startMinutes % 60
    const eh = Math.floor((endMinutes % 1440) / 60)
    const em = (endMinutes % 1440) % 60
    const fmt = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    return {
      id: Date.now(),
      name: body.name,
      startTime: fmt(sh, sm),
      endTime: fmt(eh, em),
      startHour: sh,
      startMinute: sm,
      startSlotKey: startMinutes,
      duration,
      color: body.color || 'blue',
      status: body.status || null,
      location: body.location || null,
      description: body.description || null,
      moduleId: body.moduleId != null ? body.moduleId : null
    }
  }
  return post('/api/schedule/events', body)
}

export async function deleteScheduleEvent(eventId) {
  if (!hasBase()) return
  return del(`/api/schedule/events/${eventId}`)
}

export async function fetchHasEventsOnDate(dateIso) {
  if (!hasBase()) return null
  const list = await get(`/api/schedule/events?date=${encodeURIComponent(dateIso)}`)
  return Array.isArray(list) && list.length > 0
}
