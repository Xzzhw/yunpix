import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    process.env.NODE_ENV === 'production' ? null : vueDevTools(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // 确保你在 main.js 手动引入了 css
        }),
      ],
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginalAssets: false,
    }),
    process.env.NODE_ENV === 'production'
      ? visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
          filename: 'dist/stats.html',
        })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // 优化：给 chunk 加上 hash，利用浏览器长缓存
        chunkFileNames: 'js/chunk-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          echarts: ['echarts', 'echarts-wordcloud', 'vue-echarts'],
          validator: ['async-validator'],
          lodash: ['lodash-es'],
          resizeObserver: ['resize-observer-polyfill'],
          antd: ['ant-design-vue'],
        },
      },
    },
  },
})
