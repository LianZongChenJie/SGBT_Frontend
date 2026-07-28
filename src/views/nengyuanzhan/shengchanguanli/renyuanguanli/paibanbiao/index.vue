<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">换班</a-button>
        <div class="mt1 ml3">
          班次说明:
          <span v-for="(list, i) in banciArr" :key="i" class="mr3 banciBox">{{ list.planName }}: {{ list.planStart }} - {{ list.planEnd }}</span>
        </div>
      </template>
    </BasicTable>

    <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
  </div>
</template>

<script lang="ts" setup name="paibanbiao">
  import { onMounted, ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import { getDemoList1 } from './demo.api';
  import { searchFormSchema } from './demo.data';
  import { queryTreeList } from '@/api/common/api';
  import { getDemoList as getPlanItemList } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banciguanli/demo.api';

  const [registerModal, { openModal }] = useModal();
  const banciArr = ref<any[]>([]);
  const isDisabled = ref(false);

  function getPlanDateSortValue(planDate: unknown) {
    const normalizedDate = String(planDate || '');
    const dateSegments = normalizedDate.split('-');
    const daySegment = dateSegments[dateSegments.length - 1];
    const dayNumber = Number(daySegment);

    if (!Number.isNaN(dayNumber)) {
      return dayNumber;
    }

    const fallbackNumber = Number(normalizedDate);
    return Number.isNaN(fallbackNumber) ? Number.MAX_SAFE_INTEGER : fallbackNumber;
  }

  function isValidPlanDate(planDate: unknown) {
    return planDate !== null && planDate !== undefined && String(planDate).trim() !== '';
  }

  const [registerTable, { reload, getForm, setColumns }] = useTable({
    title: '排班表',
    api: getDemoList1,
    columns: [],
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
    canResize: true,
    rowKey: 'employeeId',
    pagination: false,
    beforeFetch: async (params) => {
      const banci = await getPlanItemList({ pageNo: 1, pageSize: 200, sysOrgCode: params.sysOrgCode });
      banciArr.value = Array.isArray(banci?.records) ? banci.records : [];
      return params;
    },
    afterFetch: (records) => {
      const normalizedRecords = Array.isArray(records) ? records : [];

      normalizedRecords.forEach((item) => {
        if (isValidPlanDate(item.planDate)) {
          item[`day_${item.planDate}`] = item.planName || '';
        }
      });

      const columnMap = new Map();
      normalizedRecords.forEach((item) => {
        if (isValidPlanDate(item.planDate) && !columnMap.has(item.planDate)) {
          columnMap.set(item.planDate, {
            title: `${item.week}\n${item.planDate}`,
            customHeaderCell: () => ({
              style: { whiteSpace: 'pre-line', textAlign: 'center', lineHeight: '20px' },
            }),
            dataIndex: `day_${item.planDate}`,
            width: 120,
            resizable: true,
          });
        }
      });

      const dayColumns = Array.from(columnMap.entries())
        .sort(([dateA], [dateB]) => getPlanDateSortValue(dateA) - getPlanDateSortValue(dateB))
        .map(([, column]) => column);

      dayColumns.unshift({
        title: '姓名',
        dataIndex: 'employeeName',
        width: 100,
        resizable: true,
        fixed: 'left',
      });

      setColumns(dayColumns);

      const employeeMap: Record<string, Record<string, any>> = {};
      normalizedRecords.forEach((item) => {
        const employeeKey = String(item.employeeId);
        if (!employeeMap[employeeKey]) {
          employeeMap[employeeKey] = {
            employeeId: item.employeeId,
            employeeName: item.employeeName,
          };
        }

        Object.keys(item).forEach((key) => {
          if (key.startsWith('day_')) {
            const currentValue = employeeMap[employeeKey][key];
            const nextValue = item[key];
            if (!currentValue) {
              employeeMap[employeeKey][key] = nextValue;
            } else if (currentValue !== nextValue && !String(currentValue).split('\n').includes(String(nextValue))) {
              employeeMap[employeeKey][key] = `${currentValue}\n${nextValue}`;
            }
          }
        });
      });

      return Object.values(employeeMap);
    },
  });

  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
    });
  }

  async function init() {
    const dept = await queryTreeList();
    const defaultDept = Array.isArray(dept) ? dept[0] : undefined;
    if (!defaultDept?.orgCode) {
      return;
    }

    const form = getForm();
    form.setFieldsValue({
      sysOrgCode: defaultDept.orgCode,
    });
    await reload();
  }

  onMounted(() => {
    init();
  });
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

  .banciBox {
    padding: 4px 6px;
    border: 1px solid #1890ff;
    border-radius: 4px;
  }
</style>
