import { createRouter, createWebHistory } from 'vue-router'

const routes = [
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

export default router
