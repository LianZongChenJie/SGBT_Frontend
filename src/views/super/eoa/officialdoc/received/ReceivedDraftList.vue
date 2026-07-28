<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
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
          <Icon icon="ant-design:down-outlined"></Icon>
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
  <ReceivedModal @register="registerModal" @success="handleSuccess"></ReceivedModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { list, deleteBatch, deleteReceived, getExportUrl, getImportUrl } from './received.api';
  import { columns, searchFormSchema } from './received.data';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ExcelButton from '/@/components/jeecg/ExcelButton.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import ReceivedModal from './components/ReceivedModal.vue';
  import { useModal } from '/@/components/Modal';
  import { getEnhanceSqlByCode } from '/@/views/super/online/cgform/components/enhance/enhance.api';
  const { createMessage } = useMessage();
  // 列表页面公共参数、方法
  const { prefixCls, onExportXls, onImportXls, tableContext } = useListPage({
    designScope: 'wps-file-template',
    tableProps: {
      title: '模板管理',
      api: (params) => {
        params.stauts = '0';
        return list(params);
      },
      canResize: false,
      columns: columns,
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
      //草稿箱
      params: { stauts: '0' },
    },
    importConfig: {
      url: getImportUrl,
    },
  });

  //注册table数据
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  //注册modal弹窗
  const [registerModal, { openModal }] = useModal();

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
   * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
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
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
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
