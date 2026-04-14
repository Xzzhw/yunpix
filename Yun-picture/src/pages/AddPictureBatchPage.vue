<template>
  <div id="addbatchPicturePage">
    <h2 style="margin-bottom: 16px">批量创建</h2>
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" />
      </a-form-item>
      <a-form-item label="数量" name="count">
        <a-input-number
          v-model:value="formData.count"
          placeholder="请输入数量"
          :min="1"
          :max="30"
          allowClear
          style="min-width: 180px"
        ></a-input-number>
      </a-form-item>
      <a-form-item label="名称前缀" name="namePrefix">
        <a-input v-model:value="formData.namePrefix" placeholder="请输入名称前缀" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >批量创建</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { uploadPictureByBatchUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
//路由跳转
const router = useRouter()
const loading = ref<boolean>(false)
//图片表单
const formData = reactive<API.PictureUploadByBatchRequest>({})
const handleSubmit = async (values: any) => {
  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...formData,
  })
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success(`创建成功,共${res.data.data}条`)
    // 跳转到主页
    router.push({
      path: `/`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}
</script>

<style scoped>
#addbatchPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
