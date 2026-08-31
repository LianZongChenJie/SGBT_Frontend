<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
        <a-dropdown v-if="checkedKeys.length > 0">
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
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #fileSlot="{ text }">
        <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined" size="small" @click="downloadFile(text)">下载</a-button>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <IssuedModal @register="registerModal" @success="handleSuccess"></IssuedModal>
    <!--审批进度-->
    <BpmPictureModal @register="registerBpmModal" />
  </div>
</template>

<script lang="ts" name="officialDocIssuedList" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import IssuedModal from './components/IssuedModal.vue';
  import { bpmColumns, searchFormSchema } from './issued.data';
  import { list, deleteOne, batchDelete, getImportUrl, getExportUrl } from './issued.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { startProcess } from "/@/api/common/api";
  //选中的key
  const checkedKeys = ref<Array<string | number>>([]);
  //注册model
  const [registerModal, { openModal }] = useModal();
  //注册table数据
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '公文发文列表',
      api: (params) => {
        //0 草稿箱 1 已发送
        params.stauts = '1';
        return list(params);
      },
      columns: bpmColumns,
      canResize: false,
      formConfig: {
        labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
      },
      actionColumn: {
        width: 180,
      },
    },
    exportConfig: {
      name: '发文列表',
      url: getExportUrl,
      //已发送的
      params: { stauts: '1' },
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const flowCode = 'officialdoc_issued';
  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection, selectedRowKeys }] = tableContext;
  //审批进度
  const [registerBpmModal, { openModal: bpmPicModal }] = useModal();
  const { createMessage, createConfirm: $confirm } = useMessage();
  /**
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
    });
  }
  /**
   * 编辑事件
   * @param record
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
  }

  /**
   * 删除事件
   * @param record
   */
  async function handleDelete(record) {
    await deleteOne({ id: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: checkedKeys.value }, reload);
  }
  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }
  /**
   * 操作栏
   * @param record
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
   * bpmStatus为1时的action
   * @param record
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
   * @param record
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
   * @param record
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
   * 提交流程点击事件
   * @param record
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
          formUrl: 'super/eoa/officialdoc/issued/components/IssuedForm',
          formUrlMobile: 'super/eoa/officialdoc/issued/components/IssuedForm',
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
   * @param record
   */
  function handlePreviewPic(record) {
    bpmPicModal(true, {
      flowCode: flowCode,
      dataId: record.id,
    });
  }

  /**
   * 文件下载
   * @param url 文件路径
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
</script>

<style scoped></style>