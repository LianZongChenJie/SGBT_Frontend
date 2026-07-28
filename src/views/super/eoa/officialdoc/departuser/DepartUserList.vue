<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate()"> 新增</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchHandleDelete">
              <Icon icon="ant-design:delete-outlined"></Icon>
              删除
            </a-menu-item>
          </a-menu>
        </template>
        <a-button
          >批量操作
          <Icon icon="ant-design:down-outlined"></Icon>
        </a-button>
      </a-dropdown>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"></TableAction>
    </template>
  </BasicTable>
  <!-- modal引入 -->
  <DepartUserModal @register="registerModal" @success="reload"></DepartUserModal>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { list, deleteDepartUser, deleteBatch, getImportUrl, getExportUrl } from './depart.user.api';
  import { columns, searchFormSchema } from './depart.user.data';
  import { useModal } from '/@/components/Modal';
  import DepartUserModal from './DepartUserModal.vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { useListPage } from '/@/hooks/system/useListPage';
  import ExcelButton from '/@/components/jeecg/ExcelButton.vue';

  const { handleImportXls, handleExportXls } = useMethods();
  const { prefixCls, onExportXls, onImportXls, tableContext } = useListPage({
    designScope: 'depart-user-template',
    tableProps: {
      title: '分发人员',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
    },
    exportConfig: {
      name: '分发人员列表',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const [registerModal, { openModal }] = useModal();
  //注册table数据
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 新增
   */
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 删除
   */
  async function handleDelete(record) {
    await deleteDepartUser({ id: record.id }, reload);
  }

  /**
   * 批量删除
   */
  async function batchHandleDelete() {
    await deleteBatch({ ids: unref(selectedRowKeys) }, reload);
  }

  /**
   * 编辑
   */
  function handleEdit(record) {
    openModal(true, {
      isUpdate: true,
      record,
    });
  }

  /**
   * 操作
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '确定删除吗?',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }
</script>

<style scoped></style>
