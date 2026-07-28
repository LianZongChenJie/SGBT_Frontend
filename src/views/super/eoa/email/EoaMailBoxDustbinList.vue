<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <div style="float: left; text-align: center; background-color: white; width: 100%">
          <h2 style="margin-top: 10px">垃圾箱</h2>
        </div>
        <div style="display: inline-flex">
          <div>
            <a-button @click="revertBtn">
              <a-icon type="rollback" />
              恢复
            </a-button>
          </div>
          <div style="margin-left: 10px">
            <a-button preIcon="ant-design:delete" @click="deleteChange">删除</a-button>
          </div>
        </div>
      </template>
      <template #title="{ text, record }">
        <a @click="handleClick(record)">
          <JEllipsis :value="text" :length="12" />
        </a>
      </template>
    </BasicTable>
    <EoaMailBoxInModal @register="registerModal" @success="handleSuccess" @reply="handReply"></EoaMailBoxInModal>
  </div>
</template>

<script lang="ts" name="eoa-email-drafts-list" setup>
  import { watch } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { selectDustbin, batchDelete, revertList } from './EoaMailBox.api';
  import { sendColumn } from './EoaMailBox.data';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JEllipsis } from '/@/components/Form';
  import { Modal } from 'ant-design-vue';
  import type { PropType } from 'vue';
  import EoaMailBoxInModal from './components/EoaMailBoxInModal.vue';

  // Emits声明
  const emit = defineEmits(['register', 'delete', 'reply']);
  const $message = useMessage();
  const userStore = useUserStore();
  const props = defineProps({
    search: { type: String as PropType<string>, default: () => '' },
  });
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      title: '垃圾箱',
      api: (params) => {
        params.senderId = userStore.getUserInfo.id;
        params.title = props.search;
        return selectDustbin(params);
      },
      columns: sendColumn,
      showActionColumn: false,
      canResize: false,
      bordered: false,
      ellipsis: true,
      useSearchForm: false,
    },
  });
  const [registerModal, { openModal }] = useModal();
  //注册table数据
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;

  /**
   * 删除
   */
  async function deleteChange() {
    if (selectedRowKeys.value.length > 0) {
      let params = { ids: selectedRowKeys.value };
      Modal.confirm({
        title: '删除',
        content: '确定要删除吗',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          await batchDelete(params, reload);
          handleSuccess();
          emit('delete');
        },
      });
    } else {
      $message.createMessage.warning('请选择一条数据！');
    }
  }

  /**
   * 垃圾箱恢复点击事件
   */
  async function revertBtn() {
    if (selectedRowKeys.value.length > 0) {
      await revertList({ checkedList: JSON.stringify(selectedRows.value) });
      emit('delete');
      handleSuccess();
    } else {
      $message.createMessage.warning('请选择一条数据！');
    }
  }

  /**
   * 预览页面点击事件
   * @param record
   */
  function handleClick(record) {
    openModal(true, record);
  }

  /**
   * 预览回调事件
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 回复或转发
   * @param record
   */
  function handReply(record) {
    emit('reply', record);
  }

  //监听search搜索
  watch(
    () => props.search,
    () => {
      handleSuccess();
    }
  );
</script>
