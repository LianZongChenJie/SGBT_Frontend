<template>
  <!--定义表格-->
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <approveModal @register="registerApproveModal" @success="approveSuccess" />
  <applyDetail @register="registerApplyFormModal" @approveHandle="approveHandle" :changeFlag="changeFlag" />
</template>

<script lang="ts" name="basic-table-demo" setup>
  import { ref } from 'vue';
  import { ActionItem, BasicColumn, BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getOutApplyList } from './api';
  import { columns, searchFormSchema } from './data';
  import applyDetail from './applyDetail.vue';
  import approveModal from './approve.vue';
  import { useModal } from '@/components/Modal';
  import { approveApplyDetail } from './api';
  const changeFlag = ref<boolean>(false);
  const [registerApproveModal, { openModal: openApproveModal }] = useModal();
  const [registerApplyFormModal, { openModal: openApplyDetailModel }] = useModal();

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      title: '',
      api: getOutApplyList,
      columns: columns,
      size: 'small',
      actionColumn: {
        width: 120,
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });
  // BasicTable绑定注册
  const [registerTable, { reload }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '详情',
        onClick: detailHandle.bind(null, record),
      },
      {
        label: '审批',
        onClick: approveHandle.bind(null, record),
        ifShow: record.status === '待审批',
      },
    ];
  }

  /**
   * 处理审批操作
   *
   * @param record 待审批的记录对象
   */
  function approveHandle(record) {
    openApproveModal(true, record);
  }
  /**
   * 处理详情操作
   *
   * @param record 记录对象
   */
  function detailHandle(record) {
    approveApplyDetail({ id: record.id }).then((res) => {
      openApplyDetailModel(true, res);
    });
    console.log(changeFlag.value, 'record');
  }
  function approveSuccess() {
    reload();
    changeFlag.value = !changeFlag.value;
    console.log(changeFlag.value, 'changeFlag');
  }
</script>
