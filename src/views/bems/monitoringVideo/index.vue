<template>
  <div class="monitoring-video-main-box">
    <a-tabs v-model:activeKey="activeTab" class="monitoring-video-tabs">
      <a-tab-pane key="view" tab="监控查看">
        <MonitorView />
      </a-tab-pane>
      <a-tab-pane key="list" tab="监控列表">
        <CameraList />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import MonitorView from './components/MonitorView.vue';
  import CameraList from './components/CameraList.vue';

  // 当前激活的页签
  const activeTab = ref('view');
</script>

<style scoped lang="less">
  .monitoring-video-main-box {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0;
    // 页面整体灰色背景（参考监控源页面内容区 #f0f2f5），仅模块内容保持白色
    background-color: #f0f2f5;

    .monitoring-video-tabs {
      height: 100%;

      // 页签栏保持白色，与灰色内容区区分
      :deep(.ant-tabs-nav) {
        margin: 0;
        padding: 0 16px;
        background: #fff;
      }

      // 内容区为灰色，模块卡片自带白色背景
      :deep(.ant-tabs-content-holder) {
        overflow: auto;
        padding: 16px;
      }
    }
  }
</style>
