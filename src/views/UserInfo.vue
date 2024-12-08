<template>
    <el-form :model="user" :rules="rules" ref="userForm" label-width="120px">
      <!-- 显示只读的用户基本信息 -->
      <el-form-item label="用户名">
        <el-input v-model="user.uname" disabled></el-input>
      </el-form-item>
      <el-form-item label="用户姓名">
        <el-input v-model="user.bname" disabled></el-input>
      </el-form-item>
      <el-form-item label="证件类型">
        <el-input v-model="user.ctype" disabled></el-input>
      </el-form-item>
      <el-form-item label="证件号码">
        <el-input v-model="user.idno" disabled></el-input>
      </el-form-item>
  
      <!-- 可修改的手机号 -->
      <el-form-item label="联系电话" prop="phoneno">
        <el-input v-model="user.phoneno"></el-input>
      </el-form-item>
  
      <!-- 可修改的用户简介 -->
      <el-form-item label="用户简介" prop="description">
        <el-input v-model="user.description" type="textarea"></el-input>
      </el-form-item>
  
      <!-- 可修改的密码 -->
      <el-form-item label="密码" prop="bpwd">
        <el-input type="password" v-model="user.bpwd" @blur="checkPassWord"></el-input>
      </el-form-item>
  
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存修改</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
  </template>
  
  <script>
  import { reactive, ref, onMounted } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { checkToken } from '../utils/tokenUtils'
  
  export default {
    setup() {
      const user = reactive({
        uname: '',
        bname: '',
        ctype: '',
        idno: '',
        phoneno: '',
        description: '',
        bpwd: ''
      })
  
      const rules = {
        phoneno: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
        ],
        bpwd: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              const digitCount = (value.match(/\d/g) || []).length
              if (digitCount < 2) {
                callback(new Error('密码至少包含两个数字'))
              } else if (
                value === value.toLowerCase() ||
                value === value.toUpperCase()
              ) {
                callback(new Error('密码需包含大小写字母'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
  
      const userForm = ref(null)
      const router = useRouter()
  
      // 获取用户信息
      const getUserInfo = () => {
        const token = localStorage.getItem('token')
        axios
          .get('http://localhost:8080/user/getUserInfo', {
          headers: {
            'token': token
          }
        })
          .then((response) => {
            if (response.data.code === 200) {
              Object.assign(user, response.data.data)
            } else if (response.data.code === 504) {
              // token无效，重定向到登录页面
              ElMessage.error('未登录或登录已过期')
              router.push('/login')
            } else {
              ElMessage.error(response.data.message)
            }
          })
          .catch(() => {
            ElMessage.error('获取用户信息失败')
            router.push('/login')
          })
      }
  
      onMounted(() => {
        checkToken(router)
        getUserInfo()
      })
  
      // 检查密码合法性
      const checkPassWord = () => {
        if (user.bpwd) {
          axios
            .post('http://localhost:8080/user/checkPassWord', user.bpwd)
            .then((response) => {
              if (response.data.code !== 200) {
                ElMessage.error(response.data.message)
              }
            })
            .catch(() => {
              ElMessage.error('密码检查失败')
            })
        }
      }
  
      const onSubmit = () => {
        userForm.value.validate((valid) => {
          if (valid) {
            const token = localStorage.getItem('token')
            axios
              .post('http://localhost:8080/user/updateUserInfo', user, { headers: { token } })
              .then((response) => {
                if (response.data.code === 200) {
                  ElMessage.success('用户信息更新成功')
                } else {
                  ElMessage.error(response.data.message)
                }
              })
              .catch(() => {
                ElMessage.error('更新失败')
              })
          } else {
            ElMessage.error('请完善表单信息')
          }
        })
      }
  
      const onReset = () => {
        getUserInfo()
      }
  
      return {
        user,
        rules,
        userForm,
        checkPassWord,
        onSubmit,
        onReset
      }
    }
  }
  </script>