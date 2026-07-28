<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <div style="float: left; text-align: center; background-color: white; width: 100%">
          <h2 style="margin-top: 10px">草稿箱</h2>
        </div>
        <div style="display: inline-flex">
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
    <EoaEmailBoxDraftsModal @register="registerModal" @success="handleSuccess" @changeinbox="changeInBox"></EoaEmailBoxDraftsModal>
  </div>
</template>

<script lang="ts" name="eoa-email-drafts-list" setup>
  import { watch } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { sendList, batchDelete } from './EoaMailBox.api';
  import { sendColumn } from './EoaMailBox.data';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JEllipsis } from '/@/components/Form';
  import { Modal } from 'ant-design-vue';
  import type { PropType } from 'vue';
  import EoaEmailBoxDraftsModal from './components/EoaEmailBoxDraftsModal.vue';

  // Emits声明
  const emit = defineEmits(['register', 'delete', 'reply', 'changeinbox']);
  const $message = useMessage();
  const userStore = useUserStore();
  const props = defineProps({
    search: { type: String as PropType<string>, default: () => '' },
  });
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      title: '草稿箱',
      api: (params) => {
        params.status = '0';
        params.senderId = userStore.getUserInfo.id;
        params.title = props.search;
        return sendList(params);
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
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 删除或彻底删除
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
          await batchDelete(params, handleSuccess);
          emit('delete');
        },
      });
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
   * 跳转到收邮箱
   */
  function changeInBox(type) {
    emit('changeinbox', type);
  }

  //监听search搜索
  watch(
    () => props.search,
    () => {
      handleSuccess();
    }
  );
</script>
