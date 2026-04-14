<template>
  <div id="userLoginPage">
    <h2 class="title">云图库-用户登陆</h2>

    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" />
      </a-form-item>

      <a-form-item name="userPassword" :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '密码不小于 6 位' }]">
        <a-input-password v-model:value="formState.userPassword" />
      </a-form-item>
      <div class="tips">
        没有账号
        <router-link to="/user/register">去注册</router-link>
      </div>
      <a-form-item >
        <a-button class="submit" type="primary" html-type="submit">登录</a-button>
      </a-form-item>
    </a-form>

  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { message } from 'ant-design-vue';
import { userLoginUsingPost } from '@/api/userController';
import { useRouter } from 'vue-router';
import { useLoginUserstore } from '@/stores/useLoginUserstore';

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
});

const router = useRouter();
const loginUserStore = useLoginUserstore();

// 处理登录提交
const handleSubmit = async (values: API.UserLoginRequest) => {
  try {
    console.log(values)
    const res = await userLoginUsingPost(values);
    if (res.data.code === 0 && res.data.data) {
      message.success('登录成功');
      // 更新全局用户状态
      loginUserStore.loginUser = res.data.data;
      // 跳转到首页
      router.replace('/');
    } else {
      console.log(res.data)
      message.error(res.data.message || '登录失败');
    }
  } catch {
    message.error('登录失败');
  }
};
</script>
<style scoped>
#userLoginPage {
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
.submit{
  width: 60%;
  margin: 0 auto;
  display: block;
}
</style>
