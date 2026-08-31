<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate('word')">新增</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">上传模板</j-upload-button>
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
    <template #fileSlot="{ text: downloadUrl }">
      <span v-if="!downloadUrl" style="font-size: 12px; font-style: italic">无文件</span>
      <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download" size="small" @click="downloadFile(downloadUrl)">下载 </a-button>
    </template>
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { list, createWpsTemplate, deleteBatch, deleteTemplate, getExportUrl, getImportUrl, getViewWpsUrl } from './wps.file.api';
  import { columns, searchFormSchema } from './wps.file.data';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ExcelButton from '/@/components/jeecg/ExcelButton.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getPositionList } from '/@/views/system/position/position.api';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const { createMessage } = useMessage();
  // 列表页面公共参数、方法
  const { prefixCls, onExportXls, onImportXls, tableContext } = useListPage({
    designScope: 'wps-file-template',
    tableProps: {
      title: '模板管理',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
    },
    exportConfig: {
      name: '模板管理列表',
      url: getExportUrl,
      //update-begin---author:wangshuai ---date:20220411  for：[VUEN-661]导出需按创建时间倒序排序------------
      params: { column: 'createTime', order: 'desc' },
      //update-end---author:wangshuai ---date:20220411  for：[VUEN-661]导出需按创建时间倒序排序--------------
    },
    importConfig: {
      url: getImportUrl,
    },
  });

  //注册table数据
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 新增事件
   */
  async function handleCreate() {
    createWpsTemplate().then((res) => {
      if (res.success) {
        reload();
        getViewUrlDbPath(res.result.id, res.result.userId);
      }
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
    await deleteTemplate({ id: record.id }, reload);
  }

  /**
   * 编辑
   */
  async function handleEdit(record) {
    getViewUrlDbPath(record.id, record.userId);
  }

  async function getViewUrlDbPath(fileId, userId) {
    //路由跳转
    const params = {
      fileId: fileId,
      userId: userId,
      text: 'word',
    };
    await getViewWpsUrl(params).then((res) => {
      let routeUrl = router.resolve({
        path: '/wps/viewFile',
      });
      sessionStorage.setItem('WPS_URL', res.data.wpsUrl);
      window.open(routeUrl.href, '_blank');
    });
  }

  /**
   * 操作栏
   * @param record
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
</script>

<style scoped></style>
