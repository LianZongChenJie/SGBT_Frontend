<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button v-if="hasPermission('system:dim_app_version:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">
          新增版本
        </a-button>
        <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('system:dim_app_version:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            批量操作
            <Icon style="fontsize: 12px" icon="ant-design:down-outlined"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #qrcode>
        <a-tooltip title="点击查看并打印二维码">
          <button class="qrcode-trigger" type="button" aria-label="查看下载二维码" @click="handleQrCodePreview">
            <QrCode :value="APP_DOWNLOAD_URL" :width="48" :options="{ margin: 1 }" />
          </button>
        </a-tooltip>
      </template>
    </BasicTable>

    <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
    <QrCodeModal :download-url="APP_DOWNLOAD_URL" @register="registerQrCodeModal" />
  </div>
</template>

<script lang="ts" setup name="app-version-manage">
  import { computed, ref } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { QrCode } from '/@/components/Qrcode';
  import { usePermission } from '/@/hooks/web/usePermission';
  import DemoModal from './DemoModal.vue';
  import QrCodeModal from './QrCodeModal.vue';
  import { batchDeleteDemo, deleteDemo, getDemoList } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const { hasPermission } = usePermission();
  const checkedKeys = ref<Array<string | number>>([]);
  const isDisabled = ref(false);
  const [registerModal, { openModal }] = useModal();
  const [registerQrCodeModal, { openModal: openQrCodeModal }] = useModal();
  const APP_DOWNLOAD_URL = 'http://192.168.1.230/upFiles/__UNI__465858C__20260916160859.apk';

  const [registerTable, { reload }] = useTable({
    title: 'App版本管理',
    api: getDemoList,
    columns,
    formConfig: {
      schemas: searchFormSchema,
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: false,
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    actionColumn: {
      width: 180,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  const selectedIds = computed(() => checkedKeys.value.map((item) => String(item)).join(','));

  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'system:dim_app_version:edit',
      },
      {
        label: '删除',
        auth: 'system:dim_app_version:delete',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
    });
  }

  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  function handleQrCodePreview() {
    openQrCodeModal(true);
  }

  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, reload);
  }

  async function batchHandleDelete() {
    if (!selectedIds.value) {
      return;
    }

    await batchDeleteDemo({ ids: selectedIds.value }, () => {
      checkedKeys.value = [];
      reload();
    });
  }
</script>

<style lang="less" scoped>
  .qrcode-trigger {
    display: inline-flex;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
</style>
