<template>
  <div class="production-data">
    <a-spin :spinning="loading">
      <div ref="chartRef" class="production-data__chart"></div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import type { EChartsOption } from 'echarts';
  import { computed, onMounted, ref, watch, type Ref } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getPhotovoltaicPowerGenerationApi } from '../visualization.api';

  type PeriodType = '本周' | '本月' | '本年';

  interface PhotovoltaicPowerGenerationResult {
    period?: string;
    /** 光伏发电量 */
    series?: (number | string)[];
    xaxis?: string[];
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

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
  const resultData = ref<PhotovoltaicPowerGenerationResult>({});
  const loading = ref(false);

  const chartOption = computed<EChartsOption>(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        label: {
          show: true,
          backgroundColor: '#333',
        },
      },
      valueFormatter: (value: unknown) => formatNumber(value),
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: '#64748b',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: resultData.value.xaxis || [],
      axisLine: {
        lineStyle: {
          color: '#e2e8f0',
        },
      },
      axisLabel: {
        color: '#64748b',
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
        },
      },
      axisLabel: {
        color: '#64748b',
      },
    },
    series: [
      {
        name: '光伏发电量',
        type: 'bar',
        barMaxWidth: 28,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
        data: (resultData.value.series || []).map((value) =>
          value === null || value === undefined ? 0 : Number(value)
        ),
        color: '#f59e0b',
      },
    ],
  }));

  /** 空值兜底，并对整数部分按千分位格式化 */
  function formatNumber(value?: unknown) {
    if (value === undefined || value === null || value === '') return '--';
    const [intPart, decimalPart] = String(value).split('.');
    if (!intPart) return '--';
    const intText = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart ? `${intText}.${decimalPart}` : intText;
  }

  function renderChart() {
    setOptions(chartOption.value);
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await getPhotovoltaicPowerGenerationApi({ period: periodParamMap[props.period] });
      resultData.value = result || {};
      renderChart();
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

  watch(chartOption, () => {
    renderChart();
  });

  onMounted(() => {
    loadData();
  });

  defineExpose({ loadData });
</script>

<style lang="less" scoped>
  .production-data {
    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      min-height: 300px;
    }

    .production-data__chart {
      width: 100%;
      height: 300px;
    }
  }
</style>
