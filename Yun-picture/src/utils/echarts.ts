/**
 * ECharts 按需引入配置
 * 集中注册所有需要的图表类型、组件和渲染器
 */
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

// 图表类型
import { BarChart, LineChart, PieChart } from 'echarts/charts'

// 组件
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'

// 注册必须的模块
use([
  // 渲染器
  CanvasRenderer,
  
  // 图表类型
  BarChart,    // 柱状图
  LineChart,   // 折线图
  PieChart,    // 饼图
  
  // 组件
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// 词云图需要单独导入（第三方扩展）
import 'echarts-wordcloud'
