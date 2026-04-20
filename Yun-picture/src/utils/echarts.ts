// src/utils/echarts.ts

import { use } from 'echarts/core'

// 渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 图表
import { BarChart, LineChart, PieChart } from 'echarts/charts'
// 注册词云图（side effect import，自动注册到 echarts）
import 'echarts-wordcloud'
// 组件
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'

// 关键：只注册用到的
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// 👇 用 VChart（推荐命名）
import VChart from 'vue-echarts'


// 👇 只导出组件（不要导出 echarts 实例）
export default VChart
