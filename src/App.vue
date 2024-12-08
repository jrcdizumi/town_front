<template>
  <div id="app">
    <NavBar :key="navBarKey" />
    <router-view />
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { checkToken } from './utils/tokenUtils'
import NavBar from './components/NavBar.vue';

export default {
  components: {
    NavBar
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const navBarKey = ref(0)

    watch(route, () => {
      navBarKey.value += 1
    })

    onMounted(() => {
    })

    return { navBarKey }
  }
}
</script>