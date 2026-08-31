<template>
  <div class="app-container">
    <a-card :bodyStyle="{ padding: 0 }" class="mt3 mb3 ml3 mr3">
      <BasicForm style="margin-top: 20px" @register="registerForm" @submit="handleSubmit"></BasicForm>
      <a-space class="mb3 ml3">
        <a-button
          v-if="hasPermission('operation:operation_plan_duty_leader:add')"
          preIcon="ant-design:setting-outlined"
          type="primary"
          @click="handleAdd"
        >
          设置值班领导
        </a-button>
        <a-button
          v-if="hasPermission('operation:operation_plan_duty_leader:edit')"
          preIcon="ant-design:swap-outlined"
          type="primary"
          @click="handleChangeLeader"
        >
          换班
        </a-button>
      </a-space>
    </a-card>

    <a-spin :spinning="loading">
      <a-calendar v-model:value="calendarMonth" :header-render="() => null" class="ml3 mr3" @select="onSelect">
        <template #dateCellRender="{ current }">
          <ul class="events">
            <li v-for="item in getListData(current)" :key="getCalendarItemKey(item)">
              <span class="event-role">值班领导:</span>
              <span>{{ getLeaderName(item) }}</span>
              <span v-if="item.planName" class="event-plan">({{ item.planName }})</span>
              <span v-if="item.period" class="event-period">{{ item.period }}</span>
            </li>
          </ul>
        </template>
      </a-calendar>
    </a-spin>

    <DemoModal @success="success" :isDisabled="isDisabled" @register="registerModal" />
    <DemoModalHuanban @success="success" :isDisabled="isDisabled" @register="registerModalHuanban" />

    <BasicDrawer title="排班详情" v-bind="$attrs" width="50%" @register="registerDrawer">
      <BasicTable @register="registerTable">
        <template #employeeName="{ text, record }">
          <span :style="{ color: String(record.calendarType) === '2' ? '#1677ff' : '' }">
            {{ text }}
          </span>
        </template>
      </BasicTable>
    </BasicDrawer>
  </div>
</template>

<script lang="ts" name="paibanrili" setup>
  import dayjs, { Dayjs } from 'dayjs';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicDrawer, useDrawer } from '/@/components/Drawer';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { BasicColumn, BasicTable, useTable } from '/@/components/Table';
  import { nextTick, onMounted, ref } from 'vue';
  import DemoModal from './DemoModal.vue';
  import DemoModalHuanban from './DemoModalHuanban.vue';
  import { useModal } from '@/components/Modal';
  import { getDemoList, getPlanLeaders } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  import { getDemoList as getPlanItemList } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banciguanli/demo.api';
  import { queryTreeList } from '@/api/common/api';

  const { hasPermission } = usePermission();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerModal, { openModal }] = useModal();
  const [registerModalHuanban, { openModal: openModalHuanban }] = useModal();

  const loading = ref(false);
  const isDisabled = ref(false);
  const fullDate = ref('');
  const calendarMonth = ref<Dayjs>();
  const calendarDataMap = ref<Record<string, any[]>>({});
  const currentQuery = ref<{
    sysOrgCode?: string;
    planGroupId?: string | number;
  }>({});

  const drawerColumns: BasicColumn[] = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      width: 170,
      resizable: true,
      slots: { customRender: 'employeeName' },
    },
    ...columns.filter((column) => column.dataIndex !== 'employeeName'),
  ];

  const [registerTable, { reload }] = useTable({
    title: '',
    api: getDemoList,
    columns: drawerColumns,
    immediate: false,
    useSearchForm: false,
    striped: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    rowKey: 'id',
    beforeFetch(params) {
      return {
        ...params,
        ...currentQuery.value,
        day: fullDate.value,
      };
    },
  });

  const [registerForm, formAction] = useForm({
    schemas: searchFormSchema,
    showAdvancedButton: true,
    autoAdvancedCol: 3,
    alwaysShowLines: 2,
    baseColProps: { span: 6 },
  });

  async function handleSubmit(values: Record<string, any>) {
    loading.value = true;
    calendarMonth.value = values.month ? dayjs(values.month, 'YYYY-MM') : dayjs();

    try {
      const sysOrgCode = normalizeOrgCode(values.orgCode);
      currentQuery.value = {
        sysOrgCode,
        planGroupId: values.planGroupId,
      };

      if (!sysOrgCode) {
        calendarDataMap.value = {};
        return;
      }

      const queryParams = {
        month: values.month,
        ...currentQuery.value,
      };

      const [leaderRes, shiftRes] = await Promise.all([
        getPlanLeaders(queryParams),
        getPlanItemList({
          pageNo: 1,
          pageSize: 1000,
          sysOrgCode,
        }),
      ]);

      const map: Record<string, any[]> = {};
      const shiftLookup = buildShiftLookup(getResponseRecords(shiftRes));

      getResponseRecords(leaderRes).forEach((item) => {
        const dateKey = normalizePlanDate(item.planDate, values.month);
        if (!dateKey) {
          return;
        }

        appendCalendarItem(map, dateKey, {
          ...item,
          planDate: dateKey,
          calendarType: 2,
          planName: item.planName || getShiftName(item, shiftLookup),
          period: item.period || getShiftPeriod(item, shiftLookup),
        });
      });

      calendarDataMap.value = map;
    } finally {
      loading.value = false;
    }
  }

  function getListData(value: Dayjs) {
    return calendarDataMap.value[value.format('YYYY-MM-DD')] || [];
  }

  function getCalendarItemKey(item: Record<string, any>) {
    return item.id || `${item.planDate || ''}-${item.employeeId || item.employeeName || ''}-${item.planName || ''}-${item.calendarType || ''}`;
  }

  function getLeaderName(item: Record<string, any>) {
    return item.employeeName || item.leaderName || item.name || '--';
  }

  function normalizeOrgCode(value: unknown) {
    if (Array.isArray(value)) {
      return value[0] ? String(value[0]) : '';
    }
    return value ? String(value) : '';
  }

  function getResponseRecords(res: any): any[] {
    if (Array.isArray(res)) {
      return res;
    }

    if (Array.isArray(res?.records)) {
      return res.records;
    }

    if (Array.isArray(res?.list)) {
      return res.list;
    }

    return [];
  }

  function normalizePlanDate(planDate: unknown, month: string) {
    const value = String(planDate || '').trim();
    if (!value) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const day = value.split('-').pop() || value;
    const dayNumber = Number(day);
    if (Number.isNaN(dayNumber)) {
      return '';
    }

    return `${month}-${String(dayNumber).padStart(2, '0')}`;
  }

  function appendCalendarItem(map: Record<string, any[]>, dateKey: string, item: Record<string, any>) {
    if (!map[dateKey]) {
      map[dateKey] = [];
    }

    map[dateKey].push(item);
  }

  function buildShiftLookup(records: any[]) {
    const periodMap = new Map<string, string>();
    const nameMap = new Map<string, string>();

    records.forEach((item) => {
      const keys = [item?.id, item?.itemId, item?.planCode, item?.itemCode, item?.planName, item?.itemName]
        .map((value) => String(value || '').trim())
        .filter(Boolean);

      if (!keys.length) {
        return;
      }

      const planName = String(item.planName || item.itemName || item.label || item.itemCode || '').trim();
      const period = formatShiftPeriod(item.planStart, item.planEnd, item.planNextDay);

      keys.forEach((key) => {
        if (period) {
          periodMap.set(key, period);
        }
        if (planName) {
          nameMap.set(key, planName);
        }
      });
    });

    return {
      periodMap,
      nameMap,
    };
  }

  function getShiftLookupKeys(item: Record<string, any>) {
    return [
      item.id,
      item.value,
      item.itemId,
      item.planId,
      item.planItemId,
      item.planCode,
      item.itemCode,
      item.planName,
      item.itemName,
      item.planItemName,
      item.label,
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean);
  }

  function getShiftPeriod(item: Record<string, any>, shiftLookup: { periodMap: Map<string, string> }) {
    if (item.planStart || item.planEnd) {
      return formatShiftPeriod(item.planStart, item.planEnd, item.planNextDay);
    }

    const matchedKey = getShiftLookupKeys(item).find((key) => shiftLookup.periodMap.has(key));
    return matchedKey ? shiftLookup.periodMap.get(matchedKey) || '' : '';
  }

  function getShiftName(item: Record<string, any>, shiftLookup: { nameMap: Map<string, string> }) {
    if (item.planName) {
      return item.planName;
    }

    if (item.itemName || item.planItemName) {
      return item.itemName || item.planItemName;
    }

    const matchedKey = getShiftLookupKeys(item).find((key) => shiftLookup.nameMap.has(key));
    return matchedKey ? shiftLookup.nameMap.get(matchedKey) || '' : '';
  }

  function formatShiftPeriod(start: unknown, end: unknown, nextDay?: unknown) {
    const normalizedStart = String(start || '').trim();
    const normalizedEnd = String(end || '').trim();
    if (!normalizedStart && !normalizedEnd) {
      return '';
    }

    const suffix = Number(nextDay) === 1 ? ' 次日' : '';
    return `${[normalizedStart, normalizedEnd].filter(Boolean).join(' - ')}${suffix}`;
  }

  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
    });
  }

  function handleChangeLeader() {
    isDisabled.value = false;
    openModalHuanban(true, {
      isUpdate: false,
    });
  }

  async function onSelect(date, { source }) {
    if (source !== 'date') {
      return;
    }

    fullDate.value = date.format('YYYY-MM-DD');
    isDisabled.value = true;
    openDrawer(true, {
      isUpdate: true,
      record: {
        day: fullDate.value,
      },
    });
    await nextTick();
    await reload();
  }

  async function success() {
    const values = await formAction.getFieldsValue();
    if (!values.month) {
      values.month = dayjs().format('YYYY-MM');
      await formAction.setFieldsValue({
        month: values.month,
      });
    }
    await handleSubmit(values);
  }

  onMounted(async () => {
    await nextTick();
    const values = await formAction.getFieldsValue();
    if (!values.orgCode) {
      const dept = await queryTreeList();
      const defaultDept = Array.isArray(dept) ? dept[0] : undefined;
      if (defaultDept?.orgCode) {
        values.orgCode = defaultDept.orgCode;
      }
    }
    if (!values.month) {
      values.month = dayjs().format('YYYY-MM');
    }
    await formAction.setFieldsValue({
      month: values.month,
      orgCode: values.orgCode,
    });
    await handleSubmit(values);
  });
</script>

<style lang="less" scoped>
  .events {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 12px;
    line-height: 18px;
  }

  .events li {
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
  }

  .event-role {
    font-weight: 600;
  }

  .event-plan,
  .event-period {
    margin-left: 4px;
    color: #8c8c8c;
  }

  .app-container {
    :deep(.ant-picker-calendar .ant-picker-content thead th) {
      height: 52px;
      line-height: 52px;
      font-size: 14px;
    }

    :deep(.ant-picker-calendar .ant-picker-content thead th:nth-child(-n + 5)) {
      color: #262626;
      font-weight: 600;
    }

    :deep(.ant-picker-calendar .ant-picker-content thead th:nth-child(6)),
    :deep(.ant-picker-calendar .ant-picker-content thead th:nth-child(7)) {
      color: #bfbfbf;
      font-weight: 400;
    }
  }
</style>
