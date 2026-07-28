<template>
  <BasicModal v-bind="$attrs" :title="title" @register="registerModal" width="800px" :showOkBtn="false" cancelText="关闭">
    <BasicTable @register="registerTable" :rowSelection="rowSelection" />
  </BasicModal>
</template>

<script lang="ts" setup name="eoa-mail-box-read-modal">
  import { ref } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { receiverPage } from '../EoaMailBox.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { readColumn } from '../EoaMailBox.data';

  const emit = defineEmits(['register', 'success']);
  const userStore = useUserStore();
  const title = ref<string>('阅读情况');
  const mailId = ref<string>('');
  //表单数据
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    mailId.value = data.id;
  });

  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: (params) => {
        params.mailId = mailId.value;
        return receiverPage(params);
      },
      columns: readColumn,
      showActionColumn: false,
      canResize: false,
      bordered: false,
      ellipsis: true,
      useSearchForm: false,
    },
  });

  //注册表格
  //注册table数据
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 关闭弹窗
   */
  function handleCancel() {
    //刷新列表
    emit('success');
    closeModal();
  }
</script>
