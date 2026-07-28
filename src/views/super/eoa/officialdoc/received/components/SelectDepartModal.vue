<!--部门选择框-->
<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @register="register"
      title="部门选择"
      :width="500"
      :height="500"
      @ok="handleOk"
      destroyOnClose
      @visible-change="visibleChange"
      @cancel="handleCancel"
    >
      <BasicTree
        :showButton="true"
        checkable
        :clickRowToExpand="false"
        ref="treeRef"
        :treeData="treeData"
        :checkStrictly="true"
        :checkedKeys="checkedKeys"
        @select="onSelect"
        @check="onCheck"
      />
    </BasicModal>
  </div>
</template>
<script lang="ts">
  import { defineComponent, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { queryTreeList } from '/@/api/common/api';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { BasicTree } from '/@/components/Tree';
  import { useTreeBiz } from './useTreeBiz';

  export default defineComponent({
    name: 'DeptSelectModal',
    components: {
      BasicModal,
      BasicTree,
    },
    props: {
      //回传value字段名
      rowKey: {
        type: String,
        default: 'id',
      },
      //回传文本字段名
      labelKey: {
        type: String,
        default: 'departName',
      },
      //主键字段
      primaryKey: {
        type: [String],
        default: 'id',
      },
      //title字段
      titleKey: {
        type: [String],
        default: 'title',
      },
    },
    emits: ['register', 'departOk'],
    setup(props, { emit, refs }) {
      //注册弹框
      const [register, { closeModal }] = useModalInner();
      const attrs = useAttrs();
      const getBindValue = Object.assign({}, unref(props), unref(attrs));
      const [{ checkedKeys, treeData, visibleChange, onSelect, onCheck, getSelectTreeData, cancel }] = useTreeBiz(queryTreeList, getBindValue);
      /**
       * 确定选择
       */
      function handleOk() {
        getSelectTreeData((options, values) => {
          //回传选项和已选择的值
          emit('departOk', options, values);
          //关闭弹窗
          closeModal();
        });
      }

      function handleCancel() {
        cancel((options, values) => {
          //回传选项和已选择的值
          emit('departOk', options, values);
          //关闭弹窗
          closeModal();
        });
      }
      return {
        checkedKeys,
        treeData,
        visibleChange,
        handleOk,
        register,
        getBindValue,
        onSelect,
        onCheck,
        handleCancel,
      };
    },
  });
</script>
