import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// 1. 引入压缩插件
import { compression } from 'vite-plugin-compression2'

// 2. 引入打包分析插件
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 生产环境禁用 devtools
    process.env.NODE_ENV === 'production' ? null : vueDevTools(),
    // Ant Design Vue 按需加载
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false,
        }),
      ],
    }),
    // 3. 配置 Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginalAssets: false,
    }),
    // 4. 配置 Visualizer 分析工具
    // 只在生产环境打包时生成报告，避免影响开发环境速度
    process.env.NODE_ENV === 'production'
      ? visualizer({
          open: true, // 打包完成后自动打开浏览器
          gzipSize: true, // 显示 Gzip 压缩后的大小（关键指标）
          brotliSize: true, // 显示 Brotli 压缩后的大小
          filename: 'dist/stats.html', // 报告保存位置
        })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false, // 关闭源码映射，减小体积
    // 使用默认的代码分割策略
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
    minify: 'esbuild',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 2000,
  },
})
