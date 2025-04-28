// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 配置路由表
const routes = [
  {
    path: '/',
    name: 'Client',
    component: () => import('@/views/Client.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // history模式，地址栏正常
  routes
})

export default router
