<template>
  <div class="user-server-page">
    <a-card class="info-card">
      <template #title>
        <span class="card-title">个人信息</span>
      </template>

      <div class="user-info-form">
        <!-- 头像上传区域 -->
        <div class="avatar-section">
          <div class="avatar-upload">
            <div class="avatar-preview">
              <img v-if="formState.userAvatar" :src="formState.userAvatar" alt="头像" />
              <div v-else class="avatar-placeholder">
                <plus-outlined class="avatar-icon" />
                <span class="avatar-text">上传头像</span>
              </div>
            </div>
            <a-button type="primary" class="upload-btn" @click="triggerAvatarUpload">
              上传头像
            </a-button>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarChange"
            />
          </div>
        </div>

        <!-- 表单区域 -->
        <div class="form-section">
          <a-form :model="formState" layout="vertical">
            <a-form-item label="用户名" required>
              <a-input
                v-model:value="formState.userName"
                placeholder="请输入用户名"
                :disabled="loading"
              />
            </a-form-item>

            <a-form-item label="用户账号">
              <a-input
                v-model:value="formState.userAccount"
                placeholder="用户账号"
                disabled
              />
            </a-form-item>

            <a-form-item label="个人简介">
              <a-textarea
                v-model:value="formState.userProfile"
                placeholder="请输入个人简介"
                :rows="4"
                :disabled="loading"
              />
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                class="submit-btn"
                :loading="loading"
                @click="handleSubmit"
              >
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getLoginUserUsingGet, updateUserUsingPost } from '@/api/userController'
import { uploadPictureUsingPost } from '@/api/pictureController'
import { useLoginUserstore } from '@/stores/useLoginUserstore'

const Loginstore = useLoginUserstore()
const loading = ref(false)
const avatarInputRef = ref<HTMLElement>()

// 表单数据
const formState = reactive({
  id: undefined as number | undefined,
  userAvatar: '',
  userName: '',
  userAccount: '',
  userProfile: '',
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      const user = res.data.data
      formState.id = user.id
      formState.userAvatar = user.userAvatar || ''
      formState.userName = user.userName || ''
      formState.userAccount = user.userAccount || ''
      formState.userProfile = user.userProfile || ''
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    message.error('获取用户信息失败')
  }
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInputRef.value?.click()
}

// 处理头像变化
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    message.error('请上传图片文件')
    return
  }

  // 验证文件大小（限制 5MB）
  if (file.size > 5 * 1024 * 1024) {
    message.error('图片大小不能超过 5MB')
    return
  }

  try {
    loading.value = true
    const params: API.PictureUploadRequest = {}
    const res = await uploadPictureUsingPost(params, {}, file)

    if (res.data.code === 0 && res.data.data) {
      formState.userAvatar = res.data.data.url || ''
      message.success('头像上传成功')
    } else {
      message.error('头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败', error)
    message.error('头像上传失败')
  } finally {
    loading.value = false
    // 清空 input，允许重复上传同一张图片
    target.value = ''
  }
}

// 保存修改
const handleSubmit = async () => {
  if (!formState.userName || formState.userName.trim() === '') {
    message.error('用户名不能为空')
    return
  }

  try {
    loading.value = true
    const params: API.UserUpdateRequest = {
      id: formState.id,
      userName: formState.userName.trim(),
      userAvatar: formState.userAvatar,
      userProfile: formState.userProfile?.trim(),
    }
    
    const res = await updateUserUsingPost(params)
    
    if (res.data.code === 0 && res.data.data) {
      message.success('保存成功')
      // 刷新全局用户状态（更新头部组件显示）
      await Loginstore.fetchLoginUser()
    } else {
      message.error(res.data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败', error)
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-server-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.info-card {
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-info-form {
  display: flex;
  gap: 48px;
  padding: 24px 0;
}

.avatar-section {
  flex: 0 0 240px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px dashed #d9d9d9;
  background-color: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-preview:hover {
  border-color: #1890ff;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
}

.avatar-icon {
  font-size: 28px;
  color: #ccc;
}

.avatar-text {
  font-size: 13px;
  color: #999;
}

.upload-btn {
  width: 100px;
}

.form-section {
  flex: 1;
  max-width: 500px;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info-form {
    flex-direction: column;
    gap: 32px;
  }

  .avatar-section {
    flex: none;
    justify-content: center;
  }
}
</style>
