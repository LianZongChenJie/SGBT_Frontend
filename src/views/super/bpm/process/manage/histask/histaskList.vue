<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!--历史-->
    <HisTaskDealModal ref="taskDealRef" :path="path" :formData="formData"></HisTaskDealModal>
  </div>
</template>
<script lang="ts" name="process-histask-list" setup>
  import { ref, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import HisTaskDealModal from '../components/HisTaskDealModal.vue';
  import { columns, searchFormSchema } from './histask.data';
  import { list } from './histask.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useBpmNodeInfo } from '../components/hooks/useBpmNodeInfo';

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'process-histask',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
    },
  });
  const [registerTable, rowSelection, { reload }] = tableContext;
  const path = ref('');
  const taskDealRef = ref(null);
  let { getHisProcessNodeInfo, formData } = useBpmNodeInfo(path, taskDealRef);
  /**
   * 显示历史
   * @param record
   */
  function showHistory(record) {
    getHisProcessNodeInfo(record);
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '历史',
        onClick: showHistory.bind(null, record),
      },
    ];
  }
</script>
