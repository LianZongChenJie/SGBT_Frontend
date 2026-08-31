<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <div style="float: left; text-align: center; background-color: white; width: 100%">
          <h2 style="margin-top: 10px">发件箱</h2>
        </div>
        <div style="display: inline-flex">
          <div style="margin-left: 10px">
            <a-dropdown :trigger="['click']">
              <a-button class="ant-dropdown-link" preIcon="ant-design:delete" @click.prevent
                >删除
                <a-icon type="down" />
              </a-button>
              <template #overlay>
                <a-menu slot="overlay">
                  <a-menu-item value="删除" @click="deleteChange(1)">删除</a-menu-item>
                  <a-divider style="margin: 2px 0 !important" />
                  <a-menu-item value="彻底删除" @click="deleteChange(3)">彻底删除</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </template>
      <template #title="{ text, record }">
        <a @click="handleClick(record)">
          <a-icon type="alert" title="紧急" style="color: red" v-if="record.urgentFlag === '1'" />
          <a-icon type="rollback" title="已撤回" style="color: red" v-if="record.withdrawFlag == '1'" />
          <JEllipsis :value="text" :length="12" />
        </a>
      </template>
    </BasicTable>
    <EoaMailBoxSendModal @register="registerModal" @success="handleSuccess" @reply="handleReply"></EoaMailBoxSendModal>
  </div>
</template>

<script lang="ts" name="eoa-email-send-list" setup>
  import { watch } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { sendList, updateEmailStatus } from './EoaMailBox.api';
  import { sendColumn } from './EoaMailBox.data';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JEllipsis } from '/@/components/Form';
  import { Modal } from 'ant-design-vue';
  import type { PropType } from 'vue';
  import EoaMailBoxSendModal from './components/EoaMailBoxSendModal.vue';

  // Emits声明
  const emit = defineEmits(['register', 'delete', 'reply']);
  const $message = useMessage();
  const userStore = useUserStore();
  const props = defineProps({
    search: { type: String as PropType<string>, default: () => '' },
  });
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      title: '收件箱',
      api: (params) => {
        params.status = '2';
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
   * 编辑
   */
  function handleEdit(record) {
    openModal(true, {
      isUpdate: true,
      record,
    });
  }

  /**
   * 删除或彻底删除
   * @param flag 1删除到垃圾箱 3彻底删除
   */
  async function deleteChange(flag) {
    if (selectedRowKeys.value.length > 0) {
      let params = { checkedList: selectedRowKeys.value, delFlag: flag };
      const title = params.delFlag == '3' ? '彻底' : '';
      Modal.confirm({
        title: title + '删除',
        content: '确定要' + title + '删除吗',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          await updateEmailStatus(params, handleSuccess);
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
   * 回复
   * @param record
   */
  function handleReply(record) {
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
