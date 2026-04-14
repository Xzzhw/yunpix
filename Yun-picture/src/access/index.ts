import router from '@/router'
import ACCESS_ENUM from './accessEnum'
import checkAccess from './checkAccess'
import { useLoginUserstore } from '@/stores/useLoginUserstore'
import { message } from 'ant-design-vue'

router.beforeEach(async (to, from, next) => {
  const usestore = useLoginUserstore()
  let loginUser = usestore.loginUser
  if (!loginUser || !loginUser.userRole) {
    await usestore.fetchLoginUser()
    loginUser = usestore.loginUser
  }
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN
  if (needAccess != ACCESS_ENUM.NOT_LOGIN) {
    if (!loginUser.id) {
      message.error('用户未登录,请先登陆')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
    if (!checkAccess(loginUser, needAccess)) {
      message.error('权限不足')
      next('/')
      return
    }
  }
  next()
})
