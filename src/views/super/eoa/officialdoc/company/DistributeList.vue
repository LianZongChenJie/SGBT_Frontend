<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="transferIn">转收文</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
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
  <DistributeModal @register="registerModal" @success="handleSuccess" />
</template>

<script lang="ts" setup name="officialDocDistributeList">
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { list, deleteBatch, deleteReceived, getExportUrl, getDepartIdByCode } from './distribute.api';
  import { columns, searchFormSchema } from './distribute.data';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import DistributeModal from './components/DistributeModal.vue';
  //提示
  const { createMessage } = useMessage();
  //用户信息
  const userStore = useUserStore();
  const sysParams = ref({
    departId: '',
    userId: userStore.getUserInfo.id,
  });
  // 列表页面公共参数、方法
  const { onExportXls, tableContext } = useListPage({
    designScope: 'company-receive-list',
    tableProps: {
      title: '公司收文',
      api: list,
      canResize: false,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 180,
      },
      beforeFetch: (params) => {
        return Object.assign(params, sysParams.value);
      },
    },
    exportConfig: {
      name: '公司收文',
      url: getExportUrl,
    },
  });
  //提示
  const { createMessage: $message } = useMessage();
  //注册table数据
  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
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
   */
  function handleEdit(record) {
    openModal(true, {
      record,
      type: false,
    });
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '转发',
        onClick: handleEdit.bind(null, record),
        ifShow: () => {
          return record.status == '0';
        },
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
   *转发
   */
  function transferIn() {
    if (selectedRowKeys.value.length <= 0) {
      $message.warning('请选择一条记录！');
    } else {
      let bool = selectedRows.value.some((row) => row.status === '1');
      if (bool) {
        $message.warning('请选择未处理的！');
      } else {
        let ids = selectedRowKeys.value.join(',');
        openModal(true, {
          ids,
          type: true,
        });
      }
    }
  }

  /**
   * 查询部门ID
   */
  async function getDepartId() {
    let result = await getDepartIdByCode({ sysCode: userStore.getUserInfo.orgCode });
    console.log("result",result);
    sysParams.value.departId = result;
  }
  //初始化查询部门ID
  getDepartId();
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
   * 成功后的回调
   */
  function handleSuccess() {
    reload();
    clearSelectedRowKeys();
  }
</script>

<style scoped></style>
