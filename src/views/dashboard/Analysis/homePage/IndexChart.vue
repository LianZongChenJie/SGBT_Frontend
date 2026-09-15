<template>
  <div class="analysis-page p-4">
    <a-row :gutter="[20, 20]" class="overview-row">
      <a-col class="overview-col" :xl="18" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card class="dashboard-card overview-card" :loading="loading" :bordered="false" title="设备状态" :bodyStyle="cardBodyStyle">
          <a-row :gutter="[24, 24]" align="middle">
            <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
              <div class="chart-panel">
                <Pie height="280px" :chartData="deviceData" :num="deviceTotal"></Pie>
              </div>
            </a-col>
            <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
              <div class="table-panel">
                <a-table class="status-table" :columns="deviceColumns" :data-source="deviceRows" size="small" :pagination="false" :locale="tableEmptyLocale">
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                      <div class="status-cell">
                        <span class="status-dot" :style="{ backgroundColor: getStatusColor(deviceStatusColors, record.status) }"></span>
                        <span>{{ record.status }}</span>
                      </div>
                    </template>
                  </template>
                </a-table>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col class="overview-col" :xl="6" :lg="24" :md="24" :sm="24" :xs="24">
        <QuickNav class="dashboard-card quick-nav-card overview-card" />
      </a-col>
    </a-row>

    <a-row :gutter="[20, 20]" class="mt3">
      <a-col :span="24">
        <a-card class="dashboard-card" :loading="loading" :bordered="false" title="今日报修" :bodyStyle="cardBodyStyle">
          <a-row :gutter="[24, 24]" align="middle">
            <a-col :xl="8" :lg="10" :md="24" :sm="24" :xs="24">
              <div class="chart-panel chart-panel--accent">
                <Pie height="280px" :chartData="baoxiuData" :option="repairChartOption"></Pie>
              </div>
            </a-col>
            <a-col :xl="16" :lg="14" :md="24" :sm="24" :xs="24">
              <a-row class="metric-grid metric-grid--repair" :gutter="[16, 16]">
                <a-col v-for="item in repairMetricCards" :key="item.title" :xl="8" :lg="12" :md="12" :sm="12" :xs="24">
                  <a-card class="metric-card" :bordered="false" :bodyStyle="metricCardBodyStyle">
                    <div class="metric-card__content" :style="getMetricStyle(item)">
                      <div class="metric-card__icon">
                        <Icon :icon="item.icon" :size="26" :color="item.color" />
                      </div>
                      <div class="metric-card__meta">
                        <div class="metric-card__value">{{ item.value }}</div>
                        <div class="metric-card__label">{{ item.title }}</div>
                      </div>
                    </div>
                  </a-card>
                </a-col>
                <a-col v-if="repairStatusCards.length === 0" :xl="8" :lg="12" :md="12" :sm="12" :xs="24">
                  <div class="empty-panel empty-panel--metric">
                    <Icon icon="ant-design:inbox-outlined" :size="30" color="#cbd5e1" />
                    <div class="empty-panel__text">暂无数据</div>
                  </div>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[20, 20]" class="mt3">
      <a-col :span="24">
        <a-card class="dashboard-card" :loading="loading" :bordered="false" title="保养任务" :bodyStyle="cardBodyStyle">
          <template #extra>
            <div class="period-tabs">
              <span
                v-for="period in sectionPeriods"
                :key="period"
                class="period-chip"
                :class="{ 'period-chip--active': period === activeMaintenancePeriod }"
                @click="activeMaintenancePeriod = period"
              >
                {{ period }}
              </span>
            </div>
          </template>
          <a-row :gutter="[24, 24]" align="middle">
            <a-col :xl="6" :lg="8" :md="24" :sm="24" :xs="24">
              <div class="chart-panel">
                <Pie height="280px" :chartData="maintenanceTaskData" :option="maintenanceChartOption"></Pie>
              </div>
            </a-col>
            <a-col :xl="6" :lg="8" :md="24" :sm="24" :xs="24">
              <div class="progress-panel" :style="getProgressStyle(maintenanceProgress)">
                <a-progress
                  type="circle"
                  :percent="maintenanceProgress.percent"
                  :size="200"
                  :stroke-width="12"
                  :strokeColor="maintenanceProgress.color"
                >
                  <template #format="percent">
                    <span class="progress-panel__value">{{ percent }}%</span>
                    <div class="progress-panel__label mt2">{{ maintenanceProgress.label }}</div>
                  </template>
                </a-progress>
                <div class="progress-panel__total">{{ maintenanceProgress.total }}</div>
              </div>
            </a-col>
            <a-col :xl="12" :lg="8" :md="24" :sm="24" :xs="24">
              <a-row class="metric-grid metric-grid--task" :gutter="[16, 16]">
                <a-col v-for="item in maintenanceMetricCards" :key="item.title" :xl="8" :lg="24" :md="12" :sm="12" :xs="24">
                  <a-card class="metric-card metric-card--wide" :bordered="false" :bodyStyle="metricCardBodyStyle">
                    <div class="metric-card__content" :style="getMetricStyle(item)">
                      <div class="metric-card__icon">
                        <Icon :icon="item.icon" :size="28" :color="item.color" />
                      </div>
                      <div class="metric-card__meta">
                        <div class="metric-card__label">{{ item.title }}</div>
                        <div class="metric-card__value metric-card__value--secondary">{{ item.value }}</div>
                      </div>
                    </div>
                  </a-card>
                </a-col>
                <a-col v-if="maintenanceMetricCards.length === 0" :span="24">
                  <div class="empty-panel">
                    <Icon icon="ant-design:inbox-outlined" :size="42" color="#cbd5e1" />
                    <div class="empty-panel__text">暂无数据</div>
                  </div>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[20, 20]" class="mt3">
      <a-col :span="24">
        <a-card class="dashboard-card" :loading="loading" :bordered="false" title="巡检任务" :bodyStyle="cardBodyStyle">
          <template #extra>
            <div class="period-tabs">
              <span
                v-for="period in sectionPeriods"
                :key="period"
                class="period-chip"
                :class="{ 'period-chip--active': period === activePatrolPeriod }"
                @click="activePatrolPeriod = period"
              >
                {{ period }}
              </span>
            </div>
          </template>
          <a-row :gutter="[24, 24]" align="middle">
            <a-col :xl="6" :lg="8" :md="24" :sm="24" :xs="24">
              <div class="chart-panel">
                <Pie height="280px" :chartData="patrolTaskData" :option="patrolChartOption"></Pie>
              </div>
            </a-col>
            <a-col :xl="6" :lg="8" :md="24" :sm="24" :xs="24">
              <div class="progress-panel" :style="getProgressStyle(patrolProgress)">
                <a-progress type="circle" :percent="patrolProgress.percent" :size="200" :stroke-width="12" :strokeColor="patrolProgress.color">
                  <template #format="percent">
                    <span class="progress-panel__value">{{ percent }}%</span>
                    <div class="progress-panel__label mt2">{{ patrolProgress.label }}</div>
                  </template>
                </a-progress>
                <div class="progress-panel__total">{{ patrolProgress.total }}</div>
              </div>
            </a-col>
            <a-col :xl="12" :lg="8" :md="24" :sm="24" :xs="24">
              <div class="table-panel">
                <a-table class="status-table" :columns="taskColumns" :data-source="patrolTaskRows" size="small" :pagination="false" :locale="tableEmptyLocale">
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                      <div class="status-cell">
                        <span class="status-dot" :style="{ backgroundColor: getStatusColor(taskStatusColors, record.status) }"></span>
                        <span>{{ record.status }}</span>
                      </div>
                    </template>
                  </template>
                </a-table>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import Pie from '@/components/chart/PieHuanquan.vue';
  import { Icon } from '/@/components/Icon';
  import QuickNav from '../components/QuickNav.vue';
  import {
    getWorkbenchDeviceStatus,
    getWorkbenchInspectionTask,
    getWorkbenchMaintenanceTask,
    getWorkbenchTodayRepair,
    type WorkbenchPeriod,
    type WorkbenchRepairResult,
    type WorkbenchStatusItem,
    type WorkbenchTaskResult,
  } from '/@/views/dashboard/workbench/workbench.api';

  interface MetricCardItem {
    title: string;
    value: number;
    icon: string;
    color: string;
    softColor: string;
  }

  interface TableRowItem {
    key: string;
    status: string;
    num: number;
    zb: string;
  }

  interface ProgressPanelItem {
    percent: number;
    label: string;
    total: string;
    color: string;
    softColor: string;
  }

  interface PieChartItem {
    name: string;
    value: number;
  }

  interface TaskViewData {
    chartData: PieChartItem[];
    rows: TableRowItem[];
    metricCards: MetricCardItem[];
    progress: ProgressPanelItem;
    taskTotal: number;
    deviceTotal: number;
  }

  type SectionPeriod = '今天' | '本周' | '本月';

  const periodValueMap: Record<SectionPeriod, WorkbenchPeriod> = {
    今天: 'today',
    本周: 'week',
    本月: 'month',
  };

  const loadingCount = ref(0);
  const loading = computed(() => loadingCount.value > 0);

  const sectionPeriods: SectionPeriod[] = ['今天', '本周', '本月'];
  const activeMaintenancePeriod = ref<SectionPeriod>('今天');
  const activePatrolPeriod = ref<SectionPeriod>('今天');

  const cardBodyStyle = { padding: '22px 24px' };
  const metricCardBodyStyle = { padding: '18px 20px' };
  const tableEmptyLocale = { emptyText: '暂无数据' };

  const deviceStatusColors: Record<string, string> = {
    报废: '#ff7670',
    停投: '#ffd16e',
    故障: '#4fcce4',
    正常运行: '#87d590',
    维修中: '#5685cf',
  };

  const taskStatusColors: Record<string, string> = {
    待执行: '#5685cf',
    执行中: '#87d590',
    逾期: '#ffd16e',
    未执行: '#ff7670',
    已完成: '#4fcce4',
  };

  const metricPalette = [
    { icon: 'ant-design:file-text-outlined', color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
    { icon: 'ant-design:inbox-outlined', color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
    { icon: 'ant-design:clock-circle-outlined', color: '#3b82f6', softColor: 'rgba(59, 130, 246, 0.14)' },
    { icon: 'ant-design:tool-outlined', color: '#14b8a6', softColor: 'rgba(20, 184, 166, 0.14)' },
    { icon: 'ant-design:safety-certificate-outlined', color: '#8b5cf6', softColor: 'rgba(139, 92, 246, 0.14)' },
    { icon: 'ant-design:check-circle-outlined', color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
  ];

  const emptyProgress: ProgressPanelItem = {
    percent: 0,
    label: '任务完成率',
    total: '任务总数: 0',
    color: '#36cfc9',
    softColor: 'rgba(54, 207, 201, 0.16)',
  };

  const deviceData = ref<PieChartItem[]>([]);
  const deviceRows = ref<TableRowItem[]>([]);
  const deviceTotal = ref(0);

  const baoxiuData = ref<PieChartItem[]>([]);
  const repairStatusCards = ref<MetricCardItem[]>([]);
  const repairOrderTotal = ref(0);
  const repairTodayNewCount = ref(0);

  const maintenanceData = ref<TaskViewData>(createEmptyTaskViewData());
  const patrolData = ref<TaskViewData>(createEmptyTaskViewData());

  const deviceColumns = [
    { title: '设备状态', dataIndex: 'status', key: 'status' },
    { title: '设备数量', dataIndex: 'num', key: 'num' },
    { title: '占比', dataIndex: 'zb', key: 'zb' },
  ];

  const taskColumns = [
    { title: '任务状态', dataIndex: 'status', key: 'status' },
    { title: '任务数量', dataIndex: 'num', key: 'num' },
    { title: '占比', dataIndex: 'zb', key: 'zb' },
  ];

  const repairMetricCards = computed<MetricCardItem[]>(() => [
    {
      title: '工单总数',
      value: repairOrderTotal.value,
      icon: 'ant-design:file-text-outlined',
      color: '#f59e0b',
      softColor: 'rgba(245, 158, 11, 0.14)',
    },
    {
      title: '今日新增',
      value: repairTodayNewCount.value,
      icon: 'ant-design:plus-circle-outlined',
      color: '#3b82f6',
      softColor: 'rgba(59, 130, 246, 0.14)',
    },
    ...repairStatusCards.value,
  ]);

  const maintenanceTaskData = computed(() => clonePieData(maintenanceData.value.chartData));
  const maintenanceMetricCards = computed(() => cloneMetricCards(maintenanceData.value.metricCards));
  const maintenanceProgress = computed(() => ({ ...maintenanceData.value.progress }));
  const patrolTaskData = computed(() => clonePieData(patrolData.value.chartData));
  const patrolTaskRows = computed(() => cloneTableRows(patrolData.value.rows));
  const patrolProgress = computed(() => ({ ...patrolData.value.progress }));

  const repairChartOption = computed(() =>
    createDonutChartOption({
      totalText: `${repairOrderTotal.value}`,
      titleText: `今日新增 ${repairTodayNewCount.value}`,
      top: '34%',
      valueFontSize: 28,
      colors: ['#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#8b5cf6', '#22c55e'],
      formatter: '{b}: {c}',
      legend: {
        orient: 'vertical',
        right: 10,
        top: 60,
      },
    })
  );

  const maintenanceChartOption = computed(() =>
    createDonutChartOption({
      totalText: `${maintenanceData.value.taskTotal}`,
      titleText: '任务总量',
      top: '39%',
      valueFontSize: 26,
      colors: ['#5685cf', '#87d590', '#4fcce4', '#ffd16e', '#ff7670'],
      formatter: '{d}%',
    })
  );

  const patrolChartOption = computed(() =>
    createDonutChartOption({
      totalText: `${patrolData.value.deviceTotal}`,
      titleText: '设备总数',
      top: '35%',
      valueFontSize: 28,
      colors: ['#4fcce4', '#ff7670', '#87d590', '#5685cf', '#ffd16e'],
      formatter: '{b}: {c}',
    })
  );

  onMounted(() => {
    loadOverviewData();
    loadMaintenanceTask(activeMaintenancePeriod.value);
    loadPatrolTask(activePatrolPeriod.value);
  });

  watch(activeMaintenancePeriod, (period) => {
    loadMaintenanceTask(period);
  });

  watch(activePatrolPeriod, (period) => {
    loadPatrolTask(period);
  });

  async function loadOverviewData() {
    withLoading(async () => {
      try {
        const [deviceResult, repairResult] = await Promise.all([getWorkbenchDeviceStatus(), getWorkbenchTodayRepair()]);
        applyDeviceStatus(deviceResult);
        applyRepairStatus(repairResult);
      } catch (error) {
        applyDeviceStatus();
        applyRepairStatus();
      }
    });
  }

  async function loadMaintenanceTask(period: SectionPeriod) {
    withLoading(async () => {
      try {
        const data = await getWorkbenchMaintenanceTask(periodValueMap[period]);
        maintenanceData.value = createTaskViewData(data, 'maintenance');
      } catch (error) {
        maintenanceData.value = createEmptyTaskViewData();
      }
    });
  }

  async function loadPatrolTask(period: SectionPeriod) {
    withLoading(async () => {
      try {
        const data = await getWorkbenchInspectionTask(periodValueMap[period]);
        patrolData.value = createTaskViewData(data, 'inspection');
      } catch (error) {
        patrolData.value = createEmptyTaskViewData();
      }
    });
  }

  async function withLoading(task: () => Promise<void>) {
    loadingCount.value += 1;
    try {
      await task();
    } finally {
      loadingCount.value = Math.max(loadingCount.value - 1, 0);
    }
  }

  function applyDeviceStatus(data?: { statuses?: WorkbenchStatusItem[]; total?: number }) {
    const statuses = toStatusList(data?.statuses);
    deviceData.value = statusesToPieData(statuses);
    deviceRows.value = statusesToRows(statuses, 'device');
    deviceTotal.value = toNumber(data?.total);
  }

  function applyRepairStatus(data?: WorkbenchRepairResult) {
    const statuses = toStatusList(data?.statuses);
    baoxiuData.value = statusesToPieData(statuses);
    repairStatusCards.value = statusesToMetricCards(statuses);
    repairOrderTotal.value = toNumber(data?.orderTotal);
    repairTodayNewCount.value = toNumber(data?.todayNewCount);
  }

  function createTaskViewData(data: WorkbenchTaskResult | undefined, type: 'maintenance' | 'inspection'): TaskViewData {
    const taskStatuses = toStatusList(data?.taskStatuses);
    const deviceStatuses = toStatusList(data?.deviceStatuses);
    const chartStatuses = type === 'inspection' && deviceStatuses.length > 0 ? deviceStatuses : taskStatuses;
    const taskTotal = toNumber(data?.taskTotal);
    const deviceTotal = toNumber(data?.deviceTotal);
    const progressColor = type === 'maintenance' ? '#36cfc9' : '#6c8cff';
    const progressSoftColor = type === 'maintenance' ? 'rgba(54, 207, 201, 0.16)' : 'rgba(108, 140, 255, 0.16)';

    return {
      chartData: statusesToPieData(chartStatuses),
      rows: statusesToRows(taskStatuses, type),
      metricCards: statusesToMetricCards(taskStatuses),
      progress: {
        percent: toPercentNumber(data?.completionRate),
        label: '任务完成率',
        total: `任务总数: ${taskTotal}`,
        color: progressColor,
        softColor: progressSoftColor,
      },
      taskTotal,
      deviceTotal,
    };
  }

  function createEmptyTaskViewData(): TaskViewData {
    return {
      chartData: [],
      rows: [],
      metricCards: [],
      progress: { ...emptyProgress },
      taskTotal: 0,
      deviceTotal: 0,
    };
  }

  function toStatusList(statuses?: WorkbenchStatusItem[]) {
    return Array.isArray(statuses) ? statuses.filter((item) => Boolean(item?.statusName)) : [];
  }

  function statusesToPieData(statuses: WorkbenchStatusItem[]): PieChartItem[] {
    return statuses.map((item, index) => ({
      name: getStatusName(item),
      value: toNumber(item.count),
    }));
  }

  function statusesToRows(statuses: WorkbenchStatusItem[], prefix: string): TableRowItem[] {
    return statuses.map((item, index) => ({
      key: `${prefix}-${item.statusCode ?? index}`,
      status: getStatusName(item),
      num: toNumber(item.count),
      zb: formatPercent(item.percentage),
    }));
  }

  function statusesToMetricCards(statuses: WorkbenchStatusItem[]): MetricCardItem[] {
    return statuses.map((item, index) => {
      const style = metricPalette[index % metricPalette.length];
      return {
        title: getStatusName(item),
        value: toNumber(item.count),
        ...style,
      };
    });
  }

  function getStatusName(item: WorkbenchStatusItem) {
    return item.statusName || '';
  }

  function toNumber(value: unknown) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function toPercentNumber(value: unknown) {
    return Math.max(0, Math.min(100, Math.round(toNumber(value))));
  }

  function formatPercent(value: unknown) {
    const num = toNumber(value);
    return `${Number.isInteger(num) ? num : num.toFixed(2)}%`;
  }

  function getStatusColor(colorMap: Record<string, string>, status: string) {
    return colorMap[status] || '#94a3b8';
  }

  function clonePieData(data: PieChartItem[]) {
    return data.map((item) => ({ ...item }));
  }

  function cloneMetricCards(data: MetricCardItem[]) {
    return data.map((item) => ({ ...item }));
  }

  function cloneTableRows(data: TableRowItem[]) {
    return data.map((item) => ({ ...item }));
  }

  function createDonutChartOption({
    totalText,
    titleText,
    top,
    valueFontSize,
    colors,
    formatter,
    legend,
  }: {
    totalText: string;
    titleText: string;
    top: string;
    valueFontSize: number;
    colors: string[];
    formatter: string;
    legend?: Record<string, unknown>;
  }) {
    return {
      tooltip: {
        formatter: '{b} ({c})',
      },
      legend: legend || {
        bottom: 0,
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top,
          z: 10,
          style: {
            text: [`{value|${totalText}}`, `{title|${titleText}}`].join('\n'),
            textAlign: 'center',
            rich: {
              title: {
                fontSize: 15,
                color: '#7e8ca5',
                padding: [6, 0, 0, 0],
              },
              value: {
                fontSize: valueFontSize,
                color: '#182538',
                fontWeight: 'bold',
              },
            },
          },
        },
      ],
      series: [
        {
          color: colors,
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '45%'],
          data: [],
          labelLine: { show: true },
          label: {
            show: true,
            formatter,
            color: '#93a2bd',
          },
        },
      ],
    };
  }

  function getMetricStyle(item: MetricCardItem) {
    return {
      '--metric-color': item.color,
      '--metric-soft-color': item.softColor,
    };
  }

  function getProgressStyle(item: ProgressPanelItem) {
    return {
      '--progress-color': item.color,
      '--progress-soft-color': item.softColor,
    };
  }
</script>

<style lang="less" scoped>
  .analysis-page {
    min-height: 100%;
    background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 24%), linear-gradient(180deg, #f4f7fb 0%, #f8fafc 100%);
  }

  .chart-panel {
    min-height: 280px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.96) 100%);
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
  }

  .overview-row {
    align-items: stretch;
  }

  .overview-col {
    display: flex;
  }

  .chart-panel--accent {
    background:
      radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.14), transparent 28%),
      linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.96) 100%);
  }

  .period-tabs {
    display: flex;
    gap: 10px;
  }

  .period-chip {
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 14px;
    color: #64748b;
    background: #f1f5f9;
    transition: all 0.2s ease;
    cursor: pointer;
    user-select: none;
  }

  .period-chip:hover {
    color: #1d4ed8;
    background: rgba(37, 99, 235, 0.08);
  }

  .period-chip--active {
    color: #0f172a;
    background: rgba(37, 99, 235, 0.12);
    box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.14);
  }

  .status-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 22px;
    color: #334155;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex: none;
  }

  .table-panel {
    min-height: 280px;
  }

  .status-table {
    min-height: 280px;
  }

  .status-table :deep(.ant-table) {
    min-height: 280px;
    border-radius: 18px;
    background: #fff;
  }

  .status-table :deep(.ant-table-container) {
    min-height: 280px;
  }

  .status-table :deep(.ant-table-tbody > tr.ant-table-placeholder > td) {
    height: 232px;
  }

  .metric-card {
    border-radius: 16px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow:
      0 12px 28px rgba(15, 23, 42, 0.06),
      inset 0 0 0 1px rgba(148, 163, 184, 0.1);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 18px 32px rgba(15, 23, 42, 0.08),
      inset 0 0 0 1px rgba(148, 163, 184, 0.12);
  }

  .metric-grid {
    min-height: 120px;
    align-content: flex-start;
  }

  .metric-grid--repair,
  .metric-grid--task {
    min-height: 280px;
  }

  .empty-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    border-radius: 16px;
    color: #94a3b8;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow:
      0 12px 28px rgba(15, 23, 42, 0.06),
      inset 0 0 0 1px rgba(148, 163, 184, 0.1);
  }

  .empty-panel__text {
    margin-top: 12px;
    font-size: 15px;
    line-height: 1;
  }

  .empty-panel--metric {
    min-height: 108px;
  }

  .empty-panel--metric .empty-panel__text {
    margin-top: 8px;
  }

  .metric-card__content {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 72px;
  }

  .metric-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: var(--metric-soft-color);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
    flex: none;
  }

  .metric-card__meta {
    min-width: 0;
  }

  .metric-card__value {
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
    color: #172554;
  }

  .metric-card__value--secondary {
    margin-top: 8px;
  }

  .metric-card__label {
    margin-top: 8px;
    font-size: 15px;
    color: #64748b;
    letter-spacing: 0.02em;
  }

  .progress-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 280px;
    border-radius: 18px;
    background: linear-gradient(180deg, var(--progress-soft-color) 0%, rgba(255, 255, 255, 0.98) 100%);
    box-shadow:
      0 12px 28px rgba(15, 23, 42, 0.06),
      inset 0 0 0 1px rgba(148, 163, 184, 0.1);
  }

  .progress-panel__value {
    font-size: 30px;
    line-height: 1;
    font-weight: 700;
    color: #0f172a;
  }

  .progress-panel__label {
    font-size: 16px;
    color: #64748b;
  }

  .progress-panel__total {
    margin-top: 18px;
    font-size: 15px;
    color: #475569;
  }

  :deep(.dashboard-card) {
    overflow: hidden;
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
  }

  :deep(.overview-card) {
    height: 100%;
  }

  :deep(.dashboard-card .ant-card-head) {
    min-height: 62px;
    padding: 0 24px;
    border-bottom: 1px solid #edf2f7;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
  }

  :deep(.dashboard-card .ant-card-head-title) {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
  }

  :deep(.dashboard-card .ant-card-extra) {
    padding: 0;
  }

  :deep(.status-table .ant-table) {
    background: transparent;
  }

  :deep(.status-table .ant-table-thead > tr > th) {
    background: #f8fafc;
    color: #475569;
    font-size: 15px;
    font-weight: 600;
  }

  :deep(.status-table .ant-table-tbody > tr > td) {
    color: #334155;
    font-size: 15px;
  }

  :deep(.quick-nav-card .ant-card-body) {
    padding: 0;
  }

  :deep(.quick-nav-card .ant-card-grid) {
    width: 33.3333%;
    min-height: 92px;
    border-color: #eef2f7;
    box-shadow: none;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease;
  }

  :deep(.quick-nav-card .ant-card-grid:hover) {
    background: #f8fbff;
    transform: translateY(-2px);
  }
</style>
