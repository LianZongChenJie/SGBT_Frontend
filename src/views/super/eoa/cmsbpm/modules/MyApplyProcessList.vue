<template>
  <!-- table区域-begin -->
  <BasicTable @register="registerTable">
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
    </template>
  </BasicTable>
  <!-- table区域-end -->

  <!-- 历史弹出框 -->
  <HisTaskDealModal ref="taskDealRef" :path="path" :formData="formData"></HisTaskDealModal>
  <!-- 催办 -->
  <TaskNotifyModal @register="registerNotifyModal"></TaskNotifyModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useBpmNodeInfo } from '/@/hooks/jeecg/process/useBpmNodeInfo';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { applyProcesslist, invalidProcess, backProcess } from '../cmsbpm.api';
  const columns = [
    {
      title: '业务标题',
      dataIndex: 'bpmBizTitle',
    },
    {
      title: '流程名称',
      dataIndex: 'prcocessDefinitionName',
    },
    {
      title: '开始日期',
      dataIndex: 'startTime',
    },
    {
      title: '耗时',
      dataIndex: 'spendTimes',
    },
    {
      title: '状态',
      dataIndex: 'bpmStatus',
      customRender: ({ text }) => {
        switch (text) {
          case '1':
            return '待提交';
          case '2':
            return '处理中';
          case '3':
            return '已完成';
          case 'rejectProcess':
            return '已驳回';
          case 'callBackProcess':
            return '已取回';
          case 'invalidProcess':
            return '已作废';
        }
        return text;
      },
    },
  ];
  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: applyProcesslist,
      columns,
      pagination: false,
      size: 'small',
      useSearchForm: false,
      beforeFetch: (params) => {
        return Object.assign(params, { pageSize: 5 });
      },
      showTableSetting: false,
      canResize: false,
      actionColumn: {
        width: 120,
      },
    },
  });

  //注册table数据
  const [registerTable, { reload }] = tableContext;
  const path = ref('');
  const taskDealRef = ref(null);
  const { getHisProcessNodeInfo, formData } = useBpmNodeInfo(path, taskDealRef);
  //催办
  const [registerNotifyModal, { openModal: openNotifyModal }] = useModal();

  //历史
  function showHistory(record) {
    getHisProcessNodeInfo(record);
  }

  //催办
  function handleTaskNotify(record) {
    openNotifyModal(true, {
      title: '催办提醒',
      procInstId: record.processInstanceId,
    });
  }
  /**
   * 作废流程
   */
  async function handleInvalidTask(record) {
    let params = {
      processInstanceId: record.processInstanceId,
    };
    await invalidProcess(params);
    reload();
  }
  // 流程取回
  async function handleBackTask(record) {
    let params = {
      processInstanceId: record.processInstanceId,
    };
    await backProcess(params);
    reload();
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '历史',
        onClick: showHistory.bind(null, record),
        ifShow: !!record.endTime,
      },
    ];
  }
  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    if (!(record.endTime && record.endTime !== '')) {
      return [
        {
          label: '催办',
          onClick: handleTaskNotify.bind(null, record),
          ifShow: () => {
            return record.urgeStatus !== '0';
          },
        },
        {
          label: '作废流程',
          popConfirm: {
            title: '确定要作废流程吗？',
            placement: 'left',
            confirm: handleInvalidTask.bind(null, record),
          },
        },
        {
          label: '取回流程',
          popConfirm: {
            title: '确定要取回流程吗?',
            confirm: handleBackTask.bind(null, record),
            ifShow: () => {
               return record.backStatus !== '0';
            },
          },
        },
        {
          label: '历史',
          onClick: showHistory.bind(null, record),
        },
      ];
    }
  }
</script>
<style scoped></style>
