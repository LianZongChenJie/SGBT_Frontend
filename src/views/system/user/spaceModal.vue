<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="空间绑定"
    @ok="handleSubmit"
    :width="600"
    :height="600"
    :z-index="10000"
    @cancel="closeModalHandle"
  >
    <a-directory-tree
      v-model:expandedKeys="expandedKeys"
      v-model:checkedKeys="checkedKeys"
      multiple
      checkable
      :checkStrictly="true"
      :tree-data="treeData"
      :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
    ></a-directory-tree>
  </BasicModal>
</template>
<script lang="ts" setup>
  import type { TreeProps } from 'ant-design-vue';
  import BasicModal from '@/components/Modal/src/BasicModal.vue';
  import { useModalInner } from '@/components/Modal';
  import { ref } from 'vue';
  import { getTreeData, saveTreeData } from './user.api';
  const expandedKeys = ref<string[]>([]);
  const checkedKeys = ref<{ checked: string[] }>({ checked: [] });
  const treeData = ref<TreeProps['treeData']>([]);
  const id = ref<Number>();
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ loading: true });
    checkedKeys.value.checked = [];
    expandedKeys.value = [];
    treeData.value = [];
    id.value = data.record.id;
    getTreeDataHandle();
  });
  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveTreeData({ id: id.value, ids: checkedKeys.value.checked });
      //关闭弹窗
      closeModal();
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
  async function getTreeDataHandle() {
    const res = await getTreeData({ id: id.value });
    const processTreeData = (nodes, level = 1) => {
      return nodes.map((node) => {
        const newNode = { ...node };
        // 只在第四层显示复选框
        newNode.checkable = newNode.type === '建筑';

        if (newNode.children && newNode.children.length > 0) {
          newNode.children = processTreeData(newNode.children, level + 1);
        }

        return newNode;
      });
    };

    // 处理数据
    treeData.value = processTreeData(res);
    checkedKeys.value.checked = [];
    expandedKeys.value = [];

    // 获取选中节点及其所有父节点
    const { checkedIds, expandedIds } = findCheckedAndExpanded(treeData.value);
    checkedKeys.value.checked = checkedIds;
    expandedKeys.value = Array.from(new Set([...expandedKeys.value, ...expandedIds]));
    if (res && res.length > 0 && expandedKeys.value.length === 0) {
      expandedKeys.value.push(res[0].id);
    }
    setModalProps({ loading: false });
  }
  function findCheckedAndExpanded(nodes, parentIds = []) {
    const checkedIds: string[] = [];
    const expandedIds: string[] = [];

    for (const node of nodes) {
      const currentPath = [...parentIds, node.id];

      if (node.checked) {
        checkedIds.push(node.id);
        expandedIds.push(...parentIds); // 展开所有父节点
      }

      if (node.children && node.children.length > 0) {
        const childResult = findCheckedAndExpanded(node.children, currentPath);
        checkedIds.push(...childResult.checkedIds);
        expandedIds.push(...childResult.expandedIds);
      }
    }

    return { checkedIds, expandedIds };
  }
  function closeModalHandle() {
    expandedKeys.value = [];
  }
</script>
