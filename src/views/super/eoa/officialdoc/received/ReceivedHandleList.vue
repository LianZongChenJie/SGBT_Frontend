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
  import { list, getExportUrl } from './received.api';
  import { handleColumn, searchHandleSchema } from './received.data';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';

  // 列表页面公共参数、方法
  const { prefixCls, onExportXls, tableContext } = useListPage({
    designScope: 'received-handle',
    tableProps: {
      title: '模板管理',
      api: list,
      canResize: false,
      columns: handleColumn,
      showActionColumn: false,
      formConfig: {
        schemas: searchHandleSchema,
        fieldMapToTime: [['receiptDate', ['receiptDate_begin', 'receiptDate_end'], 'YYYY-MM-DD HH:mm:ss']],
      },
    },
    exportConfig: {
      name: '收文经办文件查询',
      url: getExportUrl,
      //已发送的
      params: { stauts: '1' },
    },
  });
  //注册table数据
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  //注册modal弹窗
  const [registerModal, { openModal }] = useModal();
</script>

<style scoped></style>
