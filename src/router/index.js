import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import AdminLogin from '@/views/AdminLogin.vue';
import Statistic from '@/views/Statistic.vue';
import AddPublicize from '@/components/AddPublicize.vue';
import Register from '@/views/Register.vue';
import UserInfo from '@/views/UserInfo.vue';
import TownPromotionalEdit from '@/components/TownPromotionalEdit.vue';
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
    path: '/adminlogin',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/statistic',
    name: 'Statistic',
    component: Statistic
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
  },
  {
    path: '/editPromotional/:pid',
    name: 'TownPromotionalEdit',
    component: TownPromotionalEdit
  },
  {
    path: '/editSupport/:id',
    name: 'TownSupportEdit',
    component: () => import('@/components/TownSupportEdit.vue')
  },
  {
    path: '/town-support-detail/:id',
    name: 'TownSupportDetail',
    component: () => import('@/components/TownSupportDetail.vue')
  },
  {
    path: '/addSupport/:pid',
    name: 'AddSupport',
    component: () => import('@/components/AddSupport.vue')
  },
  {
    path: '/town-support-list',
    name: 'TownSupportList',
    component: () => import('@/components/TownSupportList.vue')
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