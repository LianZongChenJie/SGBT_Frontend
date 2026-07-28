<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">出库申请 </a-button>
      </template>
    </BasicTable>
    <ApplyForm @register="registerModal" @success="reload" />
    <applyDetail @register="registerApplyFormModal" />
  </div>
</template>
<script setup lang="ts">
  import TableAction from '@/components/Table/src/components/TableAction.vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { deleteApi, listApi } from '@/views/inventory/outApply/api';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { useModal } from '@/components/Modal';
  import ApplyForm from '@/views/inventory/outApply/applyForm.vue';
  import { columns, searchFormSchema } from './outapply.data';
  import applyDetail from './applyDetail.vue';
  const [registerModal, { openModal: openModal }] = useModal();
  const [registerApplyFormModal, { openModal: openApplyDetailModel }] = useModal();
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      title: '仓库',
      api: listApi,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        title: '操作',
        width: 180,
      },
      showIndexColumn: true,
    },
  });
  const [registerTable, { reload }] = tableContext;
  const getActions = (record) => {
    return [
      {
        label: '详情',
        onClick: doAction.bind(null, record, '详情'),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      isUpdate: false,
    });
  };

  function doAction(record: any, name: any) {
    if (name == '详情') {
      openApplyDetailModel(true, record);
    }
  }
</script>
