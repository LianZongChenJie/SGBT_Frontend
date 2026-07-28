<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" type="flex" :gutter="10">
    <a-col :xl="4" :lg="24" :md="24" style="margin-bottom: 10px">
      <DepartLeftTree @select="onTreeSelect" />
    </a-col>
    <a-col :xl="20" :lg="24" :md="24" style="margin-bottom: 10px">
      <div style="height: 100%" :class="[`${prefixCls}`]">
        <div v-if="hasDepartData" style="padding: 20px">
          <a-descriptions title="空间信息" bordered>
            <a-descriptions-item label="空间名称">{{ currentSpace.spaceName || '-' }}</a-descriptions-item>
            <a-descriptions-item label="CAD空间编码">{{ currentSpace.cadCode || '-' }}</a-descriptions-item>
            <a-descriptions-item label="空间编码">{{ currentSpace.spaceCode || '-' }}</a-descriptions-item>
            <a-descriptions-item label="连通空间">{{ currentSpace.connSpace || '-' }}</a-descriptions-item>
            <a-descriptions-item label="门名称">{{ currentSpace.doorName || '-' }}</a-descriptions-item>
            <a-descriptions-item label="空间用途">{{ currentSpace.spaceUsage || '-' }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ currentSpace.createTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ currentSpace.updateTime || '-' }}</a-descriptions-item>
          </a-descriptions>
          <div class="mt3">
            <img :src="imgUrl" alt="空间示意图" style="width: 100%; height: 300px" />
          </div>
        </div>
        <div v-else style="padding-top: 40px">
          <a-empty description="尚未选择空间" />
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup name="system-depart">
  import { computed, provide, ref } from 'vue';
  import { useDesign } from '/src/hooks/web/useDesign';
  import DepartLeftTree from './components/DepartLeftTree.vue';
  import imgUrl from '@/assets/images/ditu.png';

  const { prefixCls } = useDesign('depart-manage');
  provide('prefixCls', prefixCls);

  const departData = ref<Record<string, any> | null>(null);
  const hasDepartData = computed(() => !!departData.value);
  const currentSpace = computed(() => departData.value ?? {});

  function normalizeTreeNodeData(data: Record<string, any> | null) {
    return data?.dataRef ?? data ?? null;
  }

  function onTreeSelect(data) {
    departData.value = normalizeTreeNodeData(data);
  }
</script>

<style lang="less">
  @import 'index.less';
</style>
