<template>
  <AsyncSearchTreeCard
    ref="treeRef"
    title="物联设备"
    placeholder="按设备名称搜索…"
    showLine
    :fieldNames="fieldNames"
    :loadRoot="loadRootTreeData"
    :loadChildren="queryDepartTreeSync"
    :getChildrenParams="getChildrenParams"
    :search="searchByKeywords"
    :getSearchParams="getSearchParams"
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
  const fieldNames = { children: 'children', title: 'deviceTypeName', value: 'id', key: 'id' };

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
