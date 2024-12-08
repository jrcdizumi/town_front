<template>
  <nav class="navbar">
    <ul>
      <li><router-link to="/">首页</router-link></li>
      <li><router-link to="/about">关于我们</router-link></li>
      <li><router-link to="/contact">联系我们</router-link></li>
    </ul>
    <div class="user-info">
      <template v-if="isLoggedIn">
        <a @click="navigateToUserInfo">用户信息</a>
      </template>
      <template v-else>
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </template>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { checkToken } from '../utils/tokenUtils'

export default {
  name: 'NavBar',
  setup(props, { emit }) {
    const isLoggedIn = ref(false)
    const router = useRouter()

    onMounted(() => {
      checkToken(router).then(valid => {
        isLoggedIn.value = valid
      })
    })

    const navigateToUserInfo = () => {
      router.push('/userinfo')
    }

    return {
      isLoggedIn,
      navigateToUserInfo
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
</style>