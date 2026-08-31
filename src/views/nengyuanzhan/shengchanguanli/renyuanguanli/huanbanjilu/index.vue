<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable" />
  </div>
</template>

<script lang="ts" setup name="huanbanjilu">
  import { BasicTable, useTable } from '/@/components/Table';
  import { getDemoList } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const [registerTable] = useTable({
    title: '换班记录',
    api: getDemoList,
    columns,
    formConfig: {
      schemas: searchFormSchema,
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
  });
</script>

<style lang="less" scoped>
  .jeecg-basic-table-form-container {
    padding: 0;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
