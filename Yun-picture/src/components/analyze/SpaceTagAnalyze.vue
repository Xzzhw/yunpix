<template>
  <div class="sapce-tag-analyze">
    <a-card title="空间图片标签分析">
      <v-chart :option="options" style="height: 320px" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import VChart from 'vue-echarts'
// ✅ ECharts 已在 main.ts 中统一注册，无需重复导入
import { message } from 'ant-design-vue'
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
  // 转换搜索参数
  console.log(props)
  const res = await getSpaceTagAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  })
  console.log('API 响应:', res.data)

  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

const options = computed(() => {
  const tagData = dataList.value.map((item) => ({
    name: item.tag,
    value: item.count,
  }))
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}: ${params.value} 次`,
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 10,
        sizeRange: [12, 50], // 字体大小范围
        rotationRange: [-90, 90],
        shape: 'circle',
        textStyle: {
          color: () =>
            `rgb(${Math.round(Math.random() * 255)}, ${Math.round(
              Math.random() * 255,
            )}, ${Math.round(Math.random() * 255)})`, // 随机颜色
        },
        data: tagData,
      },
    ],
  }
})
watchEffect(() => {
  fetchData()
})
</script>