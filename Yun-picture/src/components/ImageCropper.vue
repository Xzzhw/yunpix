<template>
  <a-modal
    class="image-cropper"
    v-model:open="visible"
    title="编辑图片"
    :footer="false"
    @cancel="closeModal"
  >
    <div class="cut">
      <!-- 图片裁切 -->
      <vue-cropper
        ref="cropperRef"
        :img="props.imageUrl"
        output-type="png"
        :info="true"
        :can-move-box="true"
        :fixed-box="false"
        :auto-crop="true"
        :center-box="true"
      ></vue-cropper>
    </div>
    <div style="margin-bottom: 16px"></div>
    <!-- 图片协同 -->
    <div v-if="isTeamtype" class="image-together-action">
      <a-space>
        <a-space>
          <a-button v-if="editUser" disabled>{{ editUser.userName }} 正在编辑</a-button>
          <a-button v-if="canenteredit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
          <a-button v-if="canoutedit" danger ghost @click="outEdit">退出编辑</a-button>
        </a-space>
      </a-space>
    </div>
    <!-- 图片操作 -->
    <div class="image-cropper-action">
      <a-space>
        <a-button @click="changeScale(1)" :disabled="!canEdit">放大</a-button>
        <a-button @click="changeScale(-1)" :disabled="!canEdit">缩小</a-button>
        <a-button @click="rotateLeft" :disabled="!canEdit">向左旋转</a-button>
        <a-button @click="rotateRight" :disabled="!canEdit">向右旋转</a-button>
        <a-button type="primary" @click="handelConfirm" :loading="loading">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'
import { useLoginUserstore } from '@/stores/useLoginUserstore'
import { use } from 'echarts'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket'
import { PICTURE_EDIT_MESSAGE_TYPE_ENUM, PICTURE_EDIT_ACTION_ENUM } from '@/constants/picture'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { SPACE_TYPE_ENUM } from '@/constants/sapce'
interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number | string
  space: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}
//是否为团队图片

const emits = defineEmits(['onSuccess'])
const cropperRef = ref()
const props = defineProps<Props>()
const isTeamtype = computed(() => {
  return props.space.spaceType === SPACE_TYPE_ENUM.TEAM
})
const changeScale = (num) => {
  num = num || 1
  cropperRef.value?.changeScale(num)
  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}
const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}
const rotateRight = () => {
  cropperRef.value?.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}
//确认裁剪
const handelConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已经裁切好的文件
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    //上传
    handleUpload(file)
  })
}
const visible = ref<boolean>(false)
const openModal = () => {
  visible.value = true
}
const closeModal = () => {
  visible.value = false
  websocket?.disconnect()
}
const loading = ref<boolean>(false)
const handleUpload = async (file: File) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPictureUsingPost(params, {}, file)
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
    console.error('图片上传失败 catch', error)
    message.error('图片上传失败，' + error.message)
  }
  loading.value = false
}
//暴露函数给父组件
defineExpose({
  openModal,
})
//实时编辑
const loginuserstore = useLoginUserstore()
const loginUser = loginuserstore.loginUser
const editUser = ref<API.UserVO>()
const canenteredit = computed(() => {
  return !editUser.value
})
//是否可退出
const canoutedit = computed(() => {
  if (!isTeamtype.value) {
    return true
  }
  return editUser.value?.id === loginUser.id
})
const canEdit = computed(() => {
  if (!isTeamtype.value) {
    return true
  }
  return editUser.value?.id === loginUser.id
})
//websocket
let websocket: PictureEditWebSocket | null
//初始化
const initwebsocket = () => {
  if (!isTeamtype.value) {
    return
  }
  const pictureId = props.picture?.id
  if (!pictureId || !visible.value) return
  //防止没有删除之前的 websocket
  if (websocket) {
    websocket.disconnect()
  }
  //创建新的 websocket 连接
  websocket = new PictureEditWebSocket(pictureId, loginUser.id)
  websocket.connect()
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    message.info(msg.message)
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    message.info(msg.message)
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    message.info(msg.message)
    editUser.value = msg.user
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    message.info(msg.message)
    editUser.value = undefined
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {

    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        changeScale(-1)
        break
    }
  })
}
watchEffect(() => {
  if (isTeamtype.value) {
    initwebsocket()
  }
})
//退出时
onMounted(() => {
  if (websocket) {
    websocket.disconnect()
  }
  editUser.value = undefined
})
const enterEdit = async () => {
  if (websocket) {
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}
// 退出编辑状态
const outEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 编辑图片操作
const editAction = (action: string) => {
  if (websocket) {
    // 发送编辑操作的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}
</script>

<style scoped>
.image-cropper {
  text-align: center;
}
.image-cropper .vue-cropper {
  min-height: 400px;
  min-width: 400px;
}
.image-cropper .image-cropper-action {
  text-align: center;
}
</style>
