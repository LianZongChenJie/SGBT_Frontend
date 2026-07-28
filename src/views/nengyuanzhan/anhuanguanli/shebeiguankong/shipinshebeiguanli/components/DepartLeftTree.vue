<template>
  <AsyncSearchTreeCard
    ref="treeRef"
    placeholder="按设备名称搜索…"
    :fieldNames="fieldNames"
    :loadRoot="loadRootTreeData"
    :search="getTreeListDeviceTree"
    :getSearchParams="getSearchParams"
    :emitRootTreeData="true"
    @select="handleSelect"
    @rootTreeData="handleRootTreeData"
  />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import AsyncSearchTreeCard from '@/views/nengyuanzhan/components/AsyncSearchTreeCard.vue';
  import { getTreeListDeviceTree } from '../demo.api';

  const emit = defineEmits(['select', 'rootTreeData']);

  const treeRef = ref();
  const fieldNames = { children: 'children', title: 'title', value: 'key', key: 'key' };

  function loadRootTreeData() {
    return getTreeListDeviceTree();
  }

  function getSearchParams(value: string) {
    return { title: value };
  }

  function handleSelect(data) {
    emit('select', data);
  }

  function handleRootTreeData(data) {
    emit('rootTreeData', data);
  }

  defineExpose({
    loadRootTreeData: () => treeRef.value?.loadRootTreeData(),
    setSelectedNode: (data, shouldEmit = true) => treeRef.value?.setSelectedNode(data, shouldEmit),
  });
</script>
