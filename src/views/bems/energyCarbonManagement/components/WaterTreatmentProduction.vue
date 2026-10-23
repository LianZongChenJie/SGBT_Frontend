<template>
  <div class="water-treatment-production">
    <a-spin :spinning="loading">
      <div ref="chartRef" class="water-treatment-production__chart"></div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import type { EChartsOption } from 'echarts';
  import { computed, onMounted, ref, watch, type Ref } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getWaterTreatmentProductionApi } from '../visualization.api';

  type PeriodType = '本周' | '本月' | '本年';

  interface WaterTreatmentSeriesItem {
    /** 名称 */
    name: string;
    timeList: string[];
    data: (number | string)[];
    /** 单位 */
    unit?: string;
  }

  interface WaterTreatmentResult {
    period?: string;
    series?: WaterTreatmentSeriesItem[];
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

  /** 折线主题色循环使用 */
  const colorList = ['#0ea5e9', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444', '#14b8a6'];

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
  const resultData = ref<WaterTreatmentResult>({});
  const loading = ref(false);

  const seriesList = computed<WaterTreatmentSeriesItem[]>(() => resultData.value.series || []);

  const xAxisData = computed<string[]>(() => {
    const xaxis = resultData.value.xaxis;
    if (Array.isArray(xaxis) && xaxis.length) {
      return xaxis;
    }
    return seriesList.value.find((item) => item.timeList?.length)?.timeList || [];
  });

  /** 各序列单位一致时展示单位，否则不展示 */
  const unitText = computed(() => {
    const units = seriesList.value.map((item) => item.unit).filter((unit) => !!unit);
    if (!units.length) return '';
    return units.every((unit) => unit === units[0]) ? units[0] : '';
  });

  const chartOption = computed<EChartsOption>(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        label: {
          show: true,
          backgroundColor: '#333',
        },
      },
      valueFormatter: (value: unknown) => {
        const text = formatNumber(value);
        return unitText.value ? `${text} ${unitText.value}` : text;
      },
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
      boundaryGap: false,
      data: xAxisData.value,
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
      name: unitText.value,
      nameTextStyle: {
        color: '#94a3b8',
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
        },
      },
      axisLabel: {
        color: '#64748b',
      },
    },
    series: seriesList.value.map((item, index) => ({
      name: item.name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: (item.data || []).map((value) => (value === null || value === undefined ? 0 : Number(value))),
      color: colorList[index % colorList.length],
    })),
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
      const result = await getWaterTreatmentProductionApi({ period: periodParamMap[props.period] });
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
  .water-treatment-production {
    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      min-height: 300px;
    }

    .water-treatment-production__chart {
      width: 100%;
      height: 300px;
    }
  }
</style>
