import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import Video from 'video.js'
import 'video.js/dist/video-js.css'


const app = createApp(App);

app.config.globalProperties.$axios = axios;
app.config.globalProperties.$video = Video; // 在vue的原生里添加了Video这个标签，增强了vue的功能性

app.use(router);
app.use(ElementPlus);
app.mount('#app');