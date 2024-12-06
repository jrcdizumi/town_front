
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';

// ...existing code...

const routes = [
  // ...existing routes...
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];

// ...existing code...

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;