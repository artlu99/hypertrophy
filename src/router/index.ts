import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/workout',
      name: 'workout',
      // Lazy load workout view
      component: () => import('../views/WorkoutView.vue'),
    },
    {
      path: '/history',
      name: 'history',
      // Lazy load history view
      component: () => import('../views/HistoryView.vue'),
    },
  ],
})

export default router
