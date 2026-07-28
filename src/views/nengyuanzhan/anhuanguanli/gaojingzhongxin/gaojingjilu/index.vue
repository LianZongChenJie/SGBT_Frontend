<template>
  <div class="app-container">
    <a-card class="stats-card">
      <div class="stats-overview">
        <div v-for="item in statCards" :key="item.key" class="stats-item" :class="`stats-item--${item.theme}`">
          <div class="stats-item__icon">
            <Icon :icon="item.icon" :size="26" />
          </div>
          <div class="stats-item__content">
            <div class="stats-item__value">{{ stats[item.key] }}</div>
            <div class="stats-item__label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </a-card>

    <BasicTable :rowSelection="rowSelection" @register="registerTable">
      <template #tableTitle>
        <a-button
          v-if="canShowHandleButton"
          preIcon="ant-design:edit-outlined"
          type="primary"
          :disabled="!canHandleSelected"
          @click="handleSelectedEdit"
        >
          处理事件
        </a-button>
        <a-button
          v-if="canShowEliminateButton"
          preIcon="ant-design:close-circle-outlined"
          type="primary"
          :disabled="!canEliminateSelected"
          @click="handleSelectedEliminate"
        >
          消除
        </a-button>
        <a-button
          v-if="hasPermission('operation:operation_anomaly_record:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('告警记录', getExportUrl, exportParams)"
        >
          导出
        </a-button>
      </template>
    </BasicTable>

    <DemoModal @register="registerModal" @success="handleModalSuccess" :isDisabled="isDisabled" />
    <DemoModal1 @register="registerModal1" @success="handleModalSuccess" :isDisabled="isDisabled" />
  </div>
</template>

<script setup lang="ts" name="gaojingjilu">
  import { computed, reactive, ref } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { filterObj } from '/@/utils/common/compUtils';
  import DemoModal from './DemoModal.vue';
  import DemoModal1 from './DemoModal1.vue';
  import { getDemoList, getExportUrl, getNumStats } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const { hasPermission } = usePermission();
  const { createMessage } = useMessage();
  const { handleExportXls } = useMethods();
  const [registerModal, { openModal }] = useModal();
  const [registerModal1, { openModal: openModal1 }] = useModal();
  const isDisabled = ref(false);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRows = ref<Record<string, any>[]>([]);
  const stats = reactive({
    general: 0,
    low: 0,
    total: 0,
    urgent: 0,
    veryUrgent: 0,
  });
  const statCards = [
    { key: 'total', label: '告警总数', icon: 'ant-design:bell-filled', theme: 'total' },
    { key: 'veryUrgent', label: '非常紧急事件', icon: 'ant-design:alert-filled', theme: 'critical' },
    { key: 'urgent', label: '紧急事件', icon: 'ant-design:warning-filled', theme: 'urgent' },
    { key: 'general', label: '一般事件', icon: 'ant-design:notification-filled', theme: 'general' },
    { key: 'low', label: '较低事件', icon: 'ant-design:info-circle-filled', theme: 'low' },
  ] as const;

  const [registerTable, { reload, getDataSource, getForm }] = useTable({
    title: '告警记录',
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
      title: '序号',
      width: 60,
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: true,
    rowKey: 'id',
  });

  const canShowHandleButton = computed(() => hasPermission('operation:operation_anomaly_record:handle'));
  const canShowEliminateButton = computed(() => hasPermission('operation:operation_anomaly_record:eliminate'));

  const rowSelection = computed(() => ({
    type: 'checkbox',
    columnWidth: 40,
    fixed: 'left',
    selectedRowKeys: checkedKeys.value,
    onChange: onSelectChange,
  }));

  const selectedRecord = computed(() => {
    if (checkedKeys.value.length !== 1) {
      return null;
    }
    if (selectedRows.value.length === 1) {
      return selectedRows.value[0];
    }
    const selectedKey = checkedKeys.value[0];
    return getDataSource<Record<string, any>>().find((item) => item?.id === selectedKey) ?? null;
  });

  const canHandleSelected = computed(() => String(selectedRecord.value?.status ?? '') === '0');
  const canEliminateSelected = computed(() => !!selectedRecord.value && String(selectedRecord.value?.status ?? '') !== '2');
  const exportParams = computed(() => {
    const paramsForm: Record<string, unknown> = {
      ...(getForm()?.getFieldsValue?.() || {}),
    };
    if (checkedKeys.value.length > 0) {
      paramsForm.selections = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });

  function onSelectChange(selectedRowKeys: (string | number)[], rows: Record<string, any>[] = []) {
    checkedKeys.value = selectedRowKeys;
    selectedRows.value = rows;
  }

  function getSingleSelectedRecord(actionLabel: string) {
    if (checkedKeys.value.length === 0) {
      createMessage.warning(`请先勾选一条告警记录后再${actionLabel}`);
      return null;
    }
    if (checkedKeys.value.length > 1 || selectedRows.value.length > 1) {
      createMessage.warning(`${actionLabel}时只能选择一条告警记录`);
      return null;
    }
    return selectedRecord.value;
  }

  function handleSelectedEdit() {
    const record = getSingleSelectedRecord('处理事件');
    if (!record) {
      return;
    }
    if (String(record.status) !== '0') {
      createMessage.warning('当前告警状态不支持处理事件');
      return;
    }
    handleEdit(record);
  }

  function handleSelectedEliminate() {
    const record = getSingleSelectedRecord('消除');
    if (!record) {
      return;
    }
    if (String(record.status) === '2') {
      createMessage.warning('当前告警已消除，不能重复消除');
      return;
    }
    handleDel(record);
  }

  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  function handleDel(record) {
    isDisabled.value = false;
    openModal1(true, {
      record,
      isUpdate: true,
    });
  }

  async function init() {
    const obj = await getNumStats();
    Object.assign(stats, obj);
  }

  async function handleModalSuccess() {
    checkedKeys.value = [];
    selectedRows.value = [];
    await reload();
    await init();
  }

  init();
</script>

<style scoped lang="less">
  .stats-card {
    margin: 10px 10px 0;
  }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
  }

  .stats-item {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 94px;
    padding: 18px 20px;
    border: 1px solid #edf2f8;
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  }

  .stats-item__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    flex-shrink: 0;
  }

  .stats-item__content {
    min-width: 0;
  }

  .stats-item__value {
    color: #1f2937;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.1;
  }

  .stats-item__label {
    margin-top: 6px;
    color: #667085;
    font-size: 14px;
    line-height: 20px;
  }

  .stats-item--total .stats-item__icon {
    color: #2563eb;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(59, 130, 246, 0.08) 100%);
  }

  .stats-item--critical .stats-item__icon {
    color: #dc2626;
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.16) 0%, rgba(248, 113, 113, 0.08) 100%);
  }

  .stats-item--urgent .stats-item__icon {
    color: #ea580c;
    background: linear-gradient(135deg, rgba(234, 88, 12, 0.16) 0%, rgba(251, 146, 60, 0.08) 100%);
  }

  .stats-item--general .stats-item__icon {
    color: #16a34a;
    background: linear-gradient(135deg, rgba(22, 163, 74, 0.16) 0%, rgba(74, 222, 128, 0.08) 100%);
  }

  .stats-item--low .stats-item__icon {
    color: #7c3aed;
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.16) 0%, rgba(167, 139, 250, 0.08) 100%);
  }

  @media (max-width: 1600px) {
    .stats-overview {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 1100px) {
    .stats-overview {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
