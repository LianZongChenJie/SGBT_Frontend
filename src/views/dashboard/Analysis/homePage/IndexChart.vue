<template>
  <div class="analysis-page p-4">
    <a-row :gutter="[20, 20]" class="overview-row">
      <a-col class="overview-col" :xl="18" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card class="dashboard-card overview-card" :loading="loading" :bordered="false" title="设备状态" :bodyStyle="cardBodyStyle">
          <a-row :gutter="[24, 24]" align="middle">
            <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
              <div class="chart-panel">
                <Pie height="280px" :chartData="deviceData"></Pie>
              </div>
            </a-col>
            <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
              <a-table class="status-table" :columns="deviceColumns" :data-source="deviceRows" size="small" :pagination="false">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <div class="status-cell">
                      <span class="status-dot" :style="{ backgroundColor: getStatusColor(deviceStatusColors, record.status) }"></span>
                      <span>{{ record.status }}</span>
                    </div>
                  </template>
                </template>
              </a-table>
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
              <a-row :gutter="[16, 16]">
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
              <a-row :gutter="[16, 16]">
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
              <a-table class="status-table" :columns="taskColumns" :data-source="patrolTaskRows" size="small" :pagination="false">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <div class="status-cell">
                      <span class="status-dot" :style="{ backgroundColor: getStatusColor(taskStatusColors, record.status) }"></span>
                      <span>{{ record.status }}</span>
                    </div>
                  </template>
                </template>
              </a-table>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Pie from '@/components/chart/PieHuanquan.vue';
  import { Icon } from '/@/components/Icon';
  import QuickNav from '../components/QuickNav.vue';

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

  type SectionPeriod = '今天' | '本周' | '本月';

  const loading = ref(false);

  const sectionPeriods: SectionPeriod[] = ['今天', '本周', '本月'];
  const activeMaintenancePeriod = ref<SectionPeriod>('今天');
  const activePatrolPeriod = ref<SectionPeriod>('今天');

  const cardBodyStyle = { padding: '22px 24px' };
  const metricCardBodyStyle = { padding: '18px 20px' };

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

  const deviceData = ref([
    { name: '维修中', value: 50 },
    { name: '正常运行', value: 100 },
    { name: '故障', value: 15 },
    { name: '停投', value: 40 },
    { name: '报废', value: 110 },
  ]);

  const baoxiuData = ref([
    { name: '未派工', value: 50 },
    { name: '待接单', value: 100 },
    { name: '待执行', value: 15 },
    { name: '维修中', value: 40 },
    { name: '待验证', value: 110 },
  ]);

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

  const deviceRows: TableRowItem[] = [
    { key: 'device-1', status: '报废', num: 32, zb: '35%' },
    { key: 'device-2', status: '停投', num: 2, zb: '5%' },
    { key: 'device-3', status: '故障', num: 3, zb: '2%' },
    { key: 'device-4', status: '正常运行', num: 23, zb: '87%' },
    { key: 'device-5', status: '维修中', num: 10, zb: '20%' },
  ];

  const repairMetricCards: MetricCardItem[] = [
    {
      title: '工单总数',
      value: 10,
      icon: 'ant-design:file-text-outlined',
      color: '#f59e0b',
      softColor: 'rgba(245, 158, 11, 0.14)',
    },
    {
      title: '待接单',
      value: 12,
      icon: 'ant-design:inbox-outlined',
      color: '#ef4444',
      softColor: 'rgba(239, 68, 68, 0.14)',
    },
    {
      title: '待执行',
      value: 10,
      icon: 'ant-design:clock-circle-outlined',
      color: '#3b82f6',
      softColor: 'rgba(59, 130, 246, 0.14)',
    },
    {
      title: '维修中',
      value: 2,
      icon: 'ant-design:tool-outlined',
      color: '#14b8a6',
      softColor: 'rgba(20, 184, 166, 0.14)',
    },
    {
      title: '待验证',
      value: 2,
      icon: 'ant-design:safety-certificate-outlined',
      color: '#8b5cf6',
      softColor: 'rgba(139, 92, 246, 0.14)',
    },
    {
      title: '已完成',
      value: 2,
      icon: 'ant-design:check-circle-outlined',
      color: '#22c55e',
      softColor: 'rgba(34, 197, 94, 0.14)',
    },
  ];

  const maintenancePeriodData: Record<
    SectionPeriod,
    {
      chartData: PieChartItem[];
      metricCards: MetricCardItem[];
      progress: ProgressPanelItem;
    }
  > = {
    今天: {
      chartData: [
        { name: '待执行', value: 6 },
        { name: '保养中', value: 4 },
        { name: '逾期', value: 2 },
        { name: '未执行', value: 3 },
        { name: '已完成', value: 15 },
      ],
      metricCards: [
        { title: '待执行', value: 6, icon: 'ant-design:calendar-outlined', color: '#3b82f6', softColor: 'rgba(59, 130, 246, 0.14)' },
        { title: '保养中', value: 4, icon: 'ant-design:dashboard-outlined', color: '#14b8a6', softColor: 'rgba(20, 184, 166, 0.14)' },
        { title: '逾期', value: 2, icon: 'ant-design:alert-outlined', color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
        { title: '未执行', value: 3, icon: 'ant-design:minus-circle-outlined', color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
        { title: '已完成', value: 15, icon: 'ant-design:carry-out-outlined', color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
      ],
      progress: {
        percent: 75,
        label: '任务完成率',
        total: '任务总数: 30',
        color: '#36cfc9',
        softColor: 'rgba(54, 207, 201, 0.16)',
      },
    },
    本周: {
      chartData: [
        { name: '待执行', value: 14 },
        { name: '保养中', value: 9 },
        { name: '逾期', value: 4 },
        { name: '未执行', value: 6 },
        { name: '已完成', value: 38 },
      ],
      metricCards: [
        { title: '待执行', value: 14, icon: 'ant-design:calendar-outlined', color: '#3b82f6', softColor: 'rgba(59, 130, 246, 0.14)' },
        { title: '保养中', value: 9, icon: 'ant-design:dashboard-outlined', color: '#14b8a6', softColor: 'rgba(20, 184, 166, 0.14)' },
        { title: '逾期', value: 4, icon: 'ant-design:alert-outlined', color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
        { title: '未执行', value: 6, icon: 'ant-design:minus-circle-outlined', color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
        { title: '已完成', value: 38, icon: 'ant-design:carry-out-outlined', color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
      ],
      progress: {
        percent: 81,
        label: '任务完成率',
        total: '任务总数: 71',
        color: '#2dd4bf',
        softColor: 'rgba(45, 212, 191, 0.16)',
      },
    },
    本月: {
      chartData: [
        { name: '待执行', value: 32 },
        { name: '保养中', value: 18 },
        { name: '逾期', value: 7 },
        { name: '未执行', value: 12 },
        { name: '已完成', value: 96 },
      ],
      metricCards: [
        { title: '待执行', value: 32, icon: 'ant-design:calendar-outlined', color: '#3b82f6', softColor: 'rgba(59, 130, 246, 0.14)' },
        { title: '保养中', value: 18, icon: 'ant-design:dashboard-outlined', color: '#14b8a6', softColor: 'rgba(20, 184, 166, 0.14)' },
        { title: '逾期', value: 7, icon: 'ant-design:alert-outlined', color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
        { title: '未执行', value: 12, icon: 'ant-design:minus-circle-outlined', color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
        { title: '已完成', value: 96, icon: 'ant-design:carry-out-outlined', color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
      ],
      progress: {
        percent: 88,
        label: '任务完成率',
        total: '任务总数: 165',
        color: '#14b8a6',
        softColor: 'rgba(20, 184, 166, 0.16)',
      },
    },
  };

  const patrolPeriodData: Record<
    SectionPeriod,
    {
      chartData: PieChartItem[];
      rows: TableRowItem[];
      progress: ProgressPanelItem;
    }
  > = {
    今天: {
      chartData: [
        { name: '未检', value: 4 },
        { name: '异常', value: 1 },
        { name: '正常', value: 15 },
      ],
      rows: [
        { key: 'task-today-1', status: '待执行', num: 3, zb: '15%' },
        { key: 'task-today-2', status: '执行中', num: 2, zb: '10%' },
        { key: 'task-today-3', status: '逾期', num: 1, zb: '5%' },
        { key: 'task-today-4', status: '未执行', num: 2, zb: '10%' },
        { key: 'task-today-5', status: '已完成', num: 12, zb: '60%' },
      ],
      progress: {
        percent: 86,
        label: '任务完成率',
        total: '任务总数: 20',
        color: '#6c8cff',
        softColor: 'rgba(108, 140, 255, 0.16)',
      },
    },
    本周: {
      chartData: [
        { name: '未检', value: 13 },
        { name: '异常', value: 6 },
        { name: '正常', value: 64 },
      ],
      rows: [
        { key: 'task-week-1', status: '待执行', num: 8, zb: '10%' },
        { key: 'task-week-2', status: '执行中', num: 6, zb: '7%' },
        { key: 'task-week-3', status: '逾期', num: 4, zb: '5%' },
        { key: 'task-week-4', status: '未执行', num: 9, zb: '11%' },
        { key: 'task-week-5', status: '已完成', num: 56, zb: '67%' },
      ],
      progress: {
        percent: 82,
        label: '任务完成率',
        total: '任务总数: 83',
        color: '#5b8ff9',
        softColor: 'rgba(91, 143, 249, 0.16)',
      },
    },
    本月: {
      chartData: [
        { name: '未检', value: 28 },
        { name: '异常', value: 15 },
        { name: '正常', value: 187 },
      ],
      rows: [
        { key: 'task-month-1', status: '待执行', num: 18, zb: '8%' },
        { key: 'task-month-2', status: '执行中', num: 12, zb: '5%' },
        { key: 'task-month-3', status: '逾期', num: 9, zb: '4%' },
        { key: 'task-month-4', status: '未执行', num: 21, zb: '9%' },
        { key: 'task-month-5', status: '已完成', num: 170, zb: '74%' },
      ],
      progress: {
        percent: 89,
        label: '任务完成率',
        total: '任务总数: 230',
        color: '#4f46e5',
        softColor: 'rgba(79, 70, 229, 0.14)',
      },
    },
  };

  const currentMaintenanceDataset = computed(() => maintenancePeriodData[activeMaintenancePeriod.value]);
  const currentPatrolDataset = computed(() => patrolPeriodData[activePatrolPeriod.value]);

  const maintenanceTaskData = computed(() => clonePieData(currentMaintenanceDataset.value.chartData));
  const maintenanceMetricCards = computed(() => cloneMetricCards(currentMaintenanceDataset.value.metricCards));
  const maintenanceProgress = computed(() => ({ ...currentMaintenanceDataset.value.progress }));
  const patrolTaskData = computed(() => clonePieData(currentPatrolDataset.value.chartData));
  const patrolTaskRows = computed(() => cloneTableRows(currentPatrolDataset.value.rows));
  const patrolProgress = computed(() => ({ ...currentPatrolDataset.value.progress }));
  const maintenanceTotal = computed(() => getPieTotal(maintenanceTaskData.value));
  const patrolDeviceTotal = computed(() => getPieTotal(patrolTaskData.value));

  const repairChartOption = {
    legend: {
      orient: 'vertical',
      right: 10,
      top: 60,
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '34%',
        z: 10,
        style: {
          text: ['{value|5台}', '{title|今日新增 2}'].join('\n'),
          textAlign: 'center',
          rich: {
            title: {
              fontSize: 15,
              color: '#7e8ca5',
              padding: [8, 0, 0, 0],
            },
            value: {
              fontSize: 28,
              color: '#182538',
              fontWeight: 'bold',
            },
          },
        },
      },
    ],
  };

  const maintenanceChartOption = computed(() =>
    createDonutChartOption({
      totalText: `${maintenanceTotal.value}台`,
      titleText: '任务总量',
      top: '39%',
      valueFontSize: 26,
      colors: ['#5685cf', '#87d590', '#4fcce4', '#ffd16e', '#ff7670'],
      formatter: '{d}%',
    })
  );

  const patrolChartOption = computed(() =>
    createDonutChartOption({
      totalText: `${patrolDeviceTotal.value}`,
      titleText: '设备总数',
      top: '35%',
      valueFontSize: 28,
      colors: ['#4fcce4', '#ff7670', '#87d590'],
      formatter: '{b}: {c}',
    })
  );

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

  function getPieTotal(data: PieChartItem[]) {
    return data.reduce((sum, item) => sum + Number(item.value || 0), 0);
  }

  function createDonutChartOption({
    totalText,
    titleText,
    top,
    valueFontSize,
    colors,
    formatter,
  }: {
    totalText: string;
    titleText: string;
    top: string;
    valueFontSize: number;
    colors: string[];
    formatter: string;
  }) {
    return {
      tooltip: {
        formatter: '{b} ({c})',
      },
      legend: {
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
