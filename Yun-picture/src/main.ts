import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// ✅ 已移除全量引入，由 unplugin-vue-components 自动按需引入
// import 'ant-design-vue/dist/reset.css'
// import Antd from 'ant-design-vue'
import '@/access'
// ✅ ECharts 按需引入配置（统一注册）
import '@/utils/echarts'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import lazyDirective from '@/utils/lazy'

const app = createApp(App)

app.directive('lazy', lazyDirective)
app.use(createPinia())
app.use(router)
// ✅ 已移除全量注册，组件将按需自动导入
// app.use(Antd)
app.use(VueCropper)
app.mount('#app')
