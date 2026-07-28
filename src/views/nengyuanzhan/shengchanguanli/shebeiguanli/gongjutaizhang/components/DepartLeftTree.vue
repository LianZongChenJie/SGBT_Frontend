<template>
  <AsyncSearchTreeCard
    ref="treeRef"
    placeholder="按工具分类名称搜索…"
    showLine
    :fieldNames="fieldNames"
    :loadRoot="loadRootTreeData"
    :search="searchTreeData"
    :getSearchParams="getSearchParams"
    @select="handleSelect"
    @rootTreeData="handleRootTreeData"
  />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import AsyncSearchTreeCard from '@/views/nengyuanzhan/components/AsyncSearchTreeCard.vue';
  import { getTreeList } from '../demo.api';

  const emit = defineEmits(['select', 'rootTreeData']);

  const treeRef = ref();
  const fieldNames = { children: 'children', title: 'deviceTypeName', value: 'id', key: 'id' };

  type TreeNode = Record<string, any>;

  async function loadRootTreeData() {
    const result = await getTreeList();
    return Array.isArray(result) ? result : [];
  }

  async function searchTreeData(params?: Record<string, unknown>) {
    const treeData = await loadRootTreeData();
    const keyword = String(params?.keyWord ?? '').trim();
    if (!keyword) {
      return treeData;
    }

    return filterTreeNodes(treeData, keyword);
  }

  function filterTreeNodes(treeData: TreeNode[], keyword: string): TreeNode[] {
    return treeData.reduce<TreeNode[]>((result, node) => {
      const nodeName = String(node.deviceTypeName ?? '');
      const children = Array.isArray(node.children) ? filterTreeNodes(node.children, keyword) : [];
      if (nodeName.includes(keyword) || children.length > 0) {
        result.push({
          ...node,
          children,
        });
      }
      return result;
    }, []);
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
