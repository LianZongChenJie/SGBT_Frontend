<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate()"> 新增</a-button>
      <ExcelButton :config="excelConfig" />
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
  <DistributeModal @register="registerModal" @success="handleSuccess"></DistributeModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { list, deleteOragnCode, deleteBatch, getImportUrl, getExportUrl } from './organcode.api';
  import { columns, searchFormSchema } from './organcode.data';
  import { useMethods } from '/@/hooks/system/useMethods';
  import DistributeModal from './DistributeModal.vue';
  import { useModal } from '/@/components/Modal';
  import ExcelButton from '/@/components/jeecg/ExcelButton.vue';
  import { useListPage } from '/@/hooks/system/useListPage';

  const [registerModal, { openModal }] = useModal();
  const { prefixCls, onExportXls, onImportXls, tableContext } = useListPage({
    designScope: 'organcode-template',
    tableProps: {
      title: '机关代字',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });

  //注册table数据
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * excel导入导出配置
   */
  const excelConfig = {
    export: {
      name: '机关代字列表',
      url: getExportUrl,
    },
    import: {
      url: getImportUrl,
      success: reload,
    },
  };

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOragnCode({ id: record.id }, reload);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await deleteBatch({ ids: selectedRowKeys.value }, reload);
  }

  /**
   * 新增分发人员
   */
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑分发人员
   */
  function handleEdit(record) {
    openModal(true, {
      record,
      isUpdate: true,
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

  /**
   * 成功回调
   */
  function handleSuccess({ isUpdate, values }) {
    if (isUpdate) {
      updateTableDataRecord(values.id, values);
    } else {
      reload();
    }
  }
</script>
