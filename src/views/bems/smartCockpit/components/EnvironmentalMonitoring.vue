<template>
  <div class="environmental-monitoring">
    <a-spin :spinning="loading">
      <div v-for="group in groupViews" :key="group.name" class="monitor-group">
        <div class="monitor-group__title">{{ group.name }}排放数据</div>
        <div class="monitor-group__bars">
          <div v-for="item in group.items" :key="item.type" class="monitor-bar">
            <span class="monitor-bar__label">{{ item.label }}</span>
            <div class="monitor-bar__track">
              <div class="monitor-bar__fill" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
            </div>
            <span class="monitor-bar__value">{{ item.percent }}%</span>
          </div>
        </div>
      </div>
      <div v-if="!loading && groupViews.length === 0" class="monitor-empty">暂无数据</div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { getEnvironmentalMonitoringApi } from '../visualization.api';

  type EnvPeriod = '本周' | '本月' | '本年';

  interface MonitorDetail {
    label: string;
    value: number | string;
  }

  interface MonitorTypeData {
    type: string;
    detailData: MonitorDetail[];
  }

  interface MonitorGroupData {
    name: string;
    data: MonitorTypeData[];
  }

  interface BarView {
    type: string;
    label: string;
    percent: number;
    color: string;
  }

  interface GroupView {
    name: string;
    items: BarView[];
  }

  const props = defineProps<{
    period: EnvPeriod;
  }>();

  /** 本周传空串，本月传'本月'，本年传'YEAR' */
  const periodParamMap: Record<EnvPeriod, string> = {
    本周: '',
    本月: '本月',
    本年: 'YEAR',
  };

  const TYPE_CO2 = '二氧化碳浓度';
  const TYPE_DUST = '粉尘浓度';

  const TYPE_LABEL_MAP: Record<string, string> = {
    [TYPE_CO2]: 'CO2浓度',
    [TYPE_DUST]: '粉尘浓度',
  };

  const TYPE_COLOR_MAP: Record<string, string> = {
    [TYPE_CO2]: '#36cfc9',
    [TYPE_DUST]: '#3b82f6',
  };

  const monitorData = ref<MonitorGroupData[]>([]);
  const loading = ref(false);

  const groupViews = computed<GroupView[]>(() =>
    monitorData.value.map((group) => ({
      name: group.name,
      items: (group.data || []).map((item) => ({
        type: item.type,
        label: TYPE_LABEL_MAP[item.type] || item.type,
        percent: toPercent(pickValue(item.detailData)),
        color: TYPE_COLOR_MAP[item.type] || '#3b82f6',
      })),
    }))
  );

  function pickValue(detailData?: MonitorDetail[]) {
    if (!Array.isArray(detailData) || detailData.length === 0) {
      return 0;
    }
    const matched = detailData.find((detail) => detail.label === props.period);
    return matched?.value ?? detailData[0].value;
  }

  function toPercent(value: unknown) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(num * 100) / 100));
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await getEnvironmentalMonitoringApi({ period: periodParamMap[props.period] });
      monitorData.value = Array.isArray(result) ? result : [];
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => props.period,
    () => {
      loadData();
    }
  );

  onMounted(() => {
    loadData();
  });

  defineExpose({ loadData });
</script>

<style lang="less" scoped>
  .environmental-monitoring {
    min-height: 300px;

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      min-height: 300px;
    }
  }

  .monitor-group {
    display: flex;
    align-items: center;
    gap: 16px;

    & + .monitor-group {
      margin-top: 20px;
    }

    .monitor-group__title {
      width: 130px;
      flex: none;
      font-size: 15px;
      font-weight: 600;
      color: #0d9488;
    }

    .monitor-group__bars {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  .monitor-bar {
    display: flex;
    align-items: center;
    gap: 10px;

    .monitor-bar__label {
      width: 70px;
      flex: none;
      font-size: 14px;
      color: #334155;
    }

    .monitor-bar__track {
      flex: 1;
      min-width: 0;
      height: 10px;
      border-radius: 999px;
      background: #f1f5f9;
      overflow: hidden;
    }

    .monitor-bar__fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .monitor-bar__value {
      width: 56px;
      flex: none;
      text-align: right;
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
  }

  .monitor-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 260px;
    font-size: 15px;
    color: #94a3b8;
  }
</style>
