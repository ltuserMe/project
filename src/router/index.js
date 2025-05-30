import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import store from '@/store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    name: 'Todo',
    component: () => import('@/views/todo/index.vue'),
    meta: { title: '待办事项' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Todo App` : 'Todo App'

  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 判断是否已获取用户信息
      const hasUserInfo = store.state.user.userInfo && Object.keys(store.state.user.userInfo).length > 0
      
      if (hasUserInfo) {
        next()
      } else {
        try {
          // 获取用户信息
          await store.dispatch('user/getUserInfo')
          next()
        } catch (error) {
          // 获取用户信息失败，清除 token 并跳转到登录页
          await store.dispatch('user/logout')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    if (to.meta.hidden) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router 