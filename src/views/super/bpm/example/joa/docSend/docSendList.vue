<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchHandleDelete">
              <Icon icon="ant-design:delete-outlined"></Icon>
              删除
            </a-menu-item>
          </a-menu>
        </template>
        <a-button
          >批量操作
          <Icon icon="mdi:chevron-down"></Icon>
        </a-button>
      </a-dropdown>
    </template>
    <template #pcaSlot="{ text }">
      {{ getAreaTextByCode(text) }}
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
    </template>
  </BasicTable>
  <!--角色工单授权-->
  <DocSendModal @register="registerModal" @success="reload" />
  <BpmPictureModal @register="registerBpmModal" />
</template>
<script lang="ts" name="doc-send-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DocSendModal from './components/DocSendModal.vue';
  import BpmPictureModal from '/@/views/super/bpm/process/manage/components/BpmPictureModal.vue';
  import { columns, searchFormSchema } from './doc.send.data';
  import { list, deleteOne, batchDelete } from './doc.send.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { startProcess } from '/@/views/super/bpm/example/batch/leave.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const [registerModal, { openModal }] = useModal();
  const [registerBpmModal, { openModal: bpmPicModal }] = useModal();
  const { createMessage, createConfirm } = useMessage();

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'doc-send-list',
    tableProps: {
      api: list,
      columns: columns,
      canResize: false,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 120,
      },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  const flowCode = 'joa_doc_send_01';
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
    openModal(true, {
      record,
      isUpdate: true,
    });
  }
  /**
   * 详情
   */
  function handleDetail(record) {
    openModal(true, {
      record,
      isUpdate: true,
      isDetail: true,
    });
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOne({ id: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, reload);
  }
  /**
   * 提交流程
   */
  function handleStartProcess(record) {
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '确认提交流程吗?',
      onOk: async () => {
        let res = await startProcess({
          flowCode: flowCode,
          id: record.id,
          formUrl: 'super/bpm/example/joa/docSend/components/DocSendForm',
          formUrlMobile: 'applyform/docSend',
        });
        if (res.success) {
          createMessage.success(res.message);
          reload();
        } else {
          createMessage.warning(res.message);
        }
      },
    });
  }
  /**
   * 审批进度
   */
  async function handlePreviewPic(record) {
    bpmPicModal(true, {
      flowCode,
      dataId: record.id,
    });
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: record.bpmStatus === '1',
      },
      {
        label: '提交流程',
        onClick: handleStartProcess.bind(null, record),
        ifShow: record.bpmStatus === '1',
      },
    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        ifShow: record.bpmStatus === '1',
      },
      {
        label: '审批进度',
        onClick: handlePreviewPic.bind(null, record),
        ifShow: record.bpmStatus !== '1',
      },
    ];
  }
</script>
