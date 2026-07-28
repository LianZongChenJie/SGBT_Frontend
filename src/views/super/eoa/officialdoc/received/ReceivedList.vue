<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate('word')">新增</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchHandleDelete">
              <Icon icon="ant-design:delete-outlined" />
              删除
            </a-menu-item>
          </a-menu>
        </template>
        <a-button
          >批量操作
          <Icon icon="ant-design:down-outlined" />
        </a-button>
      </a-dropdown>
    </template>
    <!--文件下载    -->
    <template #fileSlot="{ text }">
      <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
      <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download" size="small" @click="downloadFile(text)">下载 </a-button>
    </template>
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <ReceivedModal @register="registerModal" @success="handleSuccess" />
  <!--审批进度-->
  <BpmPictureModal @register="registerBpmModal" />
</template>

<script lang="ts" setup name="officialDocReceivedList">
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { list, deleteBatch, deleteReceived, getExportUrl, getImportUrl } from './received.api';
  import { columns, searchFormSchema, bpmColumns } from './received.data';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ExcelButton from '/@/components/jeecg/ExcelButton.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import ReceivedModal from './components/ReceivedModal.vue';
  import { useModal } from '/@/components/Modal';
  import { startProcess } from '/@/api/common/api';
  // 列表页面公共参数、方法
  const { prefixCls, onExportXls, onImportXls, tableContext } = useListPage({
    designScope: 'wps-file-template',
    tableProps: {
      title: '模板管理',
      api: (params) => {
        params.stauts = '1';
        return list(params);
      },
      canResize: false,
      columns: bpmColumns,
      formConfig: {
        schemas: searchFormSchema,
        fieldMapToTime: [['receiptDate', ['receiptDate_begin', 'receiptDate_end'], 'YYYY-MM-DD']],
      },
      actionColumn: {
        width: 180,
      },
    },
    exportConfig: {
      name: '收文列表',
      url: getExportUrl,
      //已发送的
      params: { stauts: '1' },
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  //提示
  const { createMessage, createConfirm: $confirm } = useMessage();
  //注册table数据
  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection, selectedRowKeys }] = tableContext;
  //注册modal弹窗
  const [registerModal, { openModal }] = useModal();
  //审批进度
  const [registerBpmModal, { openModal: bpmPicModal }] = useModal();
  //流程code
  const flowCode = 'dev_oa_officialdoc_received_001';
  /**
   * 新增事件
   */
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await deleteBatch({ ids: selectedRowKeys.value }, reload);
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteReceived({ id: record.id }, reload);
  }

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
   * 操作栏
   */
  function getTableAction(record) {
    if (record.bpmStatus == '1') {
      return getFirstAction(record);
    }
    if (record.bpmStatus == '2') {
      return getSecondAction(record);
    }
    if (record.bpmStatus == '3') {
      return getThirdAction(record);
    }
  }

  /**
   *提交流程点击事件
   */
  function handleStartProcess(record) {
    $confirm({
      title: '提示',
      content: '确认提交流程吗?',
      iconType: 'warning',
      cancelText: '关闭',
      onOk: () => {
        let param = {
          flowCode: flowCode,
          id: record.id,
          formUrl: 'super/eoa/officialdoc/received/components/ReceivedForm',
          formUrlMobile: 'super/eoa/officialdoc/received/components/ReceivedForm',
        };
        startProcess(param).then((res) => {
          console.log('res', res);
          if (res.success) {
            createMessage.success(res.message);
            reload();
            clearSelectedRowKeys();
          } else {
            createMessage.warning(res.message);
          }
        });
      },
    });
  }

  /**
   *审批进度点击事件
   */

  function handlePreviewPic(record) {
    bpmPicModal(true, {
      flowCode: flowCode,
      dataId: record.id,
    });
  }

  /**
   * bpmStatus为1时的action
   */
  function getFirstAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '提交流程',
        onClick: handleStartProcess.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '确定删除吗?',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  /**
   * bpmStatus为2时的action
   */
  function getSecondAction(record) {
    return [
      {
        label: '审批进度',
        onClick: handlePreviewPic.bind(null, record),
      },
    ];
  }

  /**
   * bpmStatus为3时的action
   */
  function getThirdAction(record) {
    return [
      {
        label: '历史',
        onClick: handlePreviewPic.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
      },
    ];
  }

  /**
   * 文件下载
   */
  function downloadFile(url) {
    if (!url) {
      createMessage.warning('未知的文件');
      return;
    }
    if (url.indexOf(',') > 0) {
      url = url.substring(0, url.indexOf(','));
    }
    url = getFileAccessHttpUrl(url.split(',')[0]);
    if (url) {
      window.open(url);
    }
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }
</script>

<style scoped></style>
