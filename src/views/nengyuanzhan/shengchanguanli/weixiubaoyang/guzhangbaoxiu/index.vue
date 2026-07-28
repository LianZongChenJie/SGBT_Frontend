<template>
  <div style="padding: 10px" class="box">
    <a-card>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key="1" tab="全部"></a-tab-pane>
        <a-tab-pane :key="2" tab="我的报修"></a-tab-pane>
        <a-tab-pane :key="3" tab="我的审批"></a-tab-pane>
      </a-tabs>
      <BasicTable :rowSelection="rowSelection" @register="registerTable">
        <template #tableTitle>
          <a-button
            v-if="hasPermission('operation:operation_base_fault_order:add')"
            preIcon="ant-design:plus-outlined"
            type="primary"
            @click="handleAdd"
            >新增
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_base_fault_order:dispatch')"
            preIcon="ant-design:send-outlined"
            type="primary"
            :disabled="!canDispatchSelected"
            @click="handleSelectedDispatch"
            >派工
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_base_fault_order:exportXls')"
            preIcon="ant-design:export-outlined"
            type="primary"
            @click="handleExportXls('故障报修', getExportUrl, exportParams)"
            >导出
          </a-button>
          <!--            <a-button v-if="hasPermission('operation:operation_inspection_point_plan:exportTemplate')"  type="primary" @click="onExportXls">下载模版</a-button>-->
          <!--            <j-upload-button v-if="hasPermission('operation:operation_inspection_point_plan:importExcel')" type="primary" @click="onImportXls">导入计划</j-upload-button>-->

          <!--        <a-upload :customRequest="(file) => handleImportXls(file, getImportUrl, reload)" :showUploadList="false" name="file">-->
          <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
          <!--        </a-upload>-->
          <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
          <!--          下载模版-->
          <!--        </a-button>-->
          <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_base_fault_order:deleteBatch')">
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="hasPermission('operation:operation_base_fault_order:deleteBatch')" @click="batchHandleDelete">
                  <Icon icon="ant-design:delete-outlined" />
                  批量删除
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              批量操作
              <Icon icon="ant-design:down-outlined" />
            </a-button>
          </a-dropdown>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getActions(record)" />
        </template>
      </BasicTable>
      <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleReload" />
      <DemoModalPaigong :isDisabled="isDisabled" @register="registerModalPaigong" @success="handleReload" />
      <DemoModalDetail :isDisabled="isDisabled" @register="registerModalDetail" @success="handleReload" />
    </a-card>
  </div>
</template>

<script setup lang="ts" name="guzhangbaoxiu">
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useMethods } from '@/hooks/system/useMethods';
  import { useRoute } from 'vue-router';
  import { useMessage } from '/@/hooks/web/useMessage';

  const route = useRoute();
  const { createMessage } = useMessage();
  const { handleExportXls, handleImportXls } = useMethods();
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import DemoModalPaigong from './DemoModalPaigong.vue';
  import DemoModalDetail from './DemoModalDetail.vue';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { getDemoListAll, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  import { filterObj } from '@/utils/common/compUtils';

  const [registerModal, { openModal }] = useModal();
  const [registerModalPaigong, { openModal: openModalPaigong }] = useModal();
  const [registerModalDetail, { openModal: openModalDetail }] = useModal();
  const isDisabled = ref(false);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRows = ref<Record<string, any>[]>([]);
  const activeKey = ref(1);
  const exportParams = computed(() => {
    let paramsForm = {
      tabType: activeKey.value,
    };
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });
  const [registerTable, { reload, getDataSource, getForm }] = useTable({
    title: '',
    api: getDemoListAll,
    columns,
    formConfig: {
      // labelWidth: 120,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
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
    beforeFetch: (params) => {
      const routeOrderNo = Array.isArray(route.query.orderNo) ? route.query.orderNo[0] : route.query.orderNo;
      return {
        ...params,
        tabType: activeKey.value,
        orderNo: params.orderNo ?? routeOrderNo,
      };
    },
    actionColumn: {
      width: 180,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
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
        auth: 'operation:operation_base_fault_order:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        auth: 'operation:operation_base_fault_order:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

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

  const canDispatchSelected = computed(() => !!selectedRecord.value);

  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    fixed: 'left',
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], rows: Record<string, any>[] = []) {
    checkedKeys.value = selectedRowKeys;
    selectedRows.value = rows;
  }

  function getSingleSelectedRecord(actionLabel: string) {
    if (checkedKeys.value.length === 0) {
      createMessage.warning(`请先勾选一条报修单后再${actionLabel}`);
      return null;
    }
    if (checkedKeys.value.length > 1 || selectedRows.value.length > 1) {
      createMessage.warning(`${actionLabel}时只能选择一条报修单`);
      return null;
    }
    return selectedRecord.value;
  }

  function handleSelectedDispatch() {
    const record = getSingleSelectedRecord('派工');
    if (!record) {
      return;
    }
    handlePaigong(record);
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

  function handlePaigong(record) {
    isDisabled.value = false;
    openModalPaigong(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 详情页面
   */
  function handleDetail(record) {
    isDisabled.value = true;
    openModalDetail(true, {
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

  function resetSelection() {
    checkedKeys.value = [];
    selectedRows.value = [];
  }

  function handleReload(params?) {
    resetSelection();
    reload(params);
  }

  async function applyRouteOrderNo() {
    const orderNo = Array.isArray(route.query.orderNo) ? route.query.orderNo[0] : route.query.orderNo;
    await nextTick();
    const form = getForm?.();
    if (form?.setFieldsValue) {
      await form.setFieldsValue({
        orderNo: orderNo || undefined,
      });
    }
    handleReload({ page: 1 });
  }

  onMounted(() => {
    const record = route.query.record;
    const type = route.query.type;

    if (type === 'detail' && record) {
      handleDetail(record);
    }
    applyRouteOrderNo();
    watch(
      () => activeKey,
      () => {
        handleReload({ page: 1 }); // 切 tab 回到第一页
      },
      { deep: true, immediate: false }
    );
  });
  watch(
    () => route.query.orderNo,
    () => {
      applyRouteOrderNo();
    }
  );
</script>

<style scoped lang="less">
  .box {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }

  .jeecg-basic-table-form-container {
    padding: 0;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
