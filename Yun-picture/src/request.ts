import axios, { type AxiosInstance } from 'axios'
const DEV_BASE_URL = 'http://localhost:8123'
const PROD_BASE_URL = 'http://49.232.51.24'
const myAxios: AxiosInstance = axios.create({
  // baseURL: PROD_BASE_URL,
  //测试线上地址
  baseURL: 'https://yumpixhub.asia',
  // baseURL: DEV_BASE_URL,

  timeout: 60000,
  //是否需要登陆凭证
  withCredentials: true,
})
// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  },
)

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error)
  },
)
export default myAxios
