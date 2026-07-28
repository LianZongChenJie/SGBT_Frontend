<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="name" :defaultFullscreen="false" :showCancelBtn="false" :showOkBtn="false">
    <div
      ref="chartBarRef"
      :style="{
        width: width || '100%',
        height: height || '40vh',
        minHeight: '200px',
        minWidth: '300px',
      }"
      class="chart-bar-container"
    ></div>
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, inject, onMounted, onUnmounted, nextTick } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { cloneDeep } from 'lodash-es';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import type { Ref } from 'vue';
  interface Props {
    option?: Record<string, any>;
    width?: string;
    height?: string;
    seriesColor?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    option: () => ({}),
    width: '100%',
    height: '40vh',
    seriesColor: '#1890ff',
  });
  const subData = ref([]);
  // 定义组件暴露的方法
  const emit = defineEmits<{
    (e: 'register', ...args: any[]): void;
  }>();
  const chartBarRef = ref<HTMLDivElement | null>(null);
  const { setOptions, echarts, resize, getInstance } = useECharts(chartBarRef as Ref<HTMLDivElement>);

  const name = ref('');
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    if (data?.params) {
      name.value = data.params.data.name;
      subData.value = data.params.data.children;
    }
  });
  const option = reactive({
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 5,
      left: 'center',
    },
    series: [
      {
        name: '工单状态',
        type: 'pie',
        center: ['50%', '50%'],
        radius: ['40%', '60%'],
        avoidLabelOverlap: true,
        stillShowZeroSum: true,
        minAngle: 0,
        clockwise: false,
        label: {
          show: true,
          formatter: '{d}%',
          color: '#333',
          showOverlap: true,
          position: 'outer',
          fontSize: 12,
          margin: 2,
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 18,
          showAbove: true,
          maxSurfaceAngle: 360,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: [],
        color: ['#38ACF5', '#3BFFD0', '#04E38A', '#9DFF86', '#8CA40F', '#FA708B'], // 饼图配色
      },
    ],
    noDataLoadingOption: { text: '暂无工单数据', effect: 'whirling' },
  });
  const initCharts = async () => {
    if (!chartBarRef.value || !echarts) return;
    await nextTick();
    if (props.option) {
      Object.assign(option, cloneDeep(props.option));
    }
    const data = Array.isArray(subData.value) ? subData.value : [];
    option.series[0].data = data.map((item) => {
      const { subStatus: name, ...rest } = item;
      return { name, ...rest };
    });

    setOptions(option);
    resize();
  };

  watch(
    () => subData.value,
    () => {
      initCharts();
    },
    { immediate: true, deep: true }
  );

  // 生命周期钩子
  onMounted(() => {
    setTimeout(() => {
      initCharts();
      window.addEventListener('resize', resize);
    }, 200);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', resize);
  });

  // 暴露组件方法（供父组件调用）
  defineExpose({
    initCharts,
    getInstance,
  });
</script>

<style lang="less" scoped>
  .chart-bar-container {
    transition: all 0.3s;
    background-color: #fafafa;
    border-radius: 4px;
    min-height: 300px !important;
  }
</style>
