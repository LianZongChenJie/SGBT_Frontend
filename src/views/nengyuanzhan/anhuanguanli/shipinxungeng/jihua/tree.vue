<template>
  <a-tree-select
    v-model:value="selectedValue"
    :tree-data="processedTreeData"
    :field-names="fieldNames"
    placeholder="请选择（只能选择最后一级）"
    allow-clear
    :multiple="true"
    tree-default-expand-all
    @change="handleChange"
    @select="handleSelect"
    style="width: 400px"
  >
    <!-- 自定义标题显示，覆盖 disabled 默认的灰色样式 -->
    <template #title="nodeData">
      <span :class="{ 'parent-node-title': nodeData.disabled }">
        {{ nodeData.title }}
      </span>
    </template>
  </a-tree-select>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  dataSource: {
    type: Array,
    default: () => [],
  },
  // 默认字段映射
  fieldNames: {
    type: Object,
    default: () => ({ label: 'title', value: 'key', children: 'children' }),
  },
});

const emit = defineEmits(['onSelect']);

// 选中的值
const selectedValue = ref(undefined);

/**
 * 递归处理数据，给所有父节点添加 disabled: true
 */
const processTreeData = (data) => {
  if (!data) return [];
  // 获取字段映射名称
  const childKey = props.fieldNames.children || 'children';

  return data.map(item => {
    const newItem = { ...item };

    // 如果存在子节点，则认为是父级，设置为禁用（不可选）
    if (newItem[childKey] && newItem[childKey].length > 0) {
      newItem.disabled = true;
      // 递归处理子节点
      newItem[childKey] = processTreeData(newItem[childKey]);
    }

    return newItem;
  });
};

// 计算属性：处理后的树数据
const processedTreeData = computed(() => {
  return processTreeData(props.dataSource);
});

/**
 * 选中项改变时的回调
 * @param {String|Number} value 选中的 key
 * @param {String} label 选中的标题
 * @param {Array} extra 额外信息，包含 triggerNode (当前节点数据)
 */
const handleChange = (value, label, extra) => {
  // 如果清空
  if (!value) {
    emit('onSelect', null);
    return;
  }

  // extra.triggerNode 是当前选中的节点数据对象
  // 这里面包含了该节点在 treeData 中定义的所有属性
  if (extra && extra.triggerNode) {
    emit('onSelect', extra.triggerNode);
  }
};

/**
 * (可选) 点击节点时的拦截
 * 虽然 disabled 已经阻止了选中，但这里可以做双重保险
 */
const handleSelect = (value, node) => {
  if (node.disabled) {
    return false; // 阻止选中
  }
};
</script>

<style scoped>
/*
  样式核心：
  修复 disabled 节点在 AntD 中默认变灰的问题。
  我们希望父节点文字显示正常（黑色），只是在点击时无法被选中。
*/
:deep(.ant-select-tree-treenode-disabled .ant-select-tree-node-content-wrapper),
:deep(.ant-select-tree-treenode-disabled .ant-select-tree-node-content-wrapper span) {
  color: rgba(0, 0, 0, 0.85) !important; /* 恢复正常文字颜色 */
  cursor: pointer !important; /* 保持点击展开的手势 */
}

/*
  针对下拉菜单中选中的叶子节点（非禁用），保持高亮背景色
  (可选优化)
*/
:deep(.ant-select-tree-treenode-selected:not(.ant-select-tree-treenode-disabled) .ant-select-tree-node-content-wrapper) {
  background-color: #e6f7ff;
}
</style>
