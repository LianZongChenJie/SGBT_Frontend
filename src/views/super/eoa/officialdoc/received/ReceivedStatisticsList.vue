<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
    </template>
  </BasicTable>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { statisticsList, getStatisticsExportUrl } from './received.api';
  import { statisticsColumn, searchStatisticsSchema } from './received.data';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';

  // 列表页面公共参数、方法
  const { prefixCls, onExportXls, tableContext } = useListPage({
    designScope: 'received-statistics',
    tableProps: {
      rowKey: 'department',
      title: '模板管理',
      api: statisticsList,
      canResize: false,
      columns: statisticsColumn,
      showActionColumn: false,
      formConfig: {
        schemas: searchStatisticsSchema,
        fieldMapToTime: [['receiptDate', ['receiptDateBegin', 'receiptDateEnd'], 'YYYY-MM-DD']],
      },
    },
    exportConfig: {
      name: '收文统计列表',
      url: getStatisticsExportUrl,
    },
  });
  //注册table数据
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  //注册modal弹窗
  const [registerModal, { openModal }] = useModal();
</script>

<style scoped></style>
