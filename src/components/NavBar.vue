<template>
  <nav class="navbar">
    <div class="bar">
      <ul class="navbar-list">
        <li><router-link to="/" :class="{ active: isActive('/') }">首页</router-link></li>
        <template v-if="isLoggedIn">
          <li><router-link to="/userinfo" :class="{ active: isActive('/userinfo') }">用户信息</router-link></li>
          <li><router-link to="/addpublicize" :class="{ active: isActive('/addpublicize') }">添加宣传</router-link></li>
          <li><router-link to="/town-support-list" :class="{ active: isActive('/town-support-list') }">助力列表</router-link></li>
          <li v-if="isAdmin"><router-link to="/statistic" :class="{ active: isActive('/statistic') }">统计页面</router-link></li>
        </template>
        <template v-else>
          <li><router-link to="/login">登录</router-link></li>
          <li><router-link to="/register">注册</router-link></li>
          <li><router-link to="/adminlogin">管理员登录</router-link></li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { checkToken } from '../utils/tokenUtils'

export default {
  name: 'NavBar',
  setup(props, { emit }) {
    const isLoggedIn = ref(false)
    const router = useRouter()
    const route = useRoute()
    const isAdmin = computed(() => {
      return localStorage.getItem('admin') === 'admin'
    })

    onMounted(() => {
      checkToken(router).then(valid => {
        isLoggedIn.value = valid
      })
    })

    const navigateToUserInfo = () => {
      router.push('/userinfo')
    }

    const isActive = (path) => {
      return route.path === path
    }

    return {
      isLoggedIn,
      navigateToUserInfo,
      isActive,
      isAdmin
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #333;
  padding: 10px;
}
.navbar ul {
  list-style: none;
  display: flex;
}
.navbar li {
  margin-right: 20px;
}
.navbar a {
  color: white;
  text-decoration: none;
}
.navbar a.active {
  color: #555; /* 深色 */
}

.bar {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.navbar-list {
  display: flex;
  list-style: none;
}
</style>