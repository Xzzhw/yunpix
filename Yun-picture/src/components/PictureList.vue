<template>
  <div class="picture-list">
    <!-- 图片列表 -->
    <a-list :grid="{ gutter: 15, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }" :data-source="dataList" :loading="loading"
      style="margin-bottom: 10px">
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0" :key="picture.id">
          <Picturecard :picture="picture" :showOP="showOP" :canEdit="canEdit" :canDelete="canDelete" @click="doclickpicture" @edit="doEdit"
            @delete="doDelete" @search="doSearch" @share="doShare" />
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="ShareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import ShareModal from './ShareModal.vue'
import Picturecard from './Picturecard.vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOP?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOP: false,
  canEdit: false,
  canDelete: false,
})
onMounted(()=>{

})
//点击图片详细信息
const router = useRouter()
const doclickpicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 编辑
const doEdit = (picture: API.PictureVO) => {
  // 跳转时一定要携带 spaceId
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除数据
const doDelete = async (picture: API.PictureVO) => {
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}
const doSearch = async (picture: API.PictureVO) => {
  window.open(`/search_picture?pictureId=${picture.id}`)
}
//分享
const ShareModalRef = ref()
const shareLink = ref<string>()
const doShare = async (picture: API.PictureVO) => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (ShareModalRef.value) {
    ShareModalRef.value.openModal()
  }
}

</script>
