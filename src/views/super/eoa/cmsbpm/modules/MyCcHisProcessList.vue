<template>
  <!-- table区域-begin -->
  <BasicTable @register="registerTable">
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
    <template #bpmBizTitle="{ text, record }">
      <JEllipsis :value="text" :length="15" />
    </template>
  </BasicTable>
  <!-- table区域-end -->

  <!-- 审批记录弹出框 -->
  <HisTaskDealModal ref="taskDealRef" :path="path" :formData="formData"></HisTaskDealModal>
</template>

<script lang="ts" name="MyCcHisProcessList" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useBpmNodeInfo } from '/@/hooks/jeecg/process/useBpmNodeInfo';
  import { ccHistoryList } from '../cmsbpm.api';
  // 表头
  const columns = [
    {
      title: '业务标题',
      dataIndex: 'bpmBizTitle',
      slots: { customRender: 'bpmBizTitle' },
    },
    {
      title: '流程名称',
      dataIndex: 'processDefinitionName',
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
    },
    {
      title: '耗时',
      dataIndex: 'durationStr',
    },
  ];

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: ccHistoryList,
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
  const path = ref('');
  const taskDealRef = ref(null);
  const { getHisProcessNodeInfo, formData } = useBpmNodeInfo(path, taskDealRef);

  //注册table数据
  const [registerTable, { reload }] = tableContext;
  /**
   * 办理
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
        label: '查看审批',
        onClick: showHistory.bind(null, record),
      },
    ];
  }
</script>
<style scoped>
  .ant-card-body {
    margin-bottom: 18px;
  }

  .table-operator button {
    margin-bottom: 18px;
    margin-right: 5px;
  }

  .anty-row-operator button {
    margin: 0 5px;
  }

  .ant-btn-danger {
    background-color: #fff;
  }

  .ant-modal-cust-warp {
    height: 100%;
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto;
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden;
  }

  .anty-img-wrap {
    height: 25px;
    position: relative;
  }

  .anty-img-wrap > img {
    max-height: 100%;
  }
</style>
