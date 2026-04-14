<template>
  <div class="url-picture-upload">
    <a-input-group compact>
      <a-input
        v-model:value="fileurl"
        style="width: calc(100% - 120px); height: 40px"
        placeholder="请输入图片地址"
      />
      <a-button
        type="primary"
        style="width: 120px; height: 40px"
        :loading="loading"
        @click="handleUpload"
        >Submit</a-button
      >
    </a-input-group>
    <img v-if="picture?.url" :src="picture.url" alt="avatar" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
// import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
// import type { UploadProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost} from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  spaceId?: number | string
  // onSuccess?: (newPicture: API.PictureVO) => void
}
const emits = defineEmits(['onSuccess'])
const props = defineProps<Props>()
const fileurl = ref<string>()

/**
 * 上传图片
 * @param file
 */
const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileurl.value }
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
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败catch', error)
  }
  loading.value = false
}

const loading = ref<boolean>(false)

/**
 * 上传前的校验
 * @param file
 */
// const beforeUpload = (file: UploadProps['fileList'][number]) => {
//   // 校验图片格式
//   const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
//   if (!isJpgOrPng) {
//     message.error('不支持上传该格式的图片，推荐 jpg 或 png')
//   }
//   // 校验图片大小
//   const isLt2M = file.size / 1024 / 1024 < 2
//   if (!isLt2M) {
//     message.error('不能上传超过 2M 的图片')
//   }
//   return isJpgOrPng && isLt2M
// }
</script>
<style scoped>
.url-picture-upload  {
  margin-bottom: 16px;

}

.url-picture-upload img {
  width: 100%;
  height: auto;
  min-height: 120px;
  max-height: 480px;
  object-fit: contain;
  display: block;
}

</style>
