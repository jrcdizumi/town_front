<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { checkToken } from './utils/tokenUtils'
import NavBar from './components/NavBar.vue';

export default {
  components: {
    NavBar
  },
  setup() {
    const router = useRouter()

    onMounted(() => {
    })
  }
}
</script>