<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <div style="float: left; text-align: center; background-color: white; width: 100%">
          <h2 style="margin-top: 10px">
            <span v-if="!editTitle">{{ title }}</span>
            <a-input ref="inputRef" class="input-border" v-model:value="title" v-else @blur="updateHandleTitle">{{ title }}</a-input>
            <a-icon type="edit" style="cursor: pointer" @click="editHandleTitle" />
          </h2>
        </div>
        <div style="display: inline-flex">
          <div style="margin-left: 10px">
            <a-button preIcon="ant-design:delete" type="primary" @click="deleteChange">删除</a-button>
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
    <EoaMailBoxInModal @register="registerModal" @success="handleSuccess" @reply="handleReply"></EoaMailBoxInModal>
  </div>
</template>

<script lang="ts" name="eoa-email-type-list" setup>
  import { nextTick, ref, watch } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { inboxList, updateEmailStatus, editCategory } from './EoaMailBox.api';
  import { tagColumns } from './EoaMailBox.data';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JEllipsis } from '/@/components/Form';
  import { Modal } from 'ant-design-vue';
  import type { PropType } from 'vue';
  import EoaMailBoxInModal from './components/EoaMailBoxInModal.vue';

  // Emits声明
  const emit = defineEmits(['register', 'delete', 'reply', 'edit']);
  const $message = useMessage();
  const userStore = useUserStore();
  const props = defineProps({
    search: { type: String as PropType<string>, default: () => '' },
    title: { type: String as PropType<string>, default: () => '' },
    mailboxType: { type: String as PropType<string>, default: () => '' },
  });
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: (params) => {
        params.status = '0';
        params.senderId = userStore.getUserInfo.id;
        params.title = props.search;
        params.mailboxType = props.mailboxType;
        return inboxList(params);
      },
      columns: tagColumns,
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
  const title = ref<string>(props.title);
  const editTitle = ref<boolean>(false);
  const inputRef = ref();
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
   */
  async function deleteChange() {
    if (selectedRowKeys.value.length > 0) {
      let params = { checkedList: selectedRowKeys.value };
      Modal.confirm({
        title: '删除',
        content: '确定要删除吗',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          await updateEmailStatus(params, reload);
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
   * 转发或回复
   * @param record
   */
  function handleReply(record) {
    emit('reply', record);
  }

  /**
   * 点击按钮编辑标签
   */
  function editHandleTitle() {
    editTitle.value = !editTitle.value;
    if (editTitle.value) {
      //输入框聚焦
      nextTick(() => {
        inputRef.value.focus();
      });
    }
  }

  /**
   * 修改标签
   */
  function updateHandleTitle() {
    //update-begin---author:wangshuai---date:2024-06-24---for:【TV360X-1372】邮箱标签点击之后 在上方进行修改，应该判断不能为空---
    if(!title.value){
      $message.createMessage.warn("标签名称不能为空！");
      inputRef.value.focus();
      return;
    }
    //update-end---author:wangshuai---date:2024-06-24---for:【TV360X-1372】邮箱标签点击之后 在上方进行修改，应该判断不能为空---
    const mailboxType = props.mailboxType;
    editCategory({ id: mailboxType, labelName: title.value }, editSuccess);
    //TODO 修改邮箱
    editTitle.value = false;
  }

  /**
   * 编辑成功之后需要刷新列表
   */
  function editSuccess() {
    handleSuccess();
    emit('edit');
  }

  //监听search搜索
  watch(props, () => {
    handleSuccess();
    title.value = props.title;
  });
</script>
<style lang="less" scoped>
  .input-border {
    border: none;
    width: 100px;
  }
</style>
