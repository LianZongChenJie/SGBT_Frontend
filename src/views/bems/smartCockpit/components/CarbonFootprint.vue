<template>
  <div class="carbon-footprint">
    <div v-for="item in footprintList" :key="item.field" class="metric-card" :style="getMetricStyle(item)">
      <div class="metric-card__content">
        <div class="metric-card__icon">
          <Icon :icon="item.icon" :size="26" :color="item.color" />
        </div>
        <div class="metric-card__meta">
          <div class="metric-card__value">{{ item.value }}</div>
          <div class="metric-card__label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { getCarbonFootprintApi } from '../visualization.api';

  interface CarbonFootprintModel {
    /** 碳排放总量 */
    totalCarbonEmissions: number | string;
    /** 等效植树量 */
    equivalentPlantations: number | string;
    /** 再利用能源减排量 */
    reuseEnergySavings: number | string;
    /** 绿电减排 */
    greenPowerEmissionReduction: number | string;
    /** 绿植固碳 */
    greenPlantsSequestration: number | string;
  }

  interface FootprintItem {
    field: keyof CarbonFootprintModel;
    label: string;
    icon: string;
    color: string;
    softColor: string;
    value: number | string;
  }

  const footprintData = ref<CarbonFootprintModel>({} as CarbonFootprintModel);
  const loading = ref(false);

  const footprintList = computed<FootprintItem[]>(() => [
    {
      field: 'totalCarbonEmissions',
      label: '碳排放总量',
      icon: 'ant-design:cloud-outlined',
      color: '#ef4444',
      softColor: 'rgba(239, 68, 68, 0.14)',
      value: formatValue(footprintData.value.totalCarbonEmissions),
    },
    {
      field: 'equivalentPlantations',
      label: '等效植树量',
      icon: 'ant-design:environment-outlined',
      color: '#22c55e',
      softColor: 'rgba(34, 197, 94, 0.14)',
      value: formatValue(footprintData.value.equivalentPlantations),
    },
    {
      field: 'reuseEnergySavings',
      label: '再利用能源减排量',
      icon: 'ant-design:sync-outlined',
      color: '#3b82f6',
      softColor: 'rgba(59, 130, 246, 0.14)',
      value: formatValue(footprintData.value.reuseEnergySavings),
    },
    {
      field: 'greenPowerEmissionReduction',
      label: '绿电减排',
      icon: 'ant-design:thunderbolt-outlined',
      color: '#8b5cf6',
      softColor: 'rgba(139, 92, 246, 0.14)',
      value: formatValue(footprintData.value.greenPowerEmissionReduction),
    },
    {
      field: 'greenPlantsSequestration',
      label: '绿植固碳',
      icon: 'ant-design:experiment-outlined',
      color: '#14b8a6',
      softColor: 'rgba(20, 184, 166, 0.14)',
      value: formatValue(footprintData.value.greenPlantsSequestration),
    },
  ]);

  function formatValue(value?: number | string) {
    return value === undefined || value === null ? 0 : value;
  }

  function getMetricStyle(item: FootprintItem) {
    return {
      '--metric-color': item.color,
      '--metric-soft-color': item.softColor,
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      footprintData.value = await getCarbonFootprintApi();
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadData();
  });

  defineExpose({ loadData });
</script>

<style lang="less" scoped>
  .carbon-footprint {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
    min-height: 72px;
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
  }

  .metric-card__label {
    margin-top: 8px;
    font-size: 15px;
    color: #64748b;
    letter-spacing: 0.02em;
  }
</style>
