<template>
  <div class="index-def-page p-4">
    <GrowCard :loading="loading" class="enter-y" />

    <a-card class="dashboard-card mt3 mb3" title="告警事件态势" :loading="loading" :bordered="false" :bodyStyle="cardBodyStyle">
      <template #extra>
        <div class="period-tabs">
          <span
            v-for="period in alertPeriods"
            :key="period"
            class="period-chip"
            :class="{ 'period-chip--active': period === activeAlertPeriod }"
            @click="activeAlertPeriod = period"
          >
            {{ period }}
          </span>
        </div>
      </template>

      <a-row :gutter="[20, 20]" class="alert-overview">
        <a-col class="stretch-col" :xl="10" :lg="24" :md="24" :sm="24" :xs="24">
          <div class="alert-left-panel">
            <div class="summary-stack">
              <a-card v-for="item in alertSummaryCards" :key="item.title" class="summary-card" :bordered="false" :bodyStyle="summaryCardBodyStyle">
                <div class="summary-card__content" :style="getToneStyle(item.color, item.softColor)">
                  <div class="summary-card__icon">
                    <Icon :icon="item.icon" :size="24" :color="item.color" />
                  </div>
                  <div class="summary-card__meta">
                    <div class="summary-card__value">{{ item.value }}</div>
                    <div class="summary-card__label">{{ item.title }}</div>
                  </div>
                </div>
              </a-card>
            </div>

            <a-card class="process-card" title="告警处理率统计" :bordered="false" :bodyStyle="processCardBodyStyle">
              <div class="progress-dashboard">
                <a-progress type="dashboard" :percent="alertProcess.percent" :size="220" :stroke-width="12" :stroke-color="alertProcess.strokeColor">
                  <template #format="percent">
                    <span class="progress-dashboard__value">{{ percent }}%</span>
                    <div class="progress-dashboard__label mt2">{{ alertProcess.label }}</div>
                  </template>
                </a-progress>
                <div class="progress-dashboard__meta">
                  <span>{{ alertProcess.handledLabel }} {{ alertProcess.handledCount }}</span>
                  <span>累计告警 {{ alertProcess.total }}</span>
                </div>
              </div>
            </a-card>
          </div>
        </a-col>

        <a-col class="stretch-col" :xl="14" :lg="24" :md="24" :sm="24" :xs="24">
          <a-row :gutter="[16, 16]" class="severity-grid">
            <a-col v-for="item in severityCards" :key="item.title" class="stretch-col" :xl="6" :lg="12" :md="12" :sm="12" :xs="24">
              <a-card class="severity-card" :bordered="false" :bodyStyle="severityCardBodyStyle">
                <div class="severity-card__header">
                  <div class="severity-card__badge" :style="getToneStyle(item.color, item.softColor)">
                    <Icon :icon="item.icon" :size="18" :color="item.color" />
                  </div>
                  <div class="severity-card__meta">
                    <div class="severity-card__title">{{ item.title }}</div>
                    <div class="severity-card__count">{{ item.count }} 条</div>
                  </div>
                </div>
                <div class="severity-card__progress">
                  <a-progress type="circle" :percent="item.percent" :size="158" :stroke-width="11" :strokeColor="item.color">
                    <template #format="percent">
                      <span class="severity-card__percent">{{ percent }}%</span>
                    </template>
                  </a-progress>
                </div>
                <div class="severity-card__footer">{{ item.footer }}</div>
              </a-card>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-card>

    <a-row :gutter="[20, 20]">
      <a-col class="stretch-col" :xl="8" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card class="dashboard-card environment-card" title="环境监测" :loading="loading" :bordered="false" :bodyStyle="cardBodyStyle">
          <div class="monitor-list">
            <a-card
              v-for="item in environmentCards"
              :key="item.title"
              class="monitor-item"
              size="small"
              :bordered="false"
              :bodyStyle="monitorCardBodyStyle"
            >
              <div class="monitor-item__header">
                <div class="monitor-item__title-wrap">
                  <div class="monitor-item__icon" :style="getToneStyle(item.color, item.softColor)">
                    <Icon :icon="item.icon" :size="18" :color="item.color" />
                  </div>
                  <div>
                    <div class="monitor-item__title">{{ item.title }}</div>
                    <div class="monitor-item__subtitle">{{ item.subtitle }}</div>
                  </div>
                </div>
                <span class="monitor-item__tag">{{ item.tag }}</span>
              </div>

              <div v-for="metric in item.metrics" :key="metric.label" class="monitor-metric">
                <div class="monitor-metric__top">
                  <span>{{ metric.label }}</span>
                  <span>{{ metric.value }}</span>
                </div>
                <a-progress :percent="metric.percent" :steps="10" size="small" class="monitor-metric__progress" :stroke-color="metric.strokeColor" />
              </div>
            </a-card>
          </div>
        </a-card>
      </a-col>

      <a-col class="stretch-col" :xl="16" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card class="dashboard-card monitor-panel-card" title="实时监控" :loading="loading" :bordered="false" :bodyStyle="monitorPanelBodyStyle">
          <template #extra>
            <div class="monitor-panel-extra">
              <span class="monitor-panel-extra__dot"></span>
              <span>设备在线巡检中</span>
            </div>
          </template>
          <div class="monitor-panel">
            <VisitAnalysis />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { Icon } from '/@/components/Icon';
  import GrowCard from '../components/GrowCard.vue';
  import VisitAnalysis from '@/views/dashboard/Analysis/components/VisitAnalysis.vue';

  interface SummaryCardItem {
    title: string;
    value: number;
    icon: string;
    color: string;
    softColor: string;
  }

  interface SeverityCardItem {
    title: string;
    count: number;
    percent: number;
    icon: string;
    color: string;
    softColor: string;
    footer: string;
  }

  interface MonitorMetricItem {
    label: string;
    value: string;
    percent: number;
    strokeColor: string[];
  }

  interface MonitorCardItem {
    title: string;
    subtitle: string;
    tag: string;
    icon: string;
    color: string;
    softColor: string;
    metrics: MonitorMetricItem[];
  }

  interface AlertProcessItem {
    percent: number;
    label: string;
    handledLabel: string;
    handledCount: string;
    total: string;
    strokeColor: Record<string, string>;
  }

  type AlertPeriod = '今日' | '近7天' | '近一个月';

  const loading = ref(true);

  const activeAlertPeriod = ref<AlertPeriod>('今日');
  const alertPeriods: AlertPeriod[] = ['今日', '近7天', '近一个月'];

  const cardBodyStyle = { padding: '22px 24px' };
  const summaryCardBodyStyle = { padding: '16px 18px' };
  const processCardBodyStyle = { padding: '18px 16px' };
  const severityCardBodyStyle = { padding: '18px 16px 20px' };
  const monitorCardBodyStyle = { padding: '18px 18px 16px' };
  const monitorPanelBodyStyle = { padding: '18px 20px 12px' };

  const progressStepsColor = ['#34d399', '#34d399', '#34d399', '#34d399', '#60a5fa', '#60a5fa', '#60a5fa', '#fbbf24', '#f87171', '#ef4444'];

  const alertOverviewData: Record<
    AlertPeriod,
    {
      summaryCards: SummaryCardItem[];
      process: AlertProcessItem;
      severityCards: SeverityCardItem[];
    }
  > = {
    今日: {
      summaryCards: [
        { title: '告警总数', value: 12, icon: 'ant-design:bell-outlined', color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
        { title: '待处理', value: 3, icon: 'ant-design:clock-circle-outlined', color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
        { title: '已处理', value: 9, icon: 'ant-design:check-circle-outlined', color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
      ],
      process: {
        percent: 75,
        label: '告警处理率',
        handledLabel: '今日处理',
        handledCount: '9 条',
        total: '12 条',
        strokeColor: {
          '0%': '#1d4ed8',
          '100%': '#bfdbfe',
        },
      },
      severityCards: [
        {
          title: '非常紧急',
          count: 1,
          percent: 100,
          icon: 'ant-design:warning-outlined',
          color: '#ff6b6b',
          softColor: 'rgba(255, 107, 107, 0.14)',
          footer: '非常紧急处理率',
        },
        {
          title: '紧急',
          count: 2,
          percent: 50,
          icon: 'ant-design:alert-outlined',
          color: '#f59e0b',
          softColor: 'rgba(245, 158, 11, 0.14)',
          footer: '紧急处理率',
        },
        {
          title: '一般',
          count: 5,
          percent: 80,
          icon: 'ant-design:notification-outlined',
          color: '#3b82f6',
          softColor: 'rgba(59, 130, 246, 0.14)',
          footer: '一般处理率',
        },
        {
          title: '较低',
          count: 4,
          percent: 75,
          icon: 'ant-design:info-circle-outlined',
          color: '#14b8a6',
          softColor: 'rgba(20, 184, 166, 0.14)',
          footer: '较低处理率',
        },
      ],
    },
    近7天: {
      summaryCards: [
        { title: '告警总数', value: 86, icon: 'ant-design:bell-outlined', color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
        { title: '待处理', value: 18, icon: 'ant-design:clock-circle-outlined', color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
        { title: '已处理', value: 68, icon: 'ant-design:check-circle-outlined', color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
      ],
      process: {
        percent: 79,
        label: '7天处理率',
        handledLabel: '近7天处理',
        handledCount: '68 条',
        total: '86 条',
        strokeColor: {
          '0%': '#2563eb',
          '100%': '#93c5fd',
        },
      },
      severityCards: [
        {
          title: '非常紧急',
          count: 9,
          percent: 89,
          icon: 'ant-design:warning-outlined',
          color: '#ff6b6b',
          softColor: 'rgba(255, 107, 107, 0.14)',
          footer: '非常紧急处理率',
        },
        {
          title: '紧急',
          count: 17,
          percent: 76,
          icon: 'ant-design:alert-outlined',
          color: '#f59e0b',
          softColor: 'rgba(245, 158, 11, 0.14)',
          footer: '紧急处理率',
        },
        {
          title: '一般',
          count: 33,
          percent: 82,
          icon: 'ant-design:notification-outlined',
          color: '#3b82f6',
          softColor: 'rgba(59, 130, 246, 0.14)',
          footer: '一般处理率',
        },
        {
          title: '较低',
          count: 27,
          percent: 74,
          icon: 'ant-design:info-circle-outlined',
          color: '#14b8a6',
          softColor: 'rgba(20, 184, 166, 0.14)',
          footer: '较低处理率',
        },
      ],
    },
    近一个月: {
      summaryCards: [
        { title: '告警总数', value: 362, icon: 'ant-design:bell-outlined', color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
        { title: '待处理', value: 58, icon: 'ant-design:clock-circle-outlined', color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
        { title: '已处理', value: 304, icon: 'ant-design:check-circle-outlined', color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
      ],
      process: {
        percent: 84,
        label: '月度处理率',
        handledLabel: '近一个月处理',
        handledCount: '304 条',
        total: '362 条',
        strokeColor: {
          '0%': '#1d4ed8',
          '100%': '#60a5fa',
        },
      },
      severityCards: [
        {
          title: '非常紧急',
          count: 36,
          percent: 92,
          icon: 'ant-design:warning-outlined',
          color: '#ff6b6b',
          softColor: 'rgba(255, 107, 107, 0.14)',
          footer: '非常紧急处理率',
        },
        {
          title: '紧急',
          count: 74,
          percent: 83,
          icon: 'ant-design:alert-outlined',
          color: '#f59e0b',
          softColor: 'rgba(245, 158, 11, 0.14)',
          footer: '紧急处理率',
        },
        {
          title: '一般',
          count: 141,
          percent: 86,
          icon: 'ant-design:notification-outlined',
          color: '#3b82f6',
          softColor: 'rgba(59, 130, 246, 0.14)',
          footer: '一般处理率',
        },
        {
          title: '较低',
          count: 111,
          percent: 79,
          icon: 'ant-design:info-circle-outlined',
          color: '#14b8a6',
          softColor: 'rgba(20, 184, 166, 0.14)',
          footer: '较低处理率',
        },
      ],
    },
  };

  const currentAlertOverview = computed(() => alertOverviewData[activeAlertPeriod.value]);
  const alertSummaryCards = computed(() => currentAlertOverview.value.summaryCards.map((item) => ({ ...item })));
  const alertProcess = computed(() => ({
    ...currentAlertOverview.value.process,
    strokeColor: { ...currentAlertOverview.value.process.strokeColor },
  }));
  const severityCards = computed(() => currentAlertOverview.value.severityCards.map((item) => ({ ...item })));

  const environmentCards: MonitorCardItem[] = [
    {
      title: 'CEMS1排放数据',
      subtitle: '1号焚烧线',
      tag: '稳定',
      icon: 'ant-design:cloud-server-outlined',
      color: '#3b82f6',
      softColor: 'rgba(59, 130, 246, 0.12)',
      metrics: [
        { label: 'CO2浓度', value: '302 ppm', percent: 30, strokeColor: progressStepsColor },
        { label: '粉尘浓度', value: '92 mg/m3', percent: 90, strokeColor: progressStepsColor },
      ],
    },
    {
      title: 'CEMS2排放数据',
      subtitle: '2号焚烧线',
      tag: '关注',
      icon: 'ant-design:experiment-outlined',
      color: '#14b8a6',
      softColor: 'rgba(20, 184, 166, 0.12)',
      metrics: [
        { label: 'CO2浓度', value: '286 ppm', percent: 36, strokeColor: progressStepsColor },
        { label: '粉尘浓度', value: '74 mg/m3', percent: 68, strokeColor: progressStepsColor },
      ],
    },
    {
      title: '烟气净化数据',
      subtitle: '净化处理段',
      tag: '正常',
      icon: 'ant-design:filter-outlined',
      color: '#8b5cf6',
      softColor: 'rgba(139, 92, 246, 0.12)',
      metrics: [
        { label: 'CO2浓度', value: '248 ppm', percent: 26, strokeColor: progressStepsColor },
        { label: '粉尘浓度', value: '58 mg/m3', percent: 44, strokeColor: progressStepsColor },
      ],
    },
  ];

  setTimeout(() => {
    loading.value = false;
  }, 500);

  function getToneStyle(color: string, softColor: string) {
    return {
      '--tone-color': color,
      '--tone-soft-color': softColor,
    };
  }
</script>

<style scoped lang="less">
  .index-def-page {
    min-height: 100%;
    background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 22%), linear-gradient(180deg, #f4f7fb 0%, #f8fafc 100%);
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
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
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

  .stretch-col {
    display: flex;
  }

  .alert-overview {
    align-items: stretch;
  }

  .alert-left-panel {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 16px;
    width: 100%;
  }

  .summary-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary-card,
  .process-card,
  .severity-card,
  .monitor-item {
    border-radius: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow:
      0 12px 28px rgba(15, 23, 42, 0.06),
      inset 0 0 0 1px rgba(148, 163, 184, 0.08);
  }

  .summary-card__content {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .summary-card__icon,
  .severity-card__badge,
  .monitor-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--tone-soft-color);
    color: var(--tone-color);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  }

  .summary-card__icon {
    width: 48px;
    height: 48px;
    border-radius: 15px;
    flex: none;
  }

  .summary-card__value {
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
    color: #172554;
  }

  .summary-card__label {
    margin-top: 8px;
    font-size: 15px;
    color: #64748b;
  }

  .process-card {
    display: flex;
    flex: 1;
  }

  .progress-dashboard {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 100%;
    border-radius: 16px;
    background:
      radial-gradient(circle at top, rgba(29, 78, 216, 0.1), transparent 42%),
      linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%);
  }

  .progress-dashboard__value {
    font-size: 32px;
    line-height: 1;
    font-weight: 700;
    color: #0f172a;
  }

  .progress-dashboard__label {
    font-size: 16px;
    color: #64748b;
  }

  .progress-dashboard__meta {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    font-size: 14px;
    color: #475569;
  }

  .severity-grid {
    width: 100%;
    align-items: stretch;
  }

  .severity-card {
    width: 100%;
  }

  .severity-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .severity-card__badge {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    flex: none;
  }

  .severity-card__title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
  }

  .severity-card__count {
    margin-top: 4px;
    font-size: 14px;
    color: #64748b;
  }

  .severity-card__progress {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .severity-card__percent {
    font-size: 26px;
    font-weight: 700;
    color: #172554;
  }

  .severity-card__footer {
    margin-top: 18px;
    text-align: center;
    font-size: 14px;
    color: #475569;
  }

  .environment-card {
    width: 100%;
  }

  .monitor-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .monitor-item__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .monitor-item__title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .monitor-item__icon {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    flex: none;
  }

  .monitor-item__title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
  }

  .monitor-item__subtitle {
    margin-top: 4px;
    font-size: 14px;
    color: #64748b;
  }

  .monitor-item__tag {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 13px;
    color: #2563eb;
    background: rgba(37, 99, 235, 0.1);
    white-space: nowrap;
  }

  .monitor-metric {
    margin-top: 14px;
  }

  .monitor-metric__top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
    font-size: 14px;
    color: #475569;
  }

  .monitor-metric__progress {
    margin-bottom: 0;
  }

  .monitor-panel-card {
    width: 100%;
  }

  .monitor-panel-extra {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #64748b;
  }

  .monitor-panel-extra__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
  }

  .monitor-panel {
    min-height: 100%;
    border-radius: 18px;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
      linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  }

  :deep(.dashboard-card) {
    width: 100%;
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
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

  :deep(.ant-progress-line) {
    margin-bottom: 0;
  }

  @media (max-width: 1400px) {
    .alert-left-panel {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .progress-dashboard__meta {
      flex-direction: column;
      gap: 6px;
      text-align: center;
    }
  }
</style>
