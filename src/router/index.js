import { createRouter, createWebHistory } from 'vue-router'
import Community from '../pages/Community.vue'
import MapPage from '../pages/MapPage.vue'
import CalendarPage from '../pages/Calendar.vue'

const routes = [
  { path: '/', name: 'Community', component: Community },
  { path: '/map', name: 'Map', component: MapPage },
  { path: '/calendar', name: 'Calendar', component: CalendarPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
