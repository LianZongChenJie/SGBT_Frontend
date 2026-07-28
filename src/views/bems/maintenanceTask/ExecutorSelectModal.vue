<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="选择执行人" @ok="handleOk" @cancel="handleCancel" width="900px" destroyOnClose>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '@/components/Modal';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { message } from 'ant-design-vue';
  import { listNoCareTenant } from '@/views/system/user/user.api';

  const emit = defineEmits(['select']);

  const [registerModal, { closeModal }] = useModalInner(() => {
    clearSelectedRowKeys();
    reload();
  });

  const { tableContext } = useListPage({
    designScope: 'maintenance-task-executor-select',
    tableProps: {
      api: listNoCareTenant,
      columns: [
        {
          title: '用户账号',
          dataIndex: 'username',
          width: 140,
          align: 'center',
        },
        {
          title: '用户姓名',
          dataIndex: 'realname',
          width: 140,
          align: 'center',
        },
        {
          title: '手机号',
          dataIndex: 'phone',
          width: 140,
          align: 'center',
        },
        {
          title: '部门',
          dataIndex: 'orgCodeTxt',
          align: 'center',
        },
      ],
      formConfig: {
        schemas: [
          {
            label: '账号',
            field: 'username',
            component: 'Input',
          },
          {
            label: '姓名',
            field: 'realname',
            component: 'Input',
          },
        ],
        baseColProps: {
          span: 8,
        },
        labelWidth: 60,
      },
      rowKey: 'id',
      rowSelection: { type: 'radio' },
      showIndexColumn: true,
      showActionColumn: false,
      showTableSetting: false,
      beforeFetch: (params) => {
        return Object.assign({ column: 'createTime', order: 'desc' }, params);
      },
    },
  });

  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection }] = tableContext;

  function handleOk() {
    const selectedRows = rowSelection.selectedRows || [];
    if (!selectedRows.length) {
      message.warning('请选择执行人');
      return;
    }

    const user = selectedRows[0];
    emit('select', {
      ...user,
      executorName: user.realname || user.username || '',
    });
    closeModal();
  }

  function handleCancel() {
    clearSelectedRowKeys();
  }
</script>
