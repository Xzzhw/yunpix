<template>
  <div id="HomePage">
    <!-- 搜索 -->
    <div class="searchBar">
      <a-input-search v-model:value="searchParams.searchText" placeholder="从海量库中搜索" enter-button="Search" size="large"
        @search="doSearch" />
    </div>
    <!-- 标签和分类 -->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane tab="全部" key="all" />
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag v-for="(tag, index) in tagList" :key="tag" v-model:checked="selectedTagList[index]"
          @change="doSearch">
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <picture-list :data-list="dataList" :loading="loading" :showOP="false"></picture-list>
    <!-- 分页器 -->
    <a-pagination style="text-align: right" v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize" :total="total" @change="handlePageChange" />
  </div>
</template>

<script setup lang="ts">
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue'
const router = useRouter()
const total = ref(0)
const dataList = ref<API.PictureVO[]>([])
const loading = ref<boolean>(true)
const elements = ref<HTMLElement[]>([])
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'ascend',
})
const handlePageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}


const fetchData = async () => {
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  loading.value = true
  elements.value = []

  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
    loading.value = false
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}
// 标签和分类列表
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])
/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? []
    categoryList.value = res.data.data.categoryList ?? []
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

onMounted(async () => {
  await getTagCategoryOptions()
  await fetchData()
})
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}
</script>

<style scoped>
#Homepage {}

.searchBar {
  max-width: 480px;
  margin: 0 auto;
  margin-bottom: 16px;
}

.tag-bar {
  margin-bottom: 16px;
}
</style>
