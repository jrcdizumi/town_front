<template>
  <router-view></router-view>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { checkToken } from './utils/tokenUtils'
export default {
  setup() {
    const router = useRouter()

    onMounted(() => {
      checkToken(router)
    })
  }
}
</script>