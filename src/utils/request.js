import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  // 默认请求地址，开发环境可在 .env 文件中配置 VITE_API_BASE_URL
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  // 请求超时时间：10秒
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 例如：如果需要 token，可以在这里添加
    // config.headers['Authorization'] = 'Bearer ' + getToken()
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data
    
    // 这里可以根据后端返回的状态码进行统一处理
    // 假设后端返回格式为 { code: 200, data: ... }
    // 如果不是 200，可以视为错误（根据实际情况调整）
    // 注意：部分接口可能直接返回列表或对象，需根据实际后端调整
    return res
  },
  error => {
    // 对响应错误做点什么
    console.error('Response Error:', error)
    
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400: message = '请求参数错误'; break
        case 401: message = '未授权，请登录'; break
        case 403: message = '拒绝访问'; break
        case 404: message = '请求地址出错'; break
        case 500: message = '服务器内部错误'; break
        default: message = `连接错误 ${error.response.status}`;
      }
    } else if (error.request) {
      message = '服务器无响应'
    } else {
      message = error.message
    }
    
    // 这里可以接入 UI 组件库的 Message 提示，例如 ElementPlus 或 AntDesign
    // alert(message) 
    
    return Promise.reject(error)
  }
)

export default service
