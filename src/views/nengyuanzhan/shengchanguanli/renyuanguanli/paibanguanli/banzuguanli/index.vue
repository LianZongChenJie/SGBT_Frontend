<template>
  <div class="app-container">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button v-if="hasPermission('energy:energy_plan_group:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">
          新增
        </a-button>
        <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('energy:energy_plan_group:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('energy:energy_plan_group:deleteBatch')" key="1" @click="batchHandleDelete">
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

    <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
  </div>
</template>

<script setup lang="ts" name="banzuguanli">
  import { computed, ref } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import DemoModal from './DemoModal.vue';
  import { batchDeleteDemo, deleteDemo, getDemoList } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const { hasPermission } = usePermission();
  const checkedKeys = ref<Array<string | number>>([]);
  const isDisabled = ref(false);
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload }] = useTable({
    title: '班组管理',
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
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
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
        auth: 'energy:energy_plan_group:edit',
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        auth: 'energy:energy_plan_group:delete',
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

<style scoped lang="less">
  .app-container {
    padding: 10px;
  }
</style>
