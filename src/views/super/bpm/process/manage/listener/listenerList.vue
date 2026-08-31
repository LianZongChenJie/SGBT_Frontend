<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!--监听弹窗-->
    <ListenerModal @register="registerModal" @success="reload"></ListenerModal>
  </div>
</template>
<script lang="ts" name="process-listener-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import ListenerModal from './components/ListenerModal.vue';
  import { useModal } from '/@/components/Modal';
  import { columns, searchFormSchema } from './listener.data';
  import { list, deleteOne, changeStatus } from './listener.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  //弹窗
  const [registerModal, { openModal }] = useModal();

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'process-listener',
    tableProps: {
      title: '流程监听',
      api: list,
      columns: columns,
      formConfig: {
        labelWidth: 50,
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
    console.log('点击了编辑', record);
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
    console.log('点击了删除', id);
    await deleteOne({ id }, reload);
  }
  /**
   * 修改状态
   * @param id
   */
  async function handleOpen(id) {
    console.log('点击了启用', id);
    await changeStatus({ id }, reload);
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
      {
        label: '启用',
        popConfirm: {
          title: '是否启用？',
          confirm: handleOpen.bind(null, record.id),
        },
        ifShow: () => {
          return record.listenerStatus == 0;
        },
      },
      {
        label: '禁用',
        popConfirm: {
          title: '是否禁用？',
          confirm: handleOpen.bind(null, record.id),
        },
        ifShow: () => {
          return record.listenerStatus == 1;
        },
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
