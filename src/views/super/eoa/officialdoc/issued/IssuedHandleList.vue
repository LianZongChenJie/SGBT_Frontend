<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" name="oa-official-doc-handle" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { list, getExportUrl } from './issued.api';
  import { handleColumns, searchHandleSchema } from './issued.data';
  const checkedKeys = ref<Array<string | number>>([]);
  //注册model
  const [registerModal, { openModal }] = useModal();
  //注册table数据
  const { prefixCls, tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '发文经办文件查询',
      api: (params) => {
        //0 草稿箱 1 已发送
        params.stauts = '1';
        return list(params);
      },
      columns: handleColumns,
      canResize: false,
      showActionColumn: false,
      formConfig: {
        labelWidth: 120,
        schemas: searchHandleSchema,
        fieldMapToTime: [['createTime', ['createTimeBegin', 'createTimeEnd'], 'YYYY-MM-DD']],
      },
      actionColumn: {
        width: 120,
      },
    },
    exportConfig: {
      name: '发文经办文件查询',
      url: getExportUrl,
      //已发送的
      params: { stauts: '1' },
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
</script>
