<template>
    <el-form :model="user" :rules="rules" ref="userForm" label-width="100px">
      <el-form-item label="用户名" prop="uname">
        <el-input v-model="user.uname" @blur="checkUserName"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="bpwd">
        <el-input type="password" v-model="user.bpwd" @blur="checkPassWord"></el-input>
      </el-form-item>
      <el-form-item label="用户姓名" prop="bname">
        <el-input v-model="user.bname"></el-input>
      </el-form-item>
      <el-form-item label="证件类型" prop="ctype">
        <el-select v-model="user.ctype" placeholder="请选择证件类型">
          <el-option label="身份证" value="身份证"></el-option>
          <el-option label="护照" value="护照"></el-option>
          <!-- 根据需要添加其他选项 -->
        </el-select>
      </el-form-item>
      <el-form-item label="证件号码" prop="idno">
        <el-input v-model="user.idno"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phoneno">
        <el-input v-model="user.phoneno"></el-input>
      </el-form-item>
      <el-form-item label="简介" prop="description">
        <el-input v-model="user.description" placeholder="请输入简介" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">注册</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
  </template>
  
  <script>
  import { reactive, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  
  export default {
    setup() {
      const router = useRouter()
      const user = reactive({
        uname: '',
        bpwd: '',
        bname: '',
        ctype: '身份证',
        idno: '',
        phoneno: '',
        description: ''
      })
  
      const rules = {
        uname: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        bpwd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        bname: [
          { required: true, message: '请输入用户姓名', trigger: 'blur' }
        ],
        ctype: [
          { required: true, message: '请选择证件类型', trigger: 'change' }
        ],
        idno: [
          { required: true, message: '请输入证件号码', trigger: 'blur' }
        ],
        phoneno: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
        ],
        // description 字段为非必填项，无需添加校验规则
      }
  
      const userForm = ref(null)
  
      const checkUserName = () => {
        if (user.uname) {
          axios.post('http://localhost:8080/user/checkUserName', user.uname, {
            headers: {
              'Content-Type': 'text/plain'
            }
          })
            .then(response => {
              if (response.data.code !== 200) {
                ElMessage.error(response.data.message)
              }
            })
            .catch(() => {
              ElMessage.error('用户名检查失败')
            })
        }
      }
  
      const checkPassWord = () => {
        if (user.bpwd) {
          axios.post('http://localhost:8080/user/checkPassWord', user.bpwd,{
            headers: {
              'Content-Type': 'text/plain'
            }
          })
            .then(response => {
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
        userForm.value.validate(valid => {
          if (valid) {
            axios.post('http://localhost:8080/user/regist', user)
              .then(response => {
                if (response.data.code === 200) {
                  ElMessage.success('注册成功')
                } else {
                  ElMessage.error(response.data.message)
                }
              })
              .catch(() => {
                ElMessage.error('注册失败')
              })
          } else {
            ElMessage.error('请完善表单信息')
          }
        })
      }
  
      const onReset = () => {
        userForm.value.resetFields()
      }
  
      onMounted(() => {
        const token = localStorage.getItem('token')
        if (token) {
          axios.get('http://localhost:8080/user/checkLogin', {
            headers: {
              'token': token
            }
          }).then(response => {
            const res = response.data
            if (res.code === 200) {
              // 已登录，跳转到 home 界面
              router.push('/')
            }
          }).catch(error => {
            console.error('验证失败', error)
          })
        }
      })
  
      return {
        user,
        rules,
        userForm,
        checkUserName,
        checkPassWord,
        onSubmit,
        onReset
      }
    }
  }
  </script>