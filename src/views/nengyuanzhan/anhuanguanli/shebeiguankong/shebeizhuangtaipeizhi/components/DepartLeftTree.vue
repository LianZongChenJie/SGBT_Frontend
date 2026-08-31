<template>
  <AsyncSearchTreeCard
    ref="treeRef"
    placeholder="按部门名称搜索…"
    showLine
    :loadRoot="loadRootTreeData"
    :loadChildren="queryDepartTreeSync"
    :getChildrenParams="getChildrenParams"
    :search="searchByKeywords"
    :getSearchParams="getSearchParams"
    :emitRootTreeData="true"
    @select="handleSelect"
    @rootTreeData="handleRootTreeData"
  />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import AsyncSearchTreeCard from '@/views/nengyuanzhan/components/AsyncSearchTreeCard.vue';
  import { queryDepartTreeSync, searchByKeywords } from '../demo.api';

  const emit = defineEmits(['select', 'rootTreeData']);

  const treeRef = ref();

  function loadRootTreeData() {
    return queryDepartTreeSync();
  }

  function getChildrenParams(treeNode) {
    return { pid: treeNode.dataRef.id };
  }

  function getSearchParams(value: string) {
    return { keyWord: value };
  }

  function handleSelect(data) {
    emit('select', data);
  }

  function handleRootTreeData(data) {
    emit('rootTreeData', data);
  }

  defineExpose({
    loadRootTreeData: () => treeRef.value?.loadRootTreeData(),
  });
</script>
