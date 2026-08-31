<template>
  <div class="box" style="padding: 10px">
    <a-card>
      <BasicTable @register="registerTable">
        <template #action="{ record }">
          <TableAction :actions="getActions(record)" />
        </template>
      </BasicTable>
      <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="reload" />
      <DemoModalDetail :isDisabled="isDisabled" @register="registerModalDetail" @success="reload" />
    </a-card>
  </div>
</template>

<script setup lang="ts" name="guzhangbaoxiu">
  import { ref } from 'vue';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import DemoModalDetail from './DemoModalDetail.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { deleteDemo, getDemoListAll } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const { hasPermission } = usePermission();
  const [registerModal, { openModal }] = useModal();
  const [registerModalDetail, { openModal: openModalDetail }] = useModal();
  const isDisabled = ref(false);

  const [registerTable, { reload }] = useTable({
    title: '',
    api: getDemoListAll,
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
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  function getActions(record) {
    return [
      {
        label: '领用出库',
        onClick: handleEdit.bind(null, record),
        show: record.status === 20,
        auth: 'operation:operation_wh_application:edit',
      },
      {
        label: '关闭',
        popConfirm: {
          title: '是否确认关闭？',
          confirm: handleDelete.bind(null, record),
        },
        auth: 'operation:operation_wh_application:delete',
      },
    ];
  }

  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  function handleDetail(record) {
    isDisabled.value = true;
    openModalDetail(true, {
      record,
      isUpdate: true,
    });
  }

  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, reload);
  }
</script>

<style scoped lang="less">
  .box {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }

  .jeecg-basic-table-form-container {
    padding: 0;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
