<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between" style="margin-bottom: 16px">
      <a-space>
        <h2>{{ space.spaceName }}（{{ space.spaceType !== undefined ? SPACE_TYPE_MAP[space.spaceType] : '' }}）</h2>
      </a-space>
      <a-space size="middle">
        <a-button
          v-if="canUploadPicture"
          type="primary"
          :href="`/add_picture?spaceId=${id}`"
          target="_blank"
          >+ 创建图片</a-button
        >
        <a-button
          v-if="canManageSpaceUser"
          type="primary"
          ghost
          :icon="h(TeamOutlined)"
          :href="`/spaceUserManage/${id}`"
          target="_blank"
        >
          成员管理
        </a-button>
        <a-button
          v-id="canManageSpaceUser"
          type="primary"
          ghost
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${id}`"
          target="_blank"
        >
          空间分析
        </a-button>
        <a-button @click="doBatchEdit"> 批量编辑</a-button>
        <a-tooltip :title="`占用空间为${formatSize(space.totalSize)}/${formatSize(space.maxSize)}`">
          <a-progress
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
            :size="42"
            type="circle"
          ></a-progress>
        </a-tooltip>
      </a-space>
    </a-flex>
    <batch-edit-picture-modal
      ref="batchEditPictureModalRef"
      :spaceId="id"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureModalsuccess"
    />
    <picture-search-form :onSearch="onsearch" />
    <!-- 颜色搜图 -->
    <a-form-item label="颜色搜索" style="margin: 16px 0">
      <color-picker format="hex" @pure-color-change="oncolorchange" />
    </a-form-item>
    <picture-list
      :data-list="dataList"
      :loading="loading"
      :showOP="true"
      :onReload="fetchData"
      :canEdit="canEditPicture"
      :canDelete="canDeletePicture"
    ></picture-list>
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="handlePageChange"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive, h, watchEffect, watch, computed,defineAsyncComponent } from 'vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { searchPictureByColorUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { useLoginUserstore } from '@/stores/useLoginUserstore'
import { formatSize } from '@/utils'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import 'vue3-colorpicker/style.css'
// import { ColorPicker } from 'vue3-colorpicker'
// import PictureList from '@/components/PictureList.vue'
// import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { BarChartOutlined,TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_TYPE_MAP, SPACE_PERMISSION_ENUM } from '@/constants/sapce'
const PictureList = defineAsyncComponent(
  () => import('@/components/PictureList.vue')
)
const BatchEditPictureModal = defineAsyncComponent(
  () => import('@/components/BatchEditPictureModal.vue')
)
const ColorPicker = defineAsyncComponent(
  () => import('vue3-colorpicker').then((module) => ({ default: module.ColorPicker }))
)
interface Props {
  id: string | number
}
//定义权限
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

const props = defineProps<Props>()
const picture = ref<API.PictureVO>({})
const user = picture.value.user || {}
const loginuserstore = useLoginUserstore()
const loginUSer = loginuserstore.loginUser

//获取图片列表
const total = ref<number>(0)
const loading = ref<boolean>(true)
const elements = ref<HTMLElement[]>([])
const dataList = ref<API.PictureVO[]>([])
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'ascend',
})
//获取空间数据
const space = ref<API.SpaceVO>({})
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}
onMounted(() => {
  fetchSpaceDetail()
})

//获取图片数据
const fetchData = async () => {
  const params = {
    spaceId: props.id,
    ...searchParams.value,
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
const oncolorchange = async (color: string) => {
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
    total.value = res.data.data.length
  } else {
    message.error('获取颜色搜索失败，' + res.data.message)
  }
}
//分页器
const handlePageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}
const onsearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}
const batchEditPictureModalRef = ref()
const onBatchEditPictureModalsuccess = () => {
  fetchData()
}
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}
onMounted(async () => {
  await getTagCategoryOptions()
  await fetchData()
})
// watchEffect(() => {
//    getTagCategoryOptions()
//    fetchData()
// })
watch(
  () => props.id,
  () => {
    getTagCategoryOptions()
    fetchData()
  },
)
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 16px;
}
</style>
