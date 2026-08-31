<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #patchReason="{ text }">
        <JEllipsis :value="text" :length="20" />
      </template>
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增补卡</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <OaSignPatchNowModal @register="registerModal" @success="handleSuccess"></OaSignPatchNowModal>
    <!--审批进度-->
    <BpmPictureModal @register="registerBpmModal" />
  </div>
</template>

<script lang="ts" name="oa-sign-patch" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import OaSignPatchNowModal from './components/OaSignPatchNowModal.vue';
  import { patchColumns, patchSearchFormSchema } from './OaSign.data';
  import { patchList, getPatchExportUrl, deletePatchOne } from './OaSign.api';
  import { JEllipsis } from '/@/components/Form';
  import { startProcess } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  //编码
  const flowCode = 'oa_sign_patch_001';

  const checkedKeys = ref<Array<string | number>>([]);
  //提示
  const { createMessage, createConfirm: $confirm } = useMessage();
  //注册model
  const [registerModal, { openModal }] = useModal();
  //审批进度
  const [registerBpmModal, { openModal: bpmPicModal }] = useModal();

  //注册table数据
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '补卡',
      api: patchList,
      columns: patchColumns,
      canResize: false,
      formConfig: {
        labelWidth: 120,
        schemas: patchSearchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToTime: [['patchTime', ['patchTimeBegin', 'patchTimeEnd'], 'YYYY-MM-DD']],
      },
      actionColumn: {
        width: 120,
      },
    },
    exportConfig: {
      name: '补卡列表',
      url: getPatchExportUrl,
    },
  });
  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection, selectedRowKeys }] = tableContext;

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
   * 提交流程
   * @param record
   */
  function handleStartProcess(record: Recordable) {
    $confirm({
      title: '提示',
      content: '确认提交流程吗?',
      iconType: 'warning',
      cancelText: '关闭',
      onOk: () => {
        let param = {
          flowCode: flowCode,
          id: record.id,
          formUrl: 'super/eoa/sign/components/OaSignPatchForm',
          formUrlMobile: 'super/eoa/sign/components/OaSignPatchForm',
        };
        startProcess(param).then((res) => {
          console.log('res', res);
          if (res) {
            reload();
            clearSelectedRowKeys();
          } else {
            createMessage.warning('流程发起失败');
          }
        });
      },
    });
  }

  /**
   * 审批进度
   * @param record
   */
  function handlePreviewPic(record: Recordable) {
    bpmPicModal(true, {
      flowCode: flowCode,
      dataId: record.id,
    });
  }

  /**
   * 删除事件
   * @param record
   */
  async function handleDelete(record) {
    await deletePatchOne({ id: record.id }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 操作栏
   * @param record
   */
  function getTableAction(record) {
    if (record.bpmStatus === '1') {
      return [
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
    } else if (record.bpmStatus === '2' || record.bpmStatus === '3') {
      return [
        {
          label: '审批进度',
          onClick: handlePreviewPic.bind(null, record),
        },
      ];
    } else {
      return [
        {
          label: '历史进度',
          onClick: handlePreviewPic.bind(null, record),
        },
      ];
    }
  }
</script>
