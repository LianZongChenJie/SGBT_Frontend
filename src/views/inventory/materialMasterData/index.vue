<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)"></TableAction>
      </template>
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增 </a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="downloadTemplate"> 下载模板 </a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
      </template>
    </BasicTable>
    <DetailModal @register="registerModal" @success="reload" />
  </div>
</template>
<script setup lang="ts">
  import TableAction from '@/components/Table/src/components/TableAction.vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { deleteApi, listApi } from '@/views/inventory/materialMasterData/api';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { useModal } from '@/components/Modal';
  import DetailModal from '@/views/inventory/materialMasterData/detailModal.vue';
  import { columns, searchFormSchema } from './data';
  import excelFile from '@/assets/file/material.xlsx?url';

  const [registerModal, { openModal: openModal }] = useModal();
  const { tableContext, onImportXls } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      title: '物料主数据管理',
      api: listApi,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 180,
      },
      showIndexColumn: true,
    },
    importConfig: {
      url: '/jeecg-demo/admin/material/importMaterial',
    },
  });
  const [registerTable, { reload }] = tableContext;
  const getActions = (record) => {
    return [
      {
        label: '编辑',
        onClick: doAction.bind(null, record, '编辑'),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: doAction.bind(null, record, '删除'),
        },
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      isUpdate: false,
    });
  };

  function doAction(record: any, name: any) {
    if (name == '编辑') {
      openModal(true, {
        isUpdate: true,
        record,
      });
    }
    if (name == '删除') {
      deleteApi({ id: record.id }, reload);
    }
  }
  function downloadTemplate() {
    const link = document.createElement('a');
    link.href = excelFile; // 相对于public目录的路径
    link.download = '物料清单.xlsx'; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>
