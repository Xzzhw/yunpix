import { message } from 'ant-design-vue'
import router from './router'
import { useLoginUserstore } from './stores/useLoginUserstore'
let firstFetch: boolean = true
router.beforeEach(async (to, form, next) => {
  const LoginuserStore = useLoginUserstore()
  let loginUser = LoginuserStore.loginUser
  //等待后端返回用户信息后再校验
  if (firstFetch) {
    await LoginuserStore.fetchLoginUser()
    loginUser = LoginuserStore.loginUser
    firstFetch = false
  }
  const toUrl = to.fullPath
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole != 'admin') {
      message.error('没有权限')
      next(`/next/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})
