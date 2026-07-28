<template>
  <!-- 核心修复：容器添加基础样式，确保刷新后尺寸稳定 -->
  <div
    ref="chartBarRef"
    :style="{
      width: width || '100%',
      height: height || '100%',
      minHeight: '260px', // 刷新后兜底高度
      minWidth: '300px', // 刷新后兜底宽度
    }"
    class="chart-bar-container"
  ></div>
</template>

<script lang="ts">
  import { defineComponent, inject, nextTick, onMounted, onUnmounted, PropType, reactive, ref, Ref, watchEffect } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { cloneDeep } from 'lodash-es';

  export default defineComponent({
    name: 'chartBar',
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
      seriesColor: {
        type: String,
        default: '#1890ff',
      },
    },
    setup(props, { expose }) {
      const chartBarRef = ref<HTMLDivElement | null>(null);
      const { setOptions, echarts, resize, getInstance } = useECharts(chartBarRef as Ref<HTMLDivElement>);

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
          formatter: function (params) {
            const { name, value } = params[0];
            return `
            <div style="padding: 6px 10px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${name}</div> <!-- X轴横坐标值 -->
              <div>${value}</div>
            </div>
          `;
          },
        },
        xAxis: {
          type: 'category',
          data: [],
          // axisTick: { alignWithLabel: true }, // 刻度线与标签对齐
          // boundaryGap: [0.2, 0.2], // X轴两侧大幅留白
          // // // 可选：强制类目宽度均匀分配
          // barGap: '100px', // 最大化同系列间距
          // barCategoryGap: '100px', // 最大化类目间距
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'bar',
            type: 'bar',
            data: [],
            color: props.seriesColor,
            barWidth: 20,
            barGap: '50px',
            barCategoryGap: '80%',
            label: {
              show: true,
              position: 'top',
              distance: 5,
              fontSize: 12,
              formatter: (params: any) => (params.value > 0 ? params.value : ''),
            },
          },
        ],
        noDataLoadingOption: { text: '暂无数据', effect: 'whirling' }, // 无数据提示
      });
      const initCharts = async () => {
        if (!chartBarRef.value || !echarts) return;

        await nextTick();

        // 合并自定义配置
        if (props.option) {
          Object.assign(option, cloneDeep(props.option));
        }
        const barData = injectValue.value?.barData || [];
        const xaxis = injectValue.value?.xaxis || [];
        option.series[0].data = Array.isArray(barData) ? barData : [];
        option.xAxis.data = Array.isArray(xaxis) ? xaxis : [];
        option.series[0].color = props.seriesColor;
        chartBarRef.value.style.height = '100%';
        setOptions(option);
        resize();
      };
      watchEffect(() => {
        if (chartBarRef.value && injectValue.value) {
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

      return { chartBarRef };
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
