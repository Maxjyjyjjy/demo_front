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

/**
 * 预留后端接口：
 * - 后端负责读取邮件并解析作业信息
 * - 返回数组，前端按 receivedAt（邮件收到时间）倒序展示
 *
 * 期望返回字段（建议）：
 * { id, title, course, receivedAt, dueAt, color? }
 */
export async function fetchHomeworkFromEmail() {
  // TODO: replace with real backend call, e.g.:
  // const res = await fetch('/api/homework/from-email')
  // return await res.json()

  const list = [...MOCK_HOMEWORK]
  list.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
  return list
}

