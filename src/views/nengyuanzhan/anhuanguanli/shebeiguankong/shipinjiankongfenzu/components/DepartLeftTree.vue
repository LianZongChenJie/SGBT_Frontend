<template>
  <AsyncSearchTreeCard
    ref="treeRef"
    placeholder="按视频分组名称搜索…"
    :fieldNames="fieldNames"
    :loadRoot="loadRootTreeData"
    :search="loadSearchTreeData"
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
  const fieldNames = { children: 'children', title: 'groupName', value: 'id', key: 'id' };

  function normalizeTreeData(data) {
    return Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          isLeaf: true,
          children: undefined,
        }))
      : [];
  }

  async function loadRootTreeData() {
    const result = await queryDepartTreeSync();
    return normalizeTreeData(result);
  }

  async function loadSearchTreeData(params) {
    const result = await searchByKeywords(params);
    return normalizeTreeData(result);
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
