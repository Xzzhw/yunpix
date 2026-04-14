<template>
  <div>
    <a-modal v-model:open="visible" title="分享图片" :footer="false" @cancel="closeModal">
      <h4>复制图片链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <h4>手机扫码查看</h4>
      <div style="margin-bottom: 16px"></div>
      <a-qrcode
        :value="link"
        icon="https://s1.aigei.com/src/img/png/f6/f638c366875042a7887a39eed017a308.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:49UIBz9-6XQPge47aq55ua7bL34="
      ></a-qrcode>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref<boolean>(false)
interface Props {
  link: string
}
const props = withDefaults(defineProps<Props>(), {
  link: 'https://www.bilibili.com/',
})
const openModal = () => {
  visible.value = true
}
const closeModal = () => {
  visible.value = false
}
//暴露函数给父组件
defineExpose({
  openModal
})
</script>
