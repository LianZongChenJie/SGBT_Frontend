<template>
  <div ref="chartRef" class="monitor-line-chart"></div>
</template>

<script setup lang="ts">
  import type { EChartsOption } from 'echarts';
  import { computed, onMounted, type Ref, ref, watch } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';

  interface LineSeries {
    name: string;
    data: (number | null)[];
    /** 关联的 y 轴下标，配合多监测项（多 y 轴）使用 */
    yAxisIndex?: number;
  }

  const props = defineProps<{
    xAxis: string[];
    series: LineSeries[];
    /** 每个监测项对应一条 y 轴，只有一个时使用单 y 轴 */
    yAxisNames?: string[];
  }>();

  const COLORS = ['#3b82f6', '#36cfc9', '#f59e0b', '#8b5cf6', '#ef4444', '#22c55e'];

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const chartOption = computed<EChartsOption>(() => {
    const axisNames = props.yAxisNames?.length ? props.yAxisNames : [''];
    const multiAxis = axisNames.length > 1;

    return {
      color: COLORS,
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        type: 'scroll',
        bottom: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        padding: [0, 8],
        textStyle: {
          color: '#64748b',
          fontSize: 12,
        },
      },
      grid: {
        left: 16,
        right: 16,
        top: 48,
        bottom: 52,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.xAxis,
        axisLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          margin: 12,
          hideOverlap: true,
        },
      },
      yAxis: axisNames.map((name, index) => ({
        type: 'value' as const,
        name: multiAxis ? name : '',
        nameLocation: 'end' as const,
        nameRotate: 0,
        nameGap: 14,
        position: index === 0 ? ('left' as const) : ('right' as const),
        offset: index > 1 ? (index - 1) * 40 : 0,
        alignTicks: true,
        nameTextStyle: {
          color: '#94a3b8',
          fontSize: 11,
          align: index === 0 ? 'left' : 'right',
        },
        splitLine: {
          show: index === 0,
          lineStyle: {
            color: '#f1f5f9',
          },
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          margin: 10,
          hideOverlap: true,
        },
      })),
      series: props.series.map((item) => ({
        name: item.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        connectNulls: true,
        yAxisIndex: item.yAxisIndex ?? 0,
        data: item.data,
      })),
    };
  });

  watch(
    chartOption,
    () => {
      setOptions(chartOption.value);
    },
    { deep: true }
  );

  onMounted(() => {
    setOptions(chartOption.value);
  });
</script>

<style lang="less" scoped>
  .monitor-line-chart {
    width: 100%;
    height: 300px;
  }
</style>
