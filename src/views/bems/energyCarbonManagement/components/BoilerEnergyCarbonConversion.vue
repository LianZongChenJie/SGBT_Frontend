<template>
  <div class="boiler-energy-carbon-conversion">
    <a-spin :spinning="loading">
      <div class="card-grid">
        <div v-for="item in cardList" :key="item.key" class="metric-card" :style="getMetricStyle(item)">
          <div class="metric-card__header">
            <div class="metric-card__icon">
              <Icon icon="ant-design:fire-outlined" :size="22" :color="item.color" />
            </div>
            <div class="metric-card__name" :title="item.attributeName">{{ item.attributeName }}</div>
          </div>
          <div class="metric-card__body">
            <div class="metric-item">
              <div class="metric-item__label">标况体积消耗量</div>
              <div class="metric-item__value metric-item__value--volume">{{ item.totalValueText }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-item__label">碳排放量</div>
              <div class="metric-item__value metric-item__value--carbon">{{ item.carbonEmissionText }}</div>
            </div>
          </div>
        </div>
        <div v-if="!cardList.length" class="empty-tip">暂无数据</div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { getBoilerEnergyCarbonConversionApi } from '../visualization.api';

  interface BoilerEnergyCarbonModel {
    /** 设备名称 */
    attributeName: string;
    /** 标况体积消耗量 */
    totalValue: number | string;
    /** 碳排放量 */
    carbonEmission: number | string;
  }

  interface BoilerCardItem extends BoilerEnergyCarbonModel {
    key: string;
    color: string;
    softColor: string;
    totalValueText: string;
    carbonEmissionText: string;
  }

  /** 卡片主题色循环使用 */
  const colorList = [
    { color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
    { color: '#3b82f6', softColor: 'rgba(59, 130, 246, 0.14)' },
    { color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
    { color: '#8b5cf6', softColor: 'rgba(139, 92, 246, 0.14)' },
    { color: '#14b8a6', softColor: 'rgba(20, 184, 166, 0.14)' },
    { color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
  ];

  const list = ref<BoilerEnergyCarbonModel[]>([]);
  const loading = ref(false);

  const cardList = computed<BoilerCardItem[]>(() =>
    list.value.map((item, index) => {
      const theme = colorList[index % colorList.length];
      return {
        ...item,
        key: `${item.attributeName}-${index}`,
        color: theme.color,
        softColor: theme.softColor,
        totalValueText: formatValue(item.totalValue),
        carbonEmissionText: formatValue(item.carbonEmission),
      };
    })
  );

  /** 空值兜底，并对整数部分按千分位格式化 */
  function formatValue(value?: number | string) {
    if (value === undefined || value === null || value === '') return '--';
    const [intPart, decimalPart] = String(value).split('.');
    if (!intPart) return '--';
    const intText = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart ? `${intText}.${decimalPart}` : intText;
  }

  function getMetricStyle(item: BoilerCardItem) {
    return {
      '--metric-color': item.color,
      '--metric-soft-color': item.softColor,
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await getBoilerEnergyCarbonConversionApi();
      list.value = Array.isArray(result) ? result : [];
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
  .boiler-energy-carbon-conversion {
    min-height: 200px;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    min-height: 200px;
  }

  .metric-card {
    border-radius: 14px;
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
      0 14px 24px rgba(15, 23, 42, 0.08),
      inset 0 0 0 1px rgba(148, 163, 184, 0.12);
  }

  .metric-card__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 14px 10px;
  }

  .metric-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: var(--metric-soft-color);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
    flex: none;
  }

  .metric-card__name {
    min-width: 0;
    font-size: 14px;
    font-weight: 600;
    color: #172554;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .metric-card__body {
    display: flex;
    gap: 8px;
    padding: 0 14px 14px;
  }

  .metric-item {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(241, 245, 249, 0.8);
  }

  .metric-item__label {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }

  .metric-item__value {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
    color: #172554;
    word-break: break-all;
  }

  .metric-item__value--volume {
    color: #1d4ed8;
  }

  .metric-item__value--carbon {
    color: #dc2626;
  }

  .empty-tip {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #94a3b8;
    font-size: 14px;
  }
</style>
