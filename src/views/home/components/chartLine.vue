<template>
  <div
    ref="chartLineRef"
    :style="{
      width: width || '100%',
      height: height || '100%',
      minHeight: '267px',
      minWidth: '300px',
    }"
    class="chart-bar-container"
  ></div>
</template>

<script lang="ts">
  import { defineComponent, PropType, ref, Ref, reactive, watchEffect, inject, onMounted, onUnmounted, nextTick } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { cloneDeep } from 'lodash-es';

  export default defineComponent({
    name: 'chartLine',
    props: {
      option: {
        type: Object,
        default: () => ({}),
      },
      width: {
        type: String as PropType<string>,
        default: '100%',
      },
      height: {
        type: String as PropType<string>,
        default: '40vh',
      },
      // seriesColor: {
      //   type: String,
      //   default: '#1890ff',
      // },
    },
    setup(props, { expose }) {
      const chartLineRef = ref<HTMLDivElement | null>(null);
      const { setOptions, echarts, resize, getInstance } = useECharts(chartLineRef as Ref<HTMLDivElement>);

      const injectValue = inject('CHARDATA', ref({ barData: [], xaxis: [] }));

      // 初始化 ECharts 配置（带兜底）
      const option = reactive({
        backgroundColor: '#fff',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: { show: true, backgroundColor: '#333' },
          },
        },
        legend: {
          data: [], // 核心：图例数据
          top: 'bottom', // 图例位置
          textStyle: { fontSize: 12 },
        },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [{ name: '', type: 'line', data: [], color: ['#8E6BEB', '#38ACF5', '#FA708B'] }],
        noDataLoadingOption: { text: '暂无数据', effect: 'whirling' }, // 无数据提示
      });
      const initCharts = async () => {
        if (!chartLineRef.value || !echarts) return;

        await nextTick();

        // 合并自定义配置
        if (props.option) {
          Object.assign(option, cloneDeep(props.option));
        }

        const xaxis = injectValue.value?.xaxis || [];
        // let seriesData = barData.map((item) => {
        //   return item.value;
        // });
        const barData = injectValue.value.lineData || {};
        let seriesData = Object.entries(barData).map(([name, data]) => ({
          name: name,
          type: 'line',
          stack: 'Total',
          data: data,
        }));
        option.series = seriesData;
        option.legend.data = Object.keys(barData);
        option.xAxis.data = Array.isArray(xaxis) ? xaxis : [];
        // option.series[0].color = props.seriesColor;
        chartLineRef.value.style.height = '100%';
        setOptions(option);
        resize();
      };
      watchEffect(() => {
        if (chartLineRef.value && injectValue.value) {
          initCharts();
        }
      });
      onMounted(() => {
        setTimeout(() => {
          initCharts();
          window.addEventListener('resize', resize);
        }, 100);
      });
      onUnmounted(() => {
        window.removeEventListener('resize', resize);
      });
      expose({ initCharts });

      return { chartLineRef };
    },
  });
</script>

<style lang="less" scoped>
  .chart-bar-container {
    transition: all 0.3s;
    background-color: #fafafa;
    border-radius: 4px;
    height: 100%;
    width: 100%;
    min-height: 200px;
  }
</style>
