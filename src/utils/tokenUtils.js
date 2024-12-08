import { ElMessage } from 'element-plus'
import axios from 'axios'

export function checkToken(router) {
  return new Promise((resolve) => {
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
          // 验证成功
          console.log('登录验证成功')
          resolve(true)
        } else {
          resolve(false)
        }
      }).catch(error => {
        console.error('验证失败', error)
        resolve(false)
      })
    } else {
      resolve(false)
    }
  })
}