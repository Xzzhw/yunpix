<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '修改图片' : '创建图片' }}</h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>
    <!-- 选择上传方式 -->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" @onSuccess="onSuccess" :spaceId="spaceId" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL上传" force-render
        ><UrlPictureUpload
          :picture="picture"
          @onSuccess="onSuccess"
          :spaceId="spaceId"
        ></UrlPictureUpload>
      </a-tab-pane>
    </a-tabs>
    <!-- 图片编辑 -->
    <div v-if="picture" class="edit-bar">
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :spaceId="spaceId"
        :picture="picture"
        :space="space"
        @onSuccess="oneditSuccess"
      ></ImageCropper>
      <a-space><a-button type="primary" @click="doEditpicture" ghost>编辑图片</a-button></a-space>
      <a-space> <a-button type="primary" @click="doImagepainting">AI编辑图片</a-button></a-space>
      <ImageOutPaiting
        ref="imagepaintRef"
        :picture="picture"
        @onSuccess="onPaintsuccess"
      ></ImageOutPaiting>
    </div>

    <!-- 使用url上传组件 -->

    <a-form v-if="picture" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :rows="2"
          autoSize
          allowClear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">提交</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import ImageCropper from '@/components/ImageCropper.vue'
import ImageOutPaiting from '@/components/ImageOutPaiting.vue'
import PictureUpload from '@/components/PictureUpload.vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { message } from 'ant-design-vue'
import { reactive, ref, onMounted, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
//路由跳转
const router = useRouter()
//获取路由信息
const route = useRoute()
const picture = ref<API.PictureVO>()
//图片表单
const pictureForm = reactive<API.PictureEditRequest>({})
const uploadType = ref<'file' | 'url'>('file')
const spaceId = computed(() => route.query.spaceId)
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}
const handleSubmit = async (values: any) => {
  console.log(values)
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/add_picture?id=${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}
const categoryOptions = ref<object[]>([])
const tagOptions = ref<object[]>([])
//获取标签和分类
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}
//在绑定dom节点的时候执行
onMounted(() => {
  getTagCategoryOptions()
  getOldpicture()
})

const getOldpicture = async () => {
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}
//获取弹窗
const imageCropperRef = ref()
const doEditpicture = () => {
  imageCropperRef.value?.openModal()
}
//编辑成功
const oneditSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
// 图片扩图
const imagepaintRef = ref()
const doImagepainting = () => {
  imagepaintRef.value.openModal()
}
const onPaintsuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
const space = ref<API.SpaceVO>({})
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})
</script>

<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
.edit-bar {
  text-align: center;
  margin: 16px 0;
}
</style>
