<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10" style="max-height: 800px" type="flex">
    <a-col :xl="4" :lg="24" :md="24" style="margin-bottom: 10px">
      <DepartLeftTree @select="onTreeSelect" />
    </a-col>
    <a-col :xl="20" :lg="24" :md="24" style="margin-bottom: 10px">
      <div class="address-book" style="height: 100%">
        <BasicTable :rowSelection="rowSelection" style="padding: 0" @register="registerTable">
          <template #tableTitle>
            <a-button v-if="hasPermission('energy:spareParts:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
              >新增</a-button
            >
            <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('energy:spareParts:deleteBatch')">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPermission('energy:spareParts:deleteBatch')" key="1" @click="batchHandleDelete">
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
        </BasicTable>
        <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleAddSuccess" />
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { filterObj } from '@/utils/common/compUtils';
  import DepartLeftTree from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeifenlei/components/DepartLeftTree.vue';
  import DemoModal from './DemoModal.vue';
  import { columns, searchFormSchema } from './demo.data';
  import { batchDeleteDemo, deleteDemo, getDemoList, SPARE_PARTS_CATEGORY } from './demo.api';

  const { hasPermission } = usePermission();
  const { prefixCls } = useDesign('address-list');

  const isDisabled = ref(false);
  const currentDeviceTypeId = ref<string | number | ''>('');
  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload }] = useTable({
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

  function getCurrentDeviceTypeId() {
    if (currentDeviceTypeId.value === '' || currentDeviceTypeId.value === null || currentDeviceTypeId.value === undefined) {
      return undefined;
    }

    const parsedId = Number(currentDeviceTypeId.value);
    return Number.isNaN(parsedId) ? currentDeviceTypeId.value : parsedId;
  }

  function getBaseSearchParams(extraParams: Record<string, unknown> = {}) {
    return filterObj({
      category: SPARE_PARTS_CATEGORY,
      deviceTypeId: getCurrentDeviceTypeId(),
      ...extraParams,
    });
  }

  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'energy:spareParts:edit',
      },
      {
        label: '删除',
        auth: 'energy:spareParts:delete',
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
    openModal(true, {
      isUpdate: false,
      record: getBaseSearchParams(),
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
      reload();
    });
  }

  function onTreeSelect(data) {
    checkedKeys.value = [];
    currentDeviceTypeId.value = data?.id ?? data?.dataRef?.id ?? '';
    reload({ page: 1 });
  }

  function handleAddSuccess() {
    checkedKeys.value = [];
    reload({ page: 1 });
  }
</script>

<style lang="less">
  @import './index.less';
</style>
