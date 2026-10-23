<template>
  <div class="boiler-steam-output">
    <a-spin :spinning="loading">
      <div class="card-grid">
        <div v-for="item in cardList" :key="item.key" class="metric-card" :style="getMetricStyle(item)">
          <div class="metric-card__header">
            <div class="metric-card__icon">
              <Icon icon="ant-design:cloud-server-outlined" :size="22" :color="item.color" />
            </div>
            <div class="metric-card__name" :title="item.name">{{ item.name }}</div>
          </div>
          <div class="metric-card__body">
            <div class="metric-item">
              <div class="metric-item__label">蒸汽产量</div>
              <div class="metric-item__value metric-item__value--steam">{{ item.valueText }}</div>
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
  import { getBoilerSteamOutputApi } from '../visualization.api';

  interface BoilerSteamOutputModel {
    /** 名称 */
    name: string;
    /** 蒸汽产量 */
    value: number | string;
  }

  interface BoilerSteamOutputItem extends BoilerSteamOutputModel {
    key: string;
    color: string;
    softColor: string;
    valueText: string;
  }

  /** 卡片主题色循环使用 */
  const colorList = [
    { color: '#0ea5e9', softColor: 'rgba(14, 165, 233, 0.14)' },
    { color: '#f59e0b', softColor: 'rgba(245, 158, 11, 0.14)' },
    { color: '#8b5cf6', softColor: 'rgba(139, 92, 246, 0.14)' },
    { color: '#14b8a6', softColor: 'rgba(20, 184, 166, 0.14)' },
    { color: '#ef4444', softColor: 'rgba(239, 68, 68, 0.14)' },
    { color: '#22c55e', softColor: 'rgba(34, 197, 94, 0.14)' },
  ];

  const list = ref<BoilerSteamOutputModel[]>([]);
  const loading = ref(false);

  const cardList = computed<BoilerSteamOutputItem[]>(() =>
    list.value.map((item, index) => {
      const theme = colorList[index % colorList.length];
      return {
        ...item,
        key: `${item.name}-${index}`,
        color: theme.color,
        softColor: theme.softColor,
        valueText: formatValue(item.value),
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

  function getMetricStyle(item: BoilerSteamOutputItem) {
    return {
      '--metric-color': item.color,
      '--metric-soft-color': item.softColor,
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await getBoilerSteamOutputApi();
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
  .boiler-steam-output {
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

  .metric-item__value--steam {
    color: #0284c7;
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
