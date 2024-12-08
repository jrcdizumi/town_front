<template>
  <router-view></router-view>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  setup() {
    const router = useRouter()

    onMounted(() => {
      const token = localStorage.getItem('token')
      if (token) {
        // 如果存在 token，发送到后端进行验证
        axios.get('http://localhost:8080/user/checkLogin', {
          headers: {
            'token': token
          }
        }).then(response => {
          const res = response.data
          if (res.code === 200) {
            // 验证成功，继续加载应用
            console.log('登录验证成功')
          } else if (res.code === 504) {
            // 未登录，重定向到登录页面
            router.push('/login')
          } else {
            // 处理其他返回码
            console.error(res.message)
            router.push('/login')
          }
        }).catch(error => {
          console.error('验证失败', error)
          router.push('/login')
        })
      } else {
        // 不存在 token，重定向到登录页面
        router.push('/login')
      }
    })
  }
}
</script>