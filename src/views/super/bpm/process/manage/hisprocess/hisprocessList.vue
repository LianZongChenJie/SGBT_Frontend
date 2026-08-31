<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!--历史-->
    <HisTaskDealModal ref="taskDealRef" :path="path" :formData="formData"></HisTaskDealModal>
  </div>
</template>
<script lang="ts" name="process-hisprocess-list" setup>
  import { ref, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import HisTaskDealModal from '../components/HisTaskDealModal.vue';
  import { useBpmNodeInfo } from '../components/hooks/useBpmNodeInfo';
  import { columns, searchFormSchema } from './hisprocess.data';
  import { list, invalidProcess, callBackProcess } from './hisprocess.api';
  import { useListPage } from '/@/hooks/system/useListPage';

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'process-hisprocess',
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
  const path = ref('');
  const taskDealRef = ref(null);
  const { getHisProcessNodeInfo, formData } = useBpmNodeInfo(path, taskDealRef);

  const [registerTable, rowSelection, { reload }] = tableContext;

  /**
   * 显示历史
   * @param record
   */
  function showHistory(record) {
    getHisProcessNodeInfo(record);
  }
  /**
   * 作废流程
   * @param record
   */
  async function handleInvalidProcess(record) {
    await invalidProcess(
      {
        processInstanceId: record.processInstanceId,
      },
      reload
    );
  }
  /**
   * 取回流程
   * @param record
   */
  async function handleCallBackProcess(record) {
    await callBackProcess(
      {
        processInstanceId: record.processInstanceId,
      },
      reload
    );
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '历史',
        onClick: showHistory.bind(null, record),
        ifShow: () => {
          return record.endTime && record.endTime != '';
        },
      },
    ];
  }
  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '作废流程',
        popConfirm: {
          title: '确定要作废流程吗?',
          confirm: handleInvalidProcess.bind(null, record),
        },
        ifShow: () => {
          return !record.endTime;
        },
      },
      {
        label: '取回流程',
        popConfirm: {
          title: '确定要取回流程吗?',
          confirm: handleCallBackProcess.bind(null, record),
        },
        ifShow: () => {
          return !record.endTime;
        },
      },
      {
        label: '历史',
        onClick: showHistory.bind(null, record),
        ifShow: () => {
          return !record.endTime;
        },
      },
    ];
  }
</script>
