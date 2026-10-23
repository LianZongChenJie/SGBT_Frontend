<template>
  <div class="photovoltaic-energy">
    <a-spin :spinning="loading">
      <div class="card-grid">
        <div v-for="item in cardList" :key="item.field" class="metric-card" :style="getMetricStyle(item)">
          <div class="metric-card__content">
            <div class="metric-card__icon">
              <Icon :icon="item.icon" :size="26" :color="item.color" />
            </div>
            <div class="metric-card__meta">
              <div class="metric-card__value">
                {{ item.value }}
                <span v-if="item.unit" class="metric-card__unit">{{ item.unit }}</span>
              </div>
              <div class="metric-card__label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { getPhotovoltaicEnergyIndexApi } from '../visualization.api';

  type PeriodType = '本周' | '本月' | '本年';

  interface PhotovoltaicEnergyResult {
    /** 统计周期 */
    period?: string;
    /** 累计光伏发电量 */
    totalPowerGeneration?: number | string;
    /** 碳排放量（kg CO₂） */
    carbonEmission?: number | string;
  }

  interface MetricItem {
    field: string;
    label: string;
    unit: string;
    icon: string;
    color: string;
    softColor: string;
    value: number | string;
  }

  const props = defineProps<{
    period: PeriodType;
  }>();

  /** 本周传空串，本月传'本月'，本年传'YEAR' */
  const periodParamMap: Record<PeriodType, string> = {
    本周: '',
    本月: '本月',
    本年: 'YEAR',
  };

  const energyData = ref<PhotovoltaicEnergyResult>({});
  const loading = ref(false);

  const cardList = computed<MetricItem[]>(() => [
    {
      field: 'totalPowerGeneration',
      label: '累计光伏发电量',
      unit: '',
      icon: 'ant-design:thunderbolt-outlined',
      color: '#f59e0b',
      softColor: 'rgba(245, 158, 11, 0.14)',
      value: formatValue(energyData.value.totalPowerGeneration),
    },
    {
      field: 'carbonEmission',
      label: '碳排放量',
      unit: 'kg CO₂',
      icon: 'ant-design:cloud-outlined',
      color: '#ef4444',
      softColor: 'rgba(239, 68, 68, 0.14)',
      value: formatValue(energyData.value.carbonEmission),
    },
  ]);

  /** 空值兜底，并对整数部分按千分位格式化 */
  function formatValue(value?: number | string) {
    if (value === undefined || value === null || value === '') return '--';
    const [intPart, decimalPart] = String(value).split('.');
    if (!intPart) return '--';
    const intText = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart ? `${intText}.${decimalPart}` : intText;
  }

  function getMetricStyle(item: MetricItem) {
    return {
      '--metric-color': item.color,
      '--metric-soft-color': item.softColor,
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await getPhotovoltaicEnergyIndexApi({ period: periodParamMap[props.period] });
      energyData.value = result || {};
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
  .photovoltaic-energy {
    min-height: 300px;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
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
    min-height: 108px;
    padding: 18px 20px;
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
    word-break: break-all;
  }

  .metric-card__unit {
    margin-left: 4px;
    font-size: 14px;
    font-weight: normal;
    color: #64748b;
  }

  .metric-card__label {
    margin-top: 8px;
    font-size: 15px;
    color: #64748b;
    letter-spacing: 0.02em;
  }
</style>
