<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button
          v-if="hasPermission('operation:operation_base_repair_experience:add')"
          preIcon="ant-design:plus-outlined"
          type="primary"
          @click="handleAdd"
          >新增</a-button
        >
        <a-button
          v-if="hasPermission('operation:operation_base_repair_experience:startOrStop')"
          preIcon="ant-design:check-circle-outlined"
          type="primary"
          :disabled="!canEnableSelected"
          @click="handleUpdateStatus('0')"
        >
          启用
        </a-button>
        <a-button
          v-if="hasPermission('operation:operation_base_repair_experience:startOrStop')"
          preIcon="ant-design:stop-outlined"
          type="primary"
          :disabled="!canDisableSelected"
          @click="handleUpdateStatus('1')"
        >
          停用
        </a-button>

        <!--        <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, getImportUrl, reload)">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>-->
        <!--        </a-upload>-->
        <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
        <!--          导出-->
        <!--        </a-button>-->
        <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_base_repair_experience:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('operation:operation_base_repair_experience:deleteBatch')" key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon style="fontsize: 12px" icon="ant-design:down-outlined"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <DemoModal @register="registerModal" @success="handleReload" :isDisabled="isDisabled" />
  </div>
</template>
<script lang="ts" setup name="ziliaolu">
  import { computed, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';

  import { getDemoList, deleteDemo, batchDeleteDemo, saveUpdateStatus } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  import { filterObj } from '/@/utils/common/compUtils';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { Modal } from 'ant-design-vue';
  const { hasPermission } = usePermission();

  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRows = ref<Record<string, any>[]>([]);
  const [registerModal, { openModal }] = useModal();
  const isDisabled = ref(false);

  const [registerTable, { reload, getDataSource }] = useTable({
    title: '维修经验库',
    api: getDemoList,
    columns,
    formConfig: {
      labelWidth: 110,
      schemas: searchFormSchema,
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
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
  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    fixed: 'left',
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  const exportParams = computed(() => {
    let paramsForm = {};
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });

  const selectedRecord = computed(() => {
    if (checkedKeys.value.length !== 1) {
      return null;
    }
    if (selectedRows.value.length === 1) {
      return selectedRows.value[0];
    }
    const selectedKey = checkedKeys.value[0];
    return getDataSource<Record<string, any>>().find((item) => String(item?.id) === String(selectedKey)) ?? null;
  });

  const canEnableSelected = computed(() => String(selectedRecord.value?.status ?? '') === '1');
  const canDisableSelected = computed(() => String(selectedRecord.value?.status ?? '') === '0');

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_base_repair_experience:edit',
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        auth: 'operation:operation_base_repair_experience:delete',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], rows: Record<string, any>[] = []) {
    checkedKeys.value = selectedRowKeys;
    selectedRows.value = rows;
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 详情页面
   */
  function handleDetail(record) {
    isDisabled.value = true;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, handleReload);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: checkedKeys.value.join(',') }, handleReload);
  }
  function handleUpdateStatus(status) {
    isDisabled.value = false;
    if (status === '0') {
      Modal.confirm({
        title: '确认开启',
        content: '是否开启选中数据',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const params = {
            ids: checkedKeys.value.join(','),
            status,
          };
          return saveUpdateStatus(params, handleReload);
        },
      });
    } else {
      Modal.confirm({
        title: '确认停用',
        content: '是否停用选中数据',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const params = {
            ids: checkedKeys.value.join(','),
            status,
          };
          return saveUpdateStatus(params, handleReload);
        },
      });
    }
  }

  function resetSelection() {
    checkedKeys.value = [];
    selectedRows.value = [];
  }

  function handleReload(params?) {
    resetSelection();
    reload(params);
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
