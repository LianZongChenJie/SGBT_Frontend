<template>
  <a-card :bordered="false" style="height: 100%">
    <a-spin :spinning="loading">
      <a-input-search placeholder="按部门名称搜索…" style="margin-bottom: 10px" @search="onSearch" allowClear />
      <!--组织机构树-->
      <template v-if="treeData.length > 0">
        <a-tree
          v-if="!treeReloading"
          showLine
          :clickRowToExpand="false"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          v-model:expandedKeys="expandedKeys"
          @select="onSelect"
          :fieldNames="{ children: 'children', title: 'deviceTypeName', value: 'id', key: 'id' }"
        ></a-tree>
      </template>
      <a-empty v-else description="暂无数据" />
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
  import { inject, nextTick, ref } from 'vue';
  import { getTreeList } from '../demo.api';

  const prefixCls = inject('prefixCls');
  const emit = defineEmits(['select', 'rootTreeData']);

  const loading = ref<boolean>(false);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  const sourceTreeData = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys = ref<any[]>([]);
  // 树组件重新加载
  const treeReloading = ref<boolean>(false);
  // 当前选中的部门
  const currentDepart = ref<any>(null);
  // 搜索关键字
  const searchKeyword = ref('');

  // 加载顶级部门信息
  async function loadRootTreeData() {
    try {
      loading.value = true;
      treeData.value = [];
      const result = await getTreeList();
      if (Array.isArray(result)) {
        sourceTreeData.value = result;
        treeData.value = result;
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      }
    } finally {
      loading.value = false;
    }
  }

  loadRootTreeData();

  // 自动展开父节点，只展开一级
  function autoExpandParentNode() {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.id];
      }
      reloadTree();
    }
  }

  // 重新加载树组件，防止无法默认展开数据
  async function reloadTree() {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
  }

  /**
   * 设置当前选中的行
   */
  function setSelectedKey(key: string, data?: object) {
    selectedKeys.value = [key];
    if (data) {
      currentDepart.value = data;
      emit('select', data);
    }
  }

  function filterTreeNodes(nodes: any[], keyword: string): any[] {
    return nodes
      .map((node) => {
        const children = Array.isArray(node.children) ? filterTreeNodes(node.children, keyword) : [];
        const nodeName = String(node.deviceTypeName || node.label || '').toLowerCase();
        if (nodeName.includes(keyword) || children.length > 0) {
          return {
            ...node,
            children,
          };
        }
        return null;
      })
      .filter(Boolean) as any[];
  }

  // 搜索事件
  async function onSearch(value: string) {
    if (value) {
      try {
        loading.value = true;
        const keyword = value.trim().toLowerCase();
        treeData.value = filterTreeNodes(sourceTreeData.value, keyword);
        autoExpandParentNode();
      } finally {
        loading.value = false;
      }
    } else {
      loadRootTreeData();
    }
    searchKeyword.value = value;
  }

  // 树选择事件
  function onSelect(selKeys, event) {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0], event.selectedNodes[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0]);
    }
  }

  defineExpose({
    loadRootTreeData,
  });
</script>
