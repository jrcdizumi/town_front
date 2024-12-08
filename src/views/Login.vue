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