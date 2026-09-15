<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10" type="flex">
    <a-col :lg="24" :md="24" :xl="4" class="ledger-tree-col">
      <DepartLeftTree ref="leftTree" @select="onTreeSelect" />
    </a-col>
    <a-col :lg="24" :md="24" :xl="20" class="ledger-table-col">
      <div class="address-book">
        <BasicTable :rowSelection="rowSelection" style="padding: 0" @register="registerTable">
          <template #tableTitle>
            <a-button v-if="hasPermission('energy:energy_dim_device_type:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">
              新增
            </a-button>
            <a-upload
              v-if="hasPermission('energy:energy_dim_device_type:importExcel')"
              :customRequest="(file) => handleImportXls(file, getImportUrl, reload)"
              :showUploadList="false"
              name="file"
            >
              <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>
            </a-upload>
            <a-button
              v-if="hasPermission('energy:energy_dim_device_type:exportXls')"
              preIcon="ant-design:export-outlined"
              type="primary"
              @click="handleExportXls('设备分类', getExportUrl, getExportParams())"
            >
              导出
            </a-button>
            <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('energy:energy_dim_device_type:deleteBatch')">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPermission('energy:energy_dim_device_type:deleteBatch')" key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:delete-outlined"></Icon>
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                批量操作
                <Icon icon="ant-design:down-outlined" style="fontsize: 12px"></Icon>
              </a-button>
            </a-dropdown>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
        </BasicTable>
        <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleAddSuccess" />
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { computed, provide, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { filterObj } from '@/utils/common/compUtils';
  import { useMethods } from '@/hooks/system/useMethods';
  import DepartLeftTree from './components/DepartLeftTree.vue';
  import DemoModal from './DemoModal.vue';
  import { columns, searchFormSchema } from './demo.data';
  import { batchDeleteDemo, deleteDemo, DEVICE_TYPE_CATEGORY, getDemoList, getExportUrl, getImportUrl } from './demo.api';

  const { hasPermission } = usePermission();
  const { prefixCls } = useDesign('address-list');
  const { handleExportXls, handleImportXls } = useMethods();

  provide('prefixCls', prefixCls);

  const leftTree = ref();
  const isDisabled = ref(false);
  const currentParentId = ref<string | number | ''>('');
  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload, getForm }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      schemas: searchFormSchema,
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
    beforeFetch: (params) => {
      return {
        ...params,
        ...getBaseSearchParams(),
      };
    },
  });

  function getCurrentParentId() {
    if (currentParentId.value === '' || currentParentId.value === null || currentParentId.value === undefined) {
      return undefined;
    }

    const parsedId = Number(currentParentId.value);
    return Number.isNaN(parsedId) ? currentParentId.value : parsedId;
  }

  function getBaseSearchParams(extraParams: Record<string, unknown> = {}) {
    return filterObj({
      deviceTypeCategory: DEVICE_TYPE_CATEGORY,
      parentId: getCurrentParentId(),
      ...extraParams,
    });
  }

  function getExportParams() {
    const formValues = getForm()?.getFieldsValue?.() || {};
    return getBaseSearchParams(formValues);
  }

  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'energy:energy_dim_device_type:edit',
      },
      {
        label: '删除',
        auth: 'energy:energy_dim_device_type:delete',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  const rowSelection = computed(() => ({
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys.value,
    onChange: onSelectChange,
    fixed: 'left',
  }));

  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  function handleAdd() {
    isDisabled.value = false;
    const parentId = getCurrentParentId();

    openModal(true, {
      isUpdate: false,
      isChild: parentId !== undefined,
      record: getBaseSearchParams({
        parentId,
      }),
    });
  }

  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, () => {
      checkedKeys.value = [];
      leftTree.value?.loadRootTreeData();
      reload();
    });
  }

  async function batchHandleDelete() {
    const ids = checkedKeys.value.map((item) => String(item)).join(',');
    if (!ids) {
      return;
    }

    await batchDeleteDemo({ ids }, () => {
      checkedKeys.value = [];
      leftTree.value?.loadRootTreeData();
      reload();
    });
  }

  function onTreeSelect(data) {
    checkedKeys.value = [];
    currentParentId.value = data?.id ?? data?.dataRef?.id ?? '';
    reload({ page: 1 });
  }

  function handleAddSuccess() {
    checkedKeys.value = [];
    leftTree.value?.loadRootTreeData();
    reload({ page: 1 });
  }
</script>

<style lang="less">
  @import './index.less';
</style>
