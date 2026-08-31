<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
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
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <OaSignOutModal @register="registerModal" @success="handleSuccess"></OaSignOutModal>
    <!--审批进度-->
    <BpmPictureModal @register="registerBpmModal" />
  </div>
</template>

<script lang="ts" name="eoa-sign-out" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import OaSignOutModal from './components/OaSignOutModal.vue';
  import { outColumns, outSearchFormSchema } from './OaSign.data';
  import { outList, deleteOutOne, batchOutDelete, getOutExportUrl } from './OaSign.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { startProcess } from '/@/api/common/api';
  //编码
  const flowCode = 'oa_sign_out_001';
  //提示
  const { createMessage, createConfirm: $confirm } = useMessage();
  //选择的key
  const checkedKeys = ref<Array<string | number>>([]);
  //注册model
  const [registerModal, { openModal }] = useModal();
  //审批进度
  const [registerBpmModal, { openModal: bpmPicModal }] = useModal();
  //注册table数据
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      api: outList,
      columns: outColumns,
      canResize: false,
      formConfig: {
        labelWidth: 120,
        schemas: outSearchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToTime: [['expectedStartTime', ['expectedStartTimeBegin', 'expectedStartTimeEnd'], 'YYYY-MM-DD']],
      },
      actionColumn: {
        width: 200,
      },
    },
    exportConfig: {
      name: '外勤',
      url: getOutExportUrl,
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
   * 详情
   * @param record
   */
  function handleDetail(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: false,
    });
  }

  /**
   * 删除事件
   * @param record
   */
  async function handleDelete(record) {
    await deleteOutOne({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchOutDelete({ ids: selectedRowKeys.value }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 发起流程
   * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
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
          formUrl: 'super/eoa/sign/components/OaSignOutForm',
          formUrlMobile: 'super/eoa/sign/components/OaSignOutForm',
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
   */
  function handlePreviewPic(record) {
    bpmPicModal(true, {
      flowCode: flowCode,
      dataId: record.id,
    });
  }

  /**
   * 操作栏
   * @param record
   */
  function getTableAction(record) {
    if (record.bpmStatus === '1') {
      return getTableActionOne(record);
    } else if (record.bpmStatus === '2') {
      return getTableActionTwo(record, '审批进度');
    } else if (record.bpmStatus === '3') {
      return getTableActionThree(record);
    } else {
      return getTableActionTwo(record, '历史进度');
    }
  }

  /**
   * 或取第一个tableAction
   * @param record
   */
  function getTableActionOne(record) {
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
   * 获取第二个tableAction
   * @param record
   */
  function getTableActionTwo(record, label) {
    return [
      {
        label: label,
        onClick: handlePreviewPic.bind(null, record),
      },
    ];
  }

  /**
   * 获取第三个tableAction
   * @param record
   */
  function getTableActionThree(record) {
    return [
      {
        label: '审批进度',
        onClick: handlePreviewPic.bind(null, record),
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
    ];
  }
</script>
