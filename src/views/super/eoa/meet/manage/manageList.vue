<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" style="margin-right: 5px">新增</a-button>
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
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <ManageModal @register="registerModal" @success="reload" />
    <BpmPictureModal @register="registerBpmModal" />
  </div>
</template>
<script lang="ts" name="meet-manage-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { getList, deleteOne, batchDelete, getExportUrl, getImportUrl } from './manage.api';
  import { columns, searchFormSchema } from './manage.data';
  import ManageModal from './components/ManageModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { defHttp } from "/@/utils/http/axios";

  const { createMessage, createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerBpmModal, { openModal: bpmPicModal }] = useModal();

  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'meet-room-list',
    tableProps: {
      title: '会议室管理',
      api: getList,
      columns: columns,
      canResize: false,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 150,
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '用户列表',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  //流程编码
  const flowCode = 'dev_eoa_metting_001';
  /**
   * 发起流程
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
          formUrl: 'super/eoa/meet/manage/components/MeetManageForm',
          formUrlMobile: 'super/eoa/meet/manage/components/MeetManageForm',
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
   * 流程进度
   */
  function handlePreviewPic(record) {
    bpmPicModal(true, {
      flowCode,
      dataId: record.id,
    });
  }
  /**
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 提交流程
   * @param params
   */
  function startProcess(params){
    return defHttp.post({ url: '/act/process/extActProcess/startMutilProcess', params }, { isTransformResponse: false });
  };
  
  /**
   * 编辑事件
   */
  function handleEdit(record) {
    openModal(true, {
      id: record.id,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOne({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
  }

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    if (record.approvalStatus == '0') {
      return [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
        },
        {
          label: '删除',
          popConfirm: {
            title: '是否确认删除',
            placement: 'left',
            confirm: handleDelete.bind(null, record),
          },
        },
      ];
    } else if (record.approvalStatus == '1') {
      return [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
          ifShow: () => {
            return record.bpmStatus === '1' || record.bpmStatus === '3';
          },
        },
        {
          label: '删除',
          popConfirm: {
            title: '是否确认删除',
            placement: 'left',
            confirm: handleDelete.bind(null, record),
          },
          ifShow: () => {
            return record.bpmStatus === '1';
          },
        },
        {
          label: '提交流程',
          onClick: handleStartProcess.bind(null, record),
          ifShow: record.bpmStatus === '1' && record.status !== '3',
        },
        {
          label: '审批进度',
          onClick: handlePreviewPic.bind(null, record),
          ifShow: record.bpmStatus === '2' || record.bpmStatus === '3',
        },
        {
          label: '历史进度',
          onClick: handlePreviewPic.bind(null, record),
          ifShow: record.bpmStatus === '4',
        },
      ];
    }
  }

  /**
   * 删除成功之后清空选中
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }
</script>
