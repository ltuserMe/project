import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：未登录跳转登录页，已登录访问登录页跳转首页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token && to.path !== '/login') {
    next('/login');
  } else if (token && to.path === '/login') {
    next('/');
  } else {
    next();
  }
});

export default router; 