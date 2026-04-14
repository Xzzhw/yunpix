<template>
  <a-modal
    class="image-out-paiting"
    v-model:open="visible"
    title="AI扩图图片"
    :footer="false"
    @cancel="closeModal"
  >
    <a-row gutter="16" style="margin-bottom: 16px">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="props.picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col span="12">
        <h4>扩图结果</h4>
        <img v-if="resultImageUrl" :src="resultImageUrl" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
    </a-row>
    <a-flex justify="center" gap="16">
      <a-button type="primary" ghost @click="createTask" :loading="!!taskId">生成图片</a-button>
      <a-button type="primary" @click="handleUpload" :loading="loading">保存结果</a-button>
    </a-flex>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getPictureOutPaintingTaskUsingGet, uploadPictureUsingPost } from '@/api/pictureController'
import { createPictureOutPaintingTaskUsingPost } from '@/api/pictureController'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController'
interface Props {
  picture?: API.PictureVO
  spaceId?: number
}
const props = defineProps<Props>()
onMounted(() => {

})
const emits = defineEmits(['onSuccess'])
const visible = ref<boolean>(false)
const openModal = () => {
  visible.value = true
}
const closeModal = () => {
  visible.value = false
}
const taskId = ref<string | null>()
//创建任务
const createTask = async () => {
  if (!props.picture?.id) return
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    // 根据需要设置扩图参数
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待，不要退出界面')
    taskId.value = res.data.data.output.taskId
    // 开启轮询 获取任务状态
    startPolling()
  } else {
    message.error('图片任务失败，' + res.data.message)
    loading.value = false
  }
}
let pollingTimer: NodeJS.Timeout = null
const startPolling = () => {
  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult.outputImageUrl
          // 清理轮询
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务执行失败')
          // 清理轮询
          clearPolling()
        }
      }
    } catch (error) {
      console.error('扩图任务轮询失败', error)
      message.error('扩图任务轮询失败，' + error.message)
      // 清理轮询
      clearPolling()
    }
  }, 3000)
}
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    taskId.value = null
    pollingTimer = null
  }
}
const loading = ref<boolean>(false)
const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
      params.spaceId = props.spaceId
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件  自己改为了自定义事件
      //props.onSuccess?.(res.data.data)
      emits('onSuccess', res.data.data)
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败catch', error)
  }
  loading.value = false
}
//扩图结果
const resultImageUrl = ref<string>()
//暴露函数给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.image-out-paiting {
  text-align: center;
}
</style>
