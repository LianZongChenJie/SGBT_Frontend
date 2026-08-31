<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #isDisplay="{ record }">
        <a-switch v-model:checked="record.isDisplay" checkedValue="Y" unCheckedValue="N" @change="changeIsDisplay(record)" />
      </template>
      <template #tableTitle>
        <a-button v-if="hasPermission('operation:operation_anomaly_rule:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
          >新增告警规则</a-button
        >
        <!--        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleEdit">新增资料</a-button>-->
        <!--        <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, getImportUrl, reload)">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>-->
        <!--        </a-upload>-->
        <a-button
          v-if="hasPermission('operation:operation_anomaly_rule:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('告警规则', getExportUrl, exportParams)"
        >
          导出
        </a-button>
        <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_anomaly_rule:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete" v-if="hasPermission('operation:operation_anomaly_rule:deleteBatch')">
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

    <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
  </div>
</template>
<script lang="ts" setup name="gaojingguize">
  import { computed, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { filterObj } from '/@/utils/common/compUtils';
  import DemoModal from './DemoModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  import { batchDeleteDemo, deleteDemo, getDemoList, getExportUrl, saveOrUpdateDemo } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  import { Modal } from 'ant-design-vue';

  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const { handleExportXls } = useMethods();
  const isDisabled = ref(false);

  const [registerTable, { reload, getForm }] = useTable({
    title: '告警规则',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    //自定义默认排序
    // defSort: {
    //   column: 'createTime,sex',
    //   order: 'desc',
    // },
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
    canResize: true,
    rowKey: 'id',
    actionColumn: {
      width: 120,
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
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
    fixed: 'left',
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
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_anomaly_rule:edit',
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        auth: 'operation:operation_anomaly_rule:delete',
        label: '删除',
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
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
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
    await deleteDemo({ id: record.id }, reload);
  }
  async function changeIsDisplay(record) {
    const nextValue = record.isDisplay;
    Modal.confirm({
      title: '确认更改',
      content: '是否更改处置页面显示？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return saveOrUpdateDemo({ ...record, isDisplay: nextValue }, true).then(() => {
          reload();
        });
      },
    });
  }

  /**
   * 批量删除事件
   */
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
