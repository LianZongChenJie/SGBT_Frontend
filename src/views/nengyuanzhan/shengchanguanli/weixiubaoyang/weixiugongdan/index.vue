<template>
  <div style="padding: 10px" class="box">
    <a-card>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key="1" tab="全部工单"></a-tab-pane>
        <a-tab-pane :key="2" tab="我的工单"></a-tab-pane>
        <a-tab-pane :key="3" tab="我的验收"></a-tab-pane>
        <a-tab-pane :key="4" tab="我的派工"></a-tab-pane>
      </a-tabs>
      <BasicTable :rowSelection="rowSelection" @register="registerTable">
        <template #tableTitle>
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:add')"
            preIcon="ant-design:plus-outlined"
            type="primary"
            @click="handleAdd"
            >新增</a-button
          >
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:assign')"
            preIcon="ant-design:send-outlined"
            type="primary"
            :disabled="!canAssignSelected"
            @click="handleSelectedAssign"
          >
            派工
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:acceptOrder')"
            preIcon="ant-design:check-outlined"
            type="primary"
            :disabled="!canReceiveSelected"
            @click="handleSelectedReceive"
          >
            接单
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:execute')"
            preIcon="ant-design:tool-outlined"
            type="primary"
            :disabled="!canExecuteSelected"
            @click="handleSelectedExecute"
          >
            执行维修
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:accept')"
            preIcon="ant-design:check-circle-outlined"
            type="primary"
            :disabled="!canAcceptSelected"
            @click="handleSelectedAccept"
          >
            验收
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:exportXls')"
            preIcon="ant-design:export-outlined"
            type="primary"
            @click="handleExportXls('维修工单', getExportUrl, exportParams)"
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
          <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_base_repair_order:deleteBatch')">
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="hasPermission('operation:operation_base_repair_order:deleteBatch')" @click="batchHandleDelete">
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

        <template #guanlianguzhangdanhao="{ text, record }">
          <div style="display: flex; align-items: flex-start; gap: 8px; width: 100%">
            <a-button type="link" @click="goDetail(record)">{{ text }}</a-button>
          </div>
        </template>
      </BasicTable>
      <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleReload" />
      <DemoModalEdit :isDisabled="isDisabled" @register="registerModalEdit" @success="handleReload" />
      <DemoModalDetail :isDisabled="isDisabled" @register="registerModalDetail" @success="handleReload" />
      <DemoModalPaigong :isDisabled="isDisabled" @register="registerModalPaigong" @success="handleReload" />
      <DemoModalZhixingweixiu :isDisabled="isDisabled" @register="registerModalZhixingweixiu" @success="handleReload" />
      <DemoModalYanshou :isDisabled="isDisabled" @register="registerModalYanshou" @success="handleReload" />
    </a-card>
  </div>
</template>

<script setup lang="ts" name="weixiugongdan">
  import { computed, onMounted, ref, watch } from 'vue';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import DemoModal from './DemoModal.vue';
  import DemoModalEdit from './DemoModalEdit.vue';
  import DemoModalDetail from './DemoModalDetail.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useRouter } from 'vue-router';
  import { filterObj } from '@/utils/common/compUtils';

  const router = useRouter();
  function goDetail(record) {
    if (!record?.faultOrderNo) {
      createMessage.warning('当前维修工单未关联故障报修单号');
      return;
    }
    router.push({
      path: '/shengchanguanli/weixiubaoyang/guzhangbaoxiu', // B 页面路由
      query: {
        orderNo: record.faultOrderNo,
        type: 'detail', // 标记详情模式
      },
    });
  }
  const { hasPermission } = usePermission();
  import { useMethods } from '@/hooks/system/useMethods';

  const { handleExportXls, handleImportXls } = useMethods();
  import { saveAcceptOrder, getDemoById, getDemoListAll, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  import DemoModalPaigong from './DemoModalPaigong.vue';
  import DemoModalYanshou from './DemoModalYanshou.vue';
  import DemoModalZhixingweixiu from './DemoModalZhixingweixiu.vue';
  import { Modal } from 'ant-design-vue';
  const { createMessage } = useMessage();

  const [registerModal, { openModal }] = useModal();
  const [registerModalZhixingweixiu, { openModal: openModalZhixingweixiu }] = useModal();
  const [registerModalEdit, { openModal: openModalEdit }] = useModal();
  const [registerModalDetail, { openModal: openModalDetail }] = useModal();
  const [registerModalPaigong, { openModal: openModalPaigong }] = useModal();
  const [registerModalYanshou, { openModal: openModalYanshou }] = useModal();
  const isDisabled = ref(false);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRows = ref<Record<string, any>[]>([]);
  const activeKey = ref(1);
  const [registerTable, { reload, getDataSource, getForm }] = useTable({
    title: '',
    api: getDemoListAll,
    columns,
    formConfig: {
      //labelWidth: 120,
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
      return {
        ...params,
        tabType: activeKey.value,
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
  const exportParams = computed(() => {
    const paramsForm: Record<string, unknown> = {
      ...(getForm()?.getFieldsValue?.() || {}),
      tabType: activeKey.value,
    };
    if (checkedKeys.value.length > 0) {
      paramsForm.selections = checkedKeys.value.join(',');
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
        auth: 'operation:operation_base_repair_order:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
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
        auth: 'operation:operation_base_repair_order:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  const selectedRecord = computed(() => {
    if (checkedKeys.value.length !== 1) {
      return null;
    }
    const selectedKey = checkedKeys.value[0];
    const rowFromSelection = selectedRows.value.length === 1 ? selectedRows.value[0] : null;
    const rowFromDataSource = getDataSource<Record<string, any>>().find((item) => String(item?.id) === String(selectedKey)) ?? null;
    const resolvedRecord = rowFromDataSource ?? rowFromSelection;

    if (!resolvedRecord) {
      return selectedKey !== undefined ? { id: selectedKey } : null;
    }

    if (resolvedRecord.id === undefined || resolvedRecord.id === null || resolvedRecord.id === '') {
      return {
        ...resolvedRecord,
        id: selectedKey,
      };
    }

    return resolvedRecord;
  });

  const canExecuteSelected = computed(() => !!selectedRecord.value && canExecuteRepair(selectedRecord.value));
  const canAcceptSelected = computed(() => !!selectedRecord.value && canAcceptRepair(selectedRecord.value));
  const canAssignSelected = computed(() => !!selectedRecord.value && canAssignRepair(selectedRecord.value));
  const canReceiveSelected = computed(() => !!selectedRecord.value && canReceiveRepair(selectedRecord.value));

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
      createMessage.warning(`请先勾选一条工单后再${actionLabel}`);
      return null;
    }
    if (checkedKeys.value.length > 1 || selectedRows.value.length > 1) {
      createMessage.warning(`${actionLabel}时只能选择一条工单`);
      return null;
    }
    return selectedRecord.value;
  }

  function canExecuteRepair(record) {
    return Number(record?.status) === 2 || Number(record?.reviewStatus) === 4 || Number(record?.reviewStatus) === 5;
  }

  function canAcceptRepair(record) {
    return Number(record?.status) === 3 || Number(record?.reviewStatus) === 6;
  }

  function canAssignRepair(record) {
    return Number(record?.status) === 1;
  }

  function canReceiveRepair(record) {
    return Number(record?.status) === 1;
  }

  function handleSelectedAssign() {
    const record = getSingleSelectedRecord('派工');
    if (!record) {
      return;
    }
    if (!canAssignRepair(record)) {
      createMessage.warning('当前工单状态不支持派工');
      return;
    }
    handlePaigong(record);
  }

  function handleSelectedReceive() {
    const record = getSingleSelectedRecord('接单');
    if (!record) {
      return;
    }
    if (!canReceiveRepair(record)) {
      createMessage.warning('当前工单状态不支持接单');
      return;
    }
    handleJiedan(record);
  }

  function handleSelectedExecute() {
    const record = getSingleSelectedRecord('执行维修');
    if (!record) {
      return;
    }
    if (!canExecuteRepair(record)) {
      createMessage.warning('当前工单状态不支持执行维修');
      return;
    }
    handleZhixingweixiu(record);
  }

  function handleSelectedAccept() {
    const record = getSingleSelectedRecord('验收');
    if (!record) {
      return;
    }
    if (!canAcceptRepair(record)) {
      createMessage.warning('当前工单状态不支持验收');
      return;
    }
    handleYanshou(record);
  }

  function handlePaigong(record) {
    isDisabled.value = false;
    openModalPaigong(true, {
      record,
      isUpdate: true,
    });
  }

  async function handleZhixingweixiu(record) {
    isDisabled.value = false;
    const recordId = record?.id ?? checkedKeys.value[0];
    const detailRecord = recordId ? await getDemoById({ id: recordId }) : null;
    const currentRecord = detailRecord || {
      ...record,
      id: recordId,
    };
    openModalZhixingweixiu(true, {
      record: currentRecord,
      isUpdate: true,
      skipFetch: true,
    });
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

  function handleEditTiaozheng(record) {
    isDisabled.value = false;
    openModalEdit(true, {
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

  async function handleJiedan(record) {
    saveAcceptOrder({ id: record.id }, handleReload);
  }

  function handleYanshou(record) {
    isDisabled.value = false;
    openModalYanshou(true, {
      record,
      isUpdate: true,
    });
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

  onMounted(() => {
    watch(
      () => activeKey.value,
      () => {
        handleReload({ page: 1 }); // 切 tab 回到第一页
      },
      { deep: true, immediate: false }
    );
  });
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
