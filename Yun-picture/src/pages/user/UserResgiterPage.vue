<template>
  <div id="userRegisterPage">
    <h2 class="title">鱼皮云图库 - 用户注册</h2>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userName" :rules="[{ required: true, message: '请输入昵称' }]">
        <a-input v-model:value="formState.userName" placeholder="请输入昵称" />
      </a-form-item>
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码长度不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请输入确认密码' },
          { min: 8, message: '确认密码长度不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
      </a-form-item>
      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { message } from 'ant-design-vue'
import { userRegisterUsingPost } from '@/api/userController'
import { useRouter } from 'vue-router'
import { useLoginUserstore } from '@/stores/useLoginUserstore'

const formState = reactive<API.UserRegisterRequest>({
  userName: '',
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserstore()

// 处理登录提交
const handleSubmit = async (values: API.UserRegisterRequest) => {
  try {
    if (values.checkPassword != values.userPassword) {
      message.error('两次密码不一致')
      return
    }
    const res = await userRegisterUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功')
      // 更新全局用户状态
      // 跳转到首页
      router.replace('/')
    } else {
      message.error(res.data.message || '注册失败')
    }
  } catch {
    message.error('登录失败')
  }
}
</script>
<style scoped>
#userRegisterPage {
  max-width: 350px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 16px;
}

.tips {
  text-align: right;
  color: #bbb;
  font-size: 13px;
  margin-bottom: 16px;
}

.submit {
  width: 60%;
  margin: 0 auto;
  display: block;
}
</style>
