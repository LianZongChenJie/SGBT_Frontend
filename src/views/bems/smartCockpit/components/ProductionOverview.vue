<template>
  <div class="production-overview">
    <a-spin :spinning="loading">
      <div ref="chartRef" class="production-overview__chart"></div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import type { EChartsOption } from 'echarts';
  import { computed, onMounted, ref, watch, type Ref } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getProductionOverviewApi } from '../visualization.api';

  type PeriodType = '本周' | '本月' | '本年';

  interface OverviewSeriesItem {
    series: number[];
    xAxis: string[];
  }

  interface ProductionOverviewResult {
    period?: string;
    /** 光伏 */
    pv?: OverviewSeriesItem;
    /** 风电 */
    wind?: OverviewSeriesItem;
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
  const overviewData = ref<ProductionOverviewResult>({});
  const loading = ref(false);

  const chartOption = computed<EChartsOption>(() => {
    const pv = overviewData.value.pv;
    const wind = overviewData.value.wind;
    const xAxisData = pv?.xAxis?.length ? pv.xAxis : wind?.xAxis || [];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          label: {
            show: true,
            backgroundColor: '#333',
          },
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
        data: xAxisData,
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
          name: '光伏',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: {},
          data: pv?.series || [],
          color: '#f59e0b',
        },
        {
          name: '风电',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: {},
          data: wind?.series || [],
          color: '#3b82f6',
        },
      ],
    };
  });

  function renderChart() {
    setOptions(chartOption.value);
  }

  async function loadData() {
    loading.value = true;
    try {
      overviewData.value = await getProductionOverviewApi({ period: periodParamMap[props.period] });
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
  .production-overview {
    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      min-height: 300px;
    }

    .production-overview__chart {
      width: 100%;
      height: 300px;
    }
  }
</style>
