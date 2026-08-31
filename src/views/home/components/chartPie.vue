<template>
  <div
    ref="chartPieRef"
    :style="{
      width: width || '100%',
      height: height || '30vh',
      minHeight: '200px',
      minWidth: '300px',
    }"
    class="chart-bar-container"
  ></div>
  <chart-pie-child @register="registerModal"></chart-pie-child>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, inject, onMounted, onUnmounted, nextTick } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { cloneDeep } from 'lodash-es';
  import chartPieChild from './chartPieChild.vue';
  import { useModal } from '@/components/Modal';
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
    height: '30vh',
    seriesColor: '#1890ff',
  });
  const chartPieRef = ref<HTMLDivElement | null>(null);
  const { setOptions, echarts, resize, getInstance } = useECharts(chartPieRef as Ref<HTMLDivElement>);
  const injectValue = inject('PIEVALUE', ref([])) as Ref<any[]>;
  const [registerModal, { openModal }] = useModal();
  const option = reactive({
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      top: 'center',
      textStyle: { fontSize: 10 },
      itemWidth: 20,
      itemHeight: 10,
    },
    series: [
      {
        name: '工单状态',
        type: 'pie',
        center: ['40%', '50%'],
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
    if (!chartPieRef.value || !echarts) return;
    await nextTick();
    if (props.option) {
      Object.assign(option, cloneDeep(props.option));
    }
    const data = Array.isArray(injectValue.value) ? injectValue.value : [];
    option.series[0].data = data.map((item) => {
      const { status: name, ...rest } = item;
      return { name, ...rest };
    });
    chartPieRef.value.style.height = '100%';
    setOptions(option);
    resize();
    setTimeout(() => {
      bindChartClickEvent();
    }, 100);
  };
  const bindChartClickEvent = () => {
    const chartInstance = getInstance();
    if (!chartInstance) {
      console.warn('ECharts 实例未获取到');
      return;
    }

    // 先移除旧的点击事件，避免重复绑定
    chartInstance.off('click');

    // 重新绑定点击事件
    chartInstance.on('click', (params: any) => {
      openModal(true, {
        params,
      });
      console.log('饼图点击事件触发：', params);
    });
  };
  watch(
    () => injectValue.value,
    (newVal) => {
      initCharts();
    },
    { immediate: true, deep: true }
  );
  onMounted(() => {
    setTimeout(() => {
      initCharts();
      window.addEventListener('resize', resize);
    }, 200);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    const chartInstance = getInstance();
    if (chartInstance) {
      chartInstance.off('click'); // 移除点击事件
    }
  });
  defineExpose({
    initCharts,
    getInstance,
    registerModal,
  });
</script>

<style lang="less" scoped>
  .chart-bar-container {
    transition: all 0.3s;
    background-color: #fafafa;
    border-radius: 4px;
    //min-height: 200px !important;
  }
</style>
