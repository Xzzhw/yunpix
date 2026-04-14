<template>
  <a-card class="picture-card" hoverable @click="handleClick" :body-style="{ padding: 0 }">
    <img v-lazy="picture.thumbnailUrl ?? picture.url" :alt="picture.name"
      style="height: 200px; object-fit: cover; opacity: 0; transition: opacity 0.3s; background-color: #f0f0f0; display: block; width: 100%;" />

    <a-card-meta :title="picture.name" style="padding: 24px;">
      <template #description>
        <a-flex>
          <a-tag color="green">
            {{ picture.category ?? '默认' }}
          </a-tag>
          <a-tag v-for="tag in picture.tags" :key="tag">
            {{ tag }}
          </a-tag>
        </a-flex>
      </template>
    </a-card-meta>
    <template v-if="showOP" #actions>
      <ShareAltOutlined @click="(e) => handleAction('share', e)" />
      <SearchOutlined @click="(e) => handleAction('search', e)" />
      <EditOutlined v-if="canEdit" @click="(e) => handleAction('edit', e)" />
      <DeleteOutlined v-if="canDelete" @click="(e) => handleAction('delete', e)" />
    </template>
  </a-card>
</template>

<script setup lang="ts">
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { onMounted } from 'vue'

defineOptions({
  name: 'PictureCard',
})

onMounted(()=>
{
})
interface Props {
  picture: API.PictureVO
  showOP?: boolean
  canEdit?: boolean
  canDelete?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showOP: false,
  canEdit: false,
  canDelete: false,
})

const emit = defineEmits<{
  (e: 'click', picture: API.PictureVO): void
  (e: 'edit', picture: API.PictureVO): void
  (e: 'delete', picture: API.PictureVO): void
  (e: 'search', picture: API.PictureVO): void
  (e: 'share', picture: API.PictureVO): void
}>()
const handleClick = () => emit('click', props.picture)

const handleAction = (type: string, e: Event) => {
  e.stopPropagation()
  emit(type as any, props.picture)
}
</script>

<style scoped>
.picture-card {
  border-radius: 10px;
  overflow: hidden;
}
</style>
