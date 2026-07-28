<template>
  <BasicTable @register="registerTable">
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>

  <!-- 弹出框 
    <task-deal-modal ref="taskDealModal" :path="path" :formData="formData" @ok="handleOk"></task-deal-modal>-->
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { taskGroupList } from '../cmsbpm.api';
  // 表头
  const columns = [
    {
      title: '业务标题',
      dataIndex: 'bpmBizTitle',
      scopedSlots: { customRender: 'bpmBizTitle' },
    },
    {
      title: '流程编号',
      dataIndex: 'processDefinitionId',
    },
    {
      title: '流程名称',
      dataIndex: 'processDefinitionName',
    },
    {
      title: '流程实例',
      dataIndex: 'processInstanceId',
    },
    {
      title: '任务ID',
      dataIndex: 'taskId',
    },
    {
      title: '发起人',
      dataIndex: 'processApplyUserName',
    },
    {
      title: '开始时间',
      dataIndex: 'taskBeginTime',
    },
    {
      title: '结束时间',
      dataIndex: 'taskEndTime',
    },
    {
      title: '当前环节',
      dataIndex: 'taskName',
    },
  ];

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: taskGroupList,
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

  /**
   * 办理
   */
  function handleProcess(record) {
    //this.getProcessNodeInfo(record);
  }

  /**
   * 签收
   */
  function handleClaim(record) {}

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '办理?',
        onClick: handleProcess.bind(null, record),
        ifShow: record.taskAssigneeName && record.taskAssigneeName != '',
      },
      {
        label: '签收?',
        onClick: handleClaim.bind(null, record),
        ifShow: !(record.taskAssigneeName && record.taskAssigneeName != ''),
      },
    ];
  }
</script>
<style lang="less" scoped></style>
