<template>
    <div class="adminlogin-container">
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="管理员账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="密码" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">管理员登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  import { ElMessage } from 'element-plus';
  import { onMounted } from 'vue'
  import axios from 'axios'
  
  export default {
    name: 'AdminLogin',
    data() {
      return {
        loginForm: {
          username: '',
          password: ''
        }
      }
    },
    mounted() {
      const token = localStorage.getItem('token')
      if (token) {
        this.$axios.get('http://localhost:8080/user/checkadminLogin', {
          headers: {
            'token': token
          }
        }).then(response => {
          const res = response.data
          if (res.code === 200) {
        //   if(1){
            // 已登录，跳转到 statistic 界面
            this.$router.push('/statistic')
          }
        }).catch(error => {
          console.error('验证失败', error)
        })
      }
    },
    methods: {
      handleLogin() {
        
        // this.$router.push('/statistic');
        this.$axios.post('http://localhost:8080/admin/adminlogin', {
          username: this.loginForm.username,
          password: this.loginForm.password
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success('success');
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('admin', this.loginForm.username);
            this.$router.push('/statistic');
          } else {
            ElMessage.error(response.data.message);
          }
        }).catch(error => {
          console.error(error);
        });
      }
    }
  }
  </script>
  
  <style scoped>
  .adminlogin-container {
    width: 300px;
    margin: 100px auto;
  }
  </style>