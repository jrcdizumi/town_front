
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
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
  }
];

// ...existing code...

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;