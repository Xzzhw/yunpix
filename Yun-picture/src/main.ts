import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import '@/access'
import VChart from './utils/echarts' // 引入配置好的组件
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import lazyDirective from '@/utils/lazy'

const app = createApp(App)
app.component('v-chart', VChart)
app.directive('lazy', lazyDirective)
app.use(createPinia())
app.use(router)
app.use(VueCropper)
app.mount('#app')
