<template>
  <v-chart :option="options" :style="{ height: typeof height === 'number' ? `${height}px` : height }" :loading="loading"></v-chart>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import 'echarts-wordcloud'

interface TagData {
  tag: string
  count: number
}

interface Props {
  data: TagData[]
  loading?: boolean
  height?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: '320px',
})

const options = computed(() => {
  const tagData = props.data.map((item) => ({
    name: item.tag,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number }) => `${params.name}: ${params.value} 次`,
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 10,
        sizeRange: [12, 50],
        rotationRange: [-90, 90],
        shape: 'circle',
        textStyle: {
          color: () =>
            `rgb(${Math.round(Math.random() * 255)}, ${Math.round(
              Math.random() * 255,
            )}, ${Math.round(Math.random() * 255)})`,
        },
        data: tagData,
      },
    ],
  }
})
</script>
