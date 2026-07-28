<template>
  <a-card :bordered="false" style="height: 100%">
    <h2 v-if="title">{{ title }}</h2>
    <a-spin :spinning="loading">
      <a-input-search :placeholder="placeholder" style="margin-bottom: 10px" allowClear @search="onSearch" />
      <template v-if="treeData.length > 0">
        <a-tree
          v-if="!treeReloading"
          :showLine="showLine"
          :clickRowToExpand="false"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          :load-data="loadChildren ? loadChildrenTreeData : undefined"
          :fieldNames="fieldNames"
          v-model:expandedKeys="expandedKeys"
          @select="onSelect"
        />
      </template>
      <a-empty v-else :description="emptyDescription" />
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, ref } from 'vue';

  type TreeNode = Record<string, any>;
  type QueryParams = Record<string, any>;
  type TreeLoader = (params?: QueryParams) => Promise<TreeNode[]>;
  type QueryBuilder = (value: any) => QueryParams;

  interface Props {
    title?: string;
    placeholder: string;
    showLine?: boolean;
    fieldNames?: Record<string, string>;
    emptyDescription?: string;
    loadRoot: TreeLoader;
    loadChildren?: TreeLoader;
    getChildrenParams?: QueryBuilder;
    search: TreeLoader;
    getSearchParams: (keyword: string) => QueryParams;
    emitRootTreeData?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    showLine: false,
    fieldNames: undefined,
    emptyDescription: '暂无数据',
    loadChildren: undefined,
    getChildrenParams: undefined,
    emitRootTreeData: false,
  });

  const emit = defineEmits(['select', 'rootTreeData']);

  const loading = ref(false);
  const treeData = ref<TreeNode[]>([]);
  const expandedKeys = ref<Array<string | number>>([]);
  const selectedKeys = ref<Array<string | number>>([]);
  const treeReloading = ref(false);
  const currentNode = ref<TreeNode | null>(null);

  const keyField = computed(() => props.fieldNames?.key || 'key');

  function getNodeKey(node?: TreeNode | null) {
    return node?.[keyField.value];
  }

  function findNodeByKey(nodes: TreeNode[] = [], key?: string | number): TreeNode | null {
    if (key === undefined) {
      return null;
    }

    for (const node of nodes) {
      if (getNodeKey(node) === key) {
        return node;
      }

      const childNode = findNodeByKey(Array.isArray(node.children) ? node.children : [], key);
      if (childNode) {
        return childNode;
      }
    }

    return null;
  }

  function getSelectedNode(selKeys: Array<string | number>, event: Record<string, any>) {
    const selectedKey = selKeys[0];
    return findNodeByKey(treeData.value, selectedKey) || event.node?.dataRef || event.selectedNodes?.[0] || null;
  }

  function emitLoadedRootTreeData() {
    if (props.emitRootTreeData) {
      emit('rootTreeData', treeData.value);
    }
  }

  async function loadRootTreeData() {
    try {
      loading.value = true;
      treeData.value = [];
      const result = await props.loadRoot();
      treeData.value = Array.isArray(result) ? result : [];
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      }
      emitLoadedRootTreeData();
    } finally {
      loading.value = false;
    }
  }

  async function loadChildrenTreeData(treeNode: { dataRef?: TreeNode }) {
    if (!props.loadChildren || !props.getChildrenParams) {
      return Promise.resolve();
    }

    try {
      const result = await props.loadChildren(props.getChildrenParams(treeNode));
      const children = Array.isArray(result) ? result : [];

      if (children.length === 0) {
        treeNode.dataRef!.isLeaf = true;
      } else {
        treeNode.dataRef!.children = children;
        if (expandedKeys.value.length > 0) {
          const nextExpandedKeys = expandedKeys.value.filter((key) => children.findIndex((item) => getNodeKey(item) === key) !== -1);
          if (nextExpandedKeys.length > 0) {
            expandedKeys.value = [...expandedKeys.value];
          }
        }
      }

      treeData.value = [...treeData.value];
      emitLoadedRootTreeData();
    } catch (error) {
      console.error(error);
    }

    return Promise.resolve();
  }

  function autoExpandParentNode() {
    const item = treeData.value[0];
    const itemKey = getNodeKey(item);

    if (!item) {
      return;
    }

    if (!item.isLeaf && itemKey !== undefined) {
      expandedKeys.value = [itemKey];
    }

    reloadTree();
  }

  async function reloadTree() {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
  }

  function setSelectedNode(data?: TreeNode | null, shouldEmit = true) {
    const key = getNodeKey(data);
    if (key === undefined || data == null) {
      return;
    }

    selectedKeys.value = [key];
    currentNode.value = data;

    if (shouldEmit) {
      emit('select', data);
    }
  }

  async function onSearch(value: string) {
    if (!value) {
      await loadRootTreeData();
      return;
    }

    try {
      loading.value = true;
      treeData.value = [];
      const result = await props.search(props.getSearchParams(value));
      treeData.value = Array.isArray(result) ? result : [];
      autoExpandParentNode();
      emitLoadedRootTreeData();
    } finally {
      loading.value = false;
    }
  }

  function onSelect(selKeys: Array<string | number>, event: Record<string, any>) {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedNode(getSelectedNode(selKeys, event));
      return;
    }

    if (selectedKeys.value.length > 0) {
      setSelectedNode(currentNode.value || getSelectedNode(selKeys, event));
    }
  }

  onMounted(() => {
    loadRootTreeData();
  });

  defineExpose({
    loadRootTreeData,
    setSelectedNode,
  });
</script>
