import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Home from './App.vue'
import Callback from './components/Callback.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/callback', component: Callback },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router