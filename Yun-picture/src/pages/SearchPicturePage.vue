<template>
  <div id="searchpicturePage">
    <h2>以图搜图</h2>
    <a-card title="图片预览" style="width: 360px">
      <div style="text-align: center">
        <a-image :src="picture.url" style="width: 240px; object-fit: contain" />
      </div>
    </a-card>
    <h3 style="margin: 16px 0">识图结果</h3>
    <!-- 图片结果列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a :href="picture.fromUrl" target="_blank">
            <!-- 单张图片 -->
            <a-card hoverable>
              <template #cover>
                <img
                  :alt="picture.name"
                  :src="picture.thumbUrl"
                  style="height: 180px; object-fit: cover "
                />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  deletePictureUsingPost,
  getPictureVoByIdUsingGet,
  searchPictureByPictureUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { downloadImage, formatSize, toHexColor } from '@/utils'
const route = useRoute()
const pictureId = computed(() => route.query?.pictureId)
const picture = ref<API.PictureVO>({})
const loading = ref<boolean>(false)
//获取搜图结果
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('后端获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  }
}
const dataList = ref<API.ImageSearchResult[]>()
const fetchPictureData = async () => {
  try {
    loading.value = true
    const res = await searchPictureByPictureUsingPost({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
      loading.value = false
    } else {
      loading.value = false
      message.error('搜索获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    loading.value = false
    message.error('搜索图片详情失败：' + e.message)
  }
}
onMounted(() => {
  fetchPictureDetail()
  fetchPictureData()
})
</script>

<style scoped>
</style>
