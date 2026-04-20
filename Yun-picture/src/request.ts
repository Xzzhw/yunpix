import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

const DEV_BASE_URL = 'http://localhost:8123'

const myAxios: AxiosInstance = axios.create({
  // baseURL: PROD_BASE_URL,
  baseURL: DEV_BASE_URL,
  timeout: 60000,
  // 是否需要登陆凭证
  withCredentials: true,
})

// 添加请求拦截器
myAxios.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    // 开发环境打印请求信息
    if (import.meta.env.DEV) {
      console.log('[Request]', config.method?.toUpperCase(), config.url)
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    console.error('[Request Error]', error)
    message.error('请求发送失败,请检查网络连接')
    return Promise.reject(error)
  },
)

// 添加响应拦截器
myAxios.interceptors.response.use(
  function (response: AxiosResponse) {
    const res = response.data
    
    // 开发环境打印响应信息
    if (import.meta.env.DEV) {
      console.log('[Response]', response.config.url, res)
    }

    // 如果后端返回的是标准格式 { code, data, message }
    if (res && typeof res === 'object' && 'code' in res) {
      // 假设后端成功码为 0 或 200,根据实际情况调整
      if (res.code !== 0 && res.code !== 200) {
        message.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      // 返回业务数据
      return res.data
    }

    // 如果不是标准格式,直接返回整个响应数据
    return res
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数
    console.error('[Response Error]', error)

    // 处理不同的 HTTP 错误状态码
    if (error.response) {
      const status = error.response.status
      
      switch (status) {
        case 400:
          message.error('请求参数错误')
          break
        case 401:
          message.error('未授权,请登录')
          // 可以在这里跳转到登录页
          // window.location.href = '/user/login'
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求资源不存在')
          break
        case 500:
          message.error('服务器内部错误')
          break
        case 502:
          message.error('网关错误')
          break
        case 503:
          message.error('服务不可用')
          break
        case 504:
          message.error('网关超时')
          break
        default:
          message.error(`请求失败 (${status})`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络异常,请检查网络连接')
    } else {
      // 其他错误
      message.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  },
)

export default myAxios
