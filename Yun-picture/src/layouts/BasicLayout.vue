<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"><GLobalHeader /></a-layout-header>
      <a-layout>
        <GLobalSider class="sider"></GLobalSider>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">by Xxxh</a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GLobalHeader from '@/components/GLobalHeader.vue'
import GLobalSider from '@/components/GLobalSider.vue'
</script>
<style scoped>
#basicLayout .footer {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  color: #495057;
  padding: 16px 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-top: 1px solid #dee2e6;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

#basicLayout .content {
  padding: 28px;
  padding-bottom: 60px; /* 为固定 footer 预留空间，防止遮挡分页器 */
  background-color: linear-gradient(to right, #efefef, #ffffff);
  min-height: calc(100vh - 120px); /* 减去 header 和 footer 的高度 */
}

#basicLayout .header {
  background-color: #ffffff;
  color: black;
  margin-bottom: 1px;
}

#basicLayout .sider {
  padding-top: 20px;
  background-color: #fff;
  border-right: 0.5px solid #eee;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}
#basicLayout .footer{
  padding-bottom: 16px;
}
#basicLayout :deep(.ant-layout-header) {
  padding: 0;
}
</style>
