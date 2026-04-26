import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../utils/auth.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true, hideChrome: true }
  },
  {
    path: '/',
    name: 'Schedule',
    component: () => import('../views/ScheduleView.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue')
  },
  {
    path: '/homework',
    name: 'Homework',
    component: () => import('../views/HomeworkView.vue')
  },
  {
    path: '/library',
    redirect: '/homework'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 每次导航校验：除 meta.public 外，必须有 token 才能进入（等效于全站受保护，仅登录等少数页面公开）
 */
router.beforeEach((to) => {
  if (to.meta?.public) {
    if (to.name === 'Login' && isLoggedIn()) {
      return { path: '/', replace: true }
    }
    return true
  }
  if (!isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath }, replace: true }
  }
  return true
})

export default router
