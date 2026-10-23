<template>
  <div class="environmental-monitoring-two">
    <a-spin :spinning="loading">
      <MonitorLineChart
        v-if="chartView.series.length"
        :x-axis="chartView.xAxis"
        :series="chartView.series"
        :y-axis-names="chartView.yAxisNames"
      />
      <div v-else-if="!loading" class="monitor-empty">暂无数据</div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import dayjs from 'dayjs';
  import { getDividedIntoSixApi } from '../safetyEnvironmentManagement.api';
  import MonitorLineChart from './MonitorLineChart.vue';

  interface MonitorPoint {
    collectionTime: string;
    value: number | string;
  }

  interface DeviceMonitorData {
    deviceName: string;
    data: MonitorPoint[];
  }

  interface ItemMonitorData {
    itemName: string;
    data: DeviceMonitorData[];
  }

  interface MonitorSeriesView {
    name: string;
    data: (number | null)[];
    yAxisIndex: number;
  }

  interface MonitorChartView {
    xAxis: string[];
    series: MonitorSeriesView[];
    yAxisNames: string[];
  }

  const props = defineProps<{
    /** 是否按天做平均 */
    byDay: boolean;
    /** 开始日期 yyyy-MM-dd */
    startTime: string;
    /** 结束日期 yyyy-MM-dd */
    endTime: string;
  }>();

  const rawList = ref<ItemMonitorData[]>([]);
  const loading = ref(false);

  /** 所有监测项合并到一张图：x 轴取全部时间点并集，每个监测项对应一条 y 轴 */
  const chartView = computed<MonitorChartView>(() => toChartView(rawList.value));

  function toChartView(list: ItemMonitorData[]): MonitorChartView {
    const timeSet = new Set<string>();
    list.forEach((item) => {
      (item.data || []).forEach((device) => {
        (device.data || []).forEach((point) => {
          if (point.collectionTime) {
            timeSet.add(point.collectionTime);
          }
        });
      });
    });

    const times = Array.from(timeSet).sort((prev, next) => dayjs(prev).valueOf() - dayjs(next).valueOf());
    const yAxisNames = list.map((item) => item.itemName).filter(Boolean);

    const series: MonitorSeriesView[] = [];
    list.forEach((item, itemIndex) => {
      (item.data || []).forEach((device) => {
        const valueMap = new Map<string, number | null>();
        (device.data || []).forEach((point) => {
          valueMap.set(point.collectionTime, toNumber(point.value));
        });
        series.push({
          name: `${item.itemName}-${device.deviceName}`,
          yAxisIndex: itemIndex,
          data: times.map((time) => valueMap.get(time) ?? null),
        });
      });
    });

    return {
      xAxis: times.map((time) => formatTime(time)),
      series,
      yAxisNames,
    };
  }

  function toNumber(value: unknown) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  /** 按天平均展示日期，否则展示到分钟 */
  function formatTime(time: string) {
    const date = dayjs(time);
    if (!date.isValid()) {
      return time;
    }
    return props.byDay ? date.format('MM-DD') : date.format('MM-DD HH:mm');
  }

  let requestId = 0;

  async function loadData() {
    if (!props.startTime || !props.endTime) {
      return;
    }
    const currentId = ++requestId;
    loading.value = true;
    try {
      const result = await getDividedIntoSixApi({
        byDay: props.byDay,
        startTime: props.startTime,
        endTime: props.endTime,
      });
      if (currentId !== requestId) {
        return;
      }
      rawList.value = Array.isArray(result) ? result : [];
    } finally {
      if (currentId === requestId) {
        loading.value = false;
      }
    }
  }

  watch(
    () => [props.byDay, props.startTime, props.endTime],
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
  .environmental-monitoring-two {
    min-height: 300px;

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      min-height: 300px;
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
