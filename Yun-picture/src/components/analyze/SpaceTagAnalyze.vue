<template>
  <div class="sapce-tag-analyze">
    <a-card title="空间图片标签分析">
      <TagWordCloud :data="tagDataList" :loading="loading" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { message } from 'ant-design-vue'
import TagWordCloud from './TagWordCloud.vue'
import { getSpaceTagAnalyzeUsingPost } from '@/api/spaceAnalyzeController'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const dataList = ref<API.SpaceTagAnalyzeResponse[]>([])
const loading = ref<boolean>(false)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceTagAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  })

  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 转换为 TagWordCloud 组件需要的数据格式
const tagDataList = computed(() => {
  return dataList.value
    .filter((item) => item.tag && item.count)
    .map((item) => ({
      tag: item.tag as string,
      count: item.count as number,
    }))
})

watchEffect(() => {
  fetchData()
})
</script>
