<template>
  <div class="detail-empty-state" :style="{ minHeight: `${minHeight}px` }">
    <a-empty :image="simpleImage" :description="description" />
  </div>
</template>

<script lang="ts" setup>
  import { Empty } from 'ant-design-vue';

  withDefaults(
    defineProps<{
      description?: string;
      minHeight?: number;
    }>(),
    {
      description: '暂无数据',
      minHeight: 220,
    }
  );

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
</script>

<style lang="less" scoped>
  .detail-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    border: 1px dashed #dbe5f1;
    border-radius: 12px;
    background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  }
</style>
