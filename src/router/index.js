import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import AddPublicize from '@/components/AddPublicize.vue';
import Register from '@/views/Register.vue';
import UserInfo from '@/views/UserInfo.vue';
// ...existing code...

const routes = [
  // ...existing routes...
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/userinfo',
    name: 'UserInfo',
    component: UserInfo
  },
  {
    path: '/addpublicize',
    name: 'AddPublicize',
    component: AddPublicize,
    meta: {
      title : '我宣传-添加'
    }
  },
  {
    path: '/town-promotional-list',
    name: 'TownPromotionalList',
    component: () => import('@/components/TownPromotionalList.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/TownPromotionalList.vue')
  },
  {
    path: '/town-promotional-detail/:id',
    name: 'TownPromotionalDetail',
    component: () => import('@/components/TownPromotionalDetail.vue')
  }
];

// ...existing code...

const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = '好乡镇';
  }
  next();
});
export default router;