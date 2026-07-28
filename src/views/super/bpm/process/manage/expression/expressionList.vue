<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="handleBatchDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!--监听弹窗-->
    <ExpressionModal @register="registerModal" @success="reload"></ExpressionModal>
  </div>
</template>
<script lang="ts" name="process-expression-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import ExpressionModal from './components/ExpressionModal.vue';
  import { useModal } from '/@/components/Modal';
  import { columns, searchFormSchema } from './expression.data';
  import { list, deleteOne, batchDelete } from './expression.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  //弹窗
  const [registerModal, { openModal }] = useModal();

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'process-expression',
    tableProps: {
      title: '流程表达式',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  /**
   * 新增
   */
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }
  /**
   * 编辑
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
    });
  }
  /**
   * 删除
   * @param id
   */
  async function handleDelete(id) {
    await deleteOne({ id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function handleBatchDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, () => {
      selectedRowKeys.value = [];
      reload();
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
</script>
