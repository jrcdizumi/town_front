<template>
    <div class="login-container">
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="密码" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  import { ElMessage } from 'element-plus';
  import { onMounted } from 'vue'
  import axios from 'axios'
  
  export default {
    name: 'Login',
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
        this.$axios.get('http://localhost:8080/user/checkLogin', {
          headers: {
            'token': token
          }
        }).then(response => {
          const res = response.data
          if (res.code === 200) {
            // 已登录，跳转到 home 界面
            this.$router.push('/')
          }
        }).catch(error => {
          console.error('验证失败', error)
        })
      }
    },
    methods: {
      handleLogin() {
        this.$axios.post('http://localhost:8080/user/login', {
          uname: this.loginForm.username,
          bpwd: this.loginForm.password
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success('success');
            localStorage.setItem('token', response.data.data.token);
            this.$router.push('/');
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
  .login-container {
    width: 300px;
    margin: 100px auto;
  }
  </style>