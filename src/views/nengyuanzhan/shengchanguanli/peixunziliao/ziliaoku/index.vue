<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button
          v-if="hasPermission('operation:operation_training_material:add')"
          preIcon="ant-design:plus-outlined"
          type="primary"
          @click="handleAdd"
          >新增资料</a-button
        >
        <!--        <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, getImportUrl, reload)">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>-->
        <!--        </a-upload>-->
        <a-button
          v-if="hasPermission('operation:operation_training_material:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('培训资料', getExportUrl, exportParams)"
        >
          导出
        </a-button>
        <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_training_material:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('operation:operation_training_material:deleteBatch')" key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon style="font-size: 12px" icon="ant-design:down-outlined"></Icon>
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
<script lang="ts" setup name="ziliaoku">
  import { computed, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { filterObj } from '/@/utils/common/compUtils';
  import DemoModal from './DemoModal.vue';
  import { batchDeleteDemo, deleteDemo, getDemoList, getExportUrl } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();

  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const { handleExportXls } = useMethods();
  const isDisabled = ref(false);

  const [registerTable, { reload, getForm }] = useTable({
    title: '培训资料',
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
  const exportParams = computed(() => {
    const paramsForm: Record<string, unknown> = {
      ...(getForm()?.getFieldsValue?.() || {}),
    };
    if (selectedIds.value) {
      paramsForm.selections = selectedIds.value;
    }
    return filterObj(paramsForm);
  });

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record: Recordable) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_training_material:edit',
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        auth: 'operation:operation_training_material:delete',
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

  function handleEdit(record: Recordable) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  function handleDetail(record: Recordable) {
    isDisabled.value = true;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  async function handleDelete(record: Recordable) {
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
  .jeecg-basic-table-form-container {
    padding: 0;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
