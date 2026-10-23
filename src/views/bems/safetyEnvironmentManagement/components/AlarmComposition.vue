<template>
  <div class="alarm-composition">
    <a-spin :spinning="loading">
      <div class="alarm-composition__chart-box">
        <div ref="chartRef" class="alarm-composition__chart"></div>
        <div v-if="!loading && !pieData.length" class="alarm-composition__empty">暂无数据</div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import type { EChartsOption } from 'echarts';
  import { computed, onMounted, type Ref, ref, watch } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getAlarmsByTypeNumberApi } from '../safetyEnvironmentManagement.api';

  type PeriodType = '本周' | '本月' | '本年';

  interface AlarmCategoryItem {
    alarmCategoryId: number;
    alarmCategoryName: string;
    count: number;
  }

  interface AlarmTypeGroup {
    type: string;
    size: number;
    data: AlarmCategoryItem[];
  }

  interface PieItem {
    name: string;
    value: number;
  }

  const props = defineProps<{
    period: PeriodType;
  }>();

  const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#22c55e', '#8b5cf6', '#14b8a6'];

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const groupList = ref<AlarmTypeGroup[]>([]);
  const loading = ref(false);

  /** 当前周期（本周/本月/本年）对应的报警分类数据 */
  const pieData = computed<PieItem[]>(() => {
    const group = groupList.value.find((item) => item.type === props.period);
    return (group?.data || []).map((item) => ({
      name: item.alarmCategoryName,
      value: Number(item.count) || 0,
    }));
  });

  const totalCount = computed(() => {
    const group = groupList.value.find((item) => item.type === props.period);
    const size = Number(group?.size);
    if (Number.isFinite(size)) {
      return size;
    }
    return pieData.value.reduce((total, item) => total + item.value, 0);
  });

  const chartOption = computed<EChartsOption>(() => ({
    color: COLORS,
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>{c} 次（{d}%）',
    },
    title: {
      text: String(totalCount.value),
      subtext: '报警总数',
      left: '50%',
      top: '39%',
      textAlign: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 600,
        color: '#0f172a',
      },
      subtextStyle: {
        fontSize: 12,
        color: '#94a3b8',
      },
    },
    series: [
      {
        name: '报警组成',
        type: 'pie',
        radius: ['46%', '68%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 4,
        },
        label: {
          color: '#475569',
          fontSize: 12,
          formatter: '{b}\n{c} 次（{d}%）',
        },
        labelLine: {
          length: 10,
          length2: 8,
        },
        data: pieData.value,
      },
    ],
  }));

  watch(
    chartOption,
    () => {
      setOptions(chartOption.value);
    },
    { deep: true }
  );

  async function loadData() {
    loading.value = true;
    try {
      const result = await getAlarmsByTypeNumberApi();
      groupList.value = Array.isArray(result) ? result : [];
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
  .alarm-composition {
    min-height: 300px;

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      min-height: 300px;
    }
  }

  .alarm-composition__chart-box {
    position: relative;
    min-height: 300px;
  }

  .alarm-composition__chart {
    width: 100%;
    height: 300px;
  }

  .alarm-composition__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: #94a3b8;
  }
</style>
