<template>
  <div
    ref="chartRef"
    :style="{
      width: width || '100%',
      height: height || '100%',
      minHeight: '100px',
      background: '#fff',
      borderRadius: '8px',
    }"
    class="satisfaction-chart"
  ></div>
  <div class="star">
    <span class="star-tit">整体满意度</span>
    <span class="star-num">{{ overall }}%</span>
  </div>
</template>

<script lang="ts">
  import { defineComponent, watch, ref, inject, Ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { cloneDeep } from 'lodash-es';
  import starImg from '/@/assets/images/star.png';

  export default defineComponent({
    name: 'SatisfactionChart',
    props: {
      option: { type: Object, default: () => ({}) },
      width: { type: String, default: '100%' },
      height: { type: String, default: '158px' },
      data: {
        type: Array,
        default: () => [],
      },
      starImageUrl: { type: String, default: starImg },
    },
    setup(props, { expose }) {
      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions, echarts, resize, getInstance } = useECharts(chartRef as Ref<HTMLDivElement>);
      const yAxisData = ['1星', '2星', '3星', '4星', '5星'];
      const injectValue = inject('STARVALUE', ref({ stars: [], overall: '' }));
      const overall = ref('');
      const realStarData = ref<any[]>([]);
      const getChartConfig = () => {
        // 1. 数据倒序
        const sortedStarData = [...realStarData.value].sort((a, b) => b.percent - a.percent);
        const percentLabels = sortedStarData.map((item, index) => {
          // 直接写死每个标签的Y坐标（根据你的截图微调，单位px）
          const dynamicLeft = document.body.clientWidth < 1200 ? '78%' : '88%';
          const yPositions = [8, 37, 64, 92, 120]; // 5个星级的Y坐标，从上到下
          return {
            type: 'text',
            left: dynamicLeft, // 水平固定在灰色背景条右侧
            top: `${yPositions[index]}px`, // 写死垂直坐标
            style: {
              text: `${item.percent}%`,
              fontSize: 14,
              fill: '#333',
              textAlign: 'left',
              textVerticalAlign: 'middle',
            },
          };
        });
        return {
          tooltip: { trigger: 'item', formatter: '{b}：{c}%' },
          grid: {
            left: '120px',
            right: '80px',
            top: '0px',
            bottom: '0px',
            containLabel: true,
          },
          graphic: percentLabels,
          yAxis: {
            type: 'category',
            data: yAxisData,
            show: false,
            inverse: false, // 保持正序，1星在上，5星在下
            axisLabel: { margin: 0 },
            itemGap: 0,
          },
          xAxis: { type: 'value', max: 100, show: false },
          series: [
            // 系列1：背景条
            {
              name: '背景条',
              type: 'bar',
              barWidth: '30%',
              barCategoryGap: '0px',
              barGap: 0,
              itemStyle: { color: '#f0f0f0', borderRadius: [0, 20, 20, 0], padding: 0 },
              data: [100, 100, 100, 100, 100],
              label: { show: false },
            },
            // 系列2：星星标签
            {
              name: '星星标签',
              type: 'bar',
              barWidth: '30%',
              barCategoryGap: '0px',
              barGap: '-100%',
              itemStyle: { color: 'transparent' },
              data: [0, 0, 0, 0, 0],
              label: {
                show: true,
                position: 'left',
                distance: 5,
                rich: {
                  star: {
                    backgroundColor: { image: props.starImageUrl, width: 25, height: 25 },
                    width: 25,
                    height: 25,
                  },
                },
                formatter: (params: any) => {
                  const starsCount = Number(params.name.replace('星', ''));
                  return Array(starsCount).fill('{star|}').join('');
                },
              },
            },
            // 系列3：蓝色进度条 + 百分比
            {
              name: '实际占比',
              type: 'bar',
              barWidth: '30%',
              barGap: '-100%',
              barCategoryGap: '0px',
              itemStyle: { color: '#4096ff', borderRadius: [0, 20, 20, 0], padding: 0 },
              label: {
                show: false,
                position: 'right',
                distance: -10,
                formatter: (params: any) => {
                  const starsCount = Number(params.name.replace('星', ''));
                  const percent = realStarData.value.find((item) => item.stars === starsCount)?.percent || 0;
                  return `{space|}{percent|${percent}%}`; // 引用space和percent富文本
                },
                rich: {
                  space: {
                    width: 0,
                    color: 'transparent',
                  },
                  percent: {
                    fontSize: 12,
                    // color: '#333',
                    align: 'left',
                  },
                },
              },
              data: [
                realStarData.value.find((item) => item.stars === 1)?.percent || 0, // 1星 → 0.2%
                realStarData.value.find((item) => item.stars === 2)?.percent || 0, // 2星 → 0.8%
                realStarData.value.find((item) => item.stars === 3)?.percent || 0, // 3星 → 1.5%
                realStarData.value.find((item) => item.stars === 4)?.percent || 0, // 4星 → 6.5%
                realStarData.value.find((item) => item.stars === 5)?.percent || 0, // 5星 → 91%
              ],
            },
          ],
        };
      };
      watch(
        () => injectValue.value,
        (newVal) => {
          if (newVal) {
            overall.value = newVal.overall || '';
            if (Array.isArray(newVal.stars) && newVal.stars.length > 0) {
              realStarData.value = newVal.stars.map((item) => ({
                stars: item.star, // 星级（1-5）
                percent: Number(item.percent), // 百分比（转为数字）
                color: '#4096ff', // 保持颜色一致
              }));
              // 重新渲染图表
              initCharts();
            }
          }
        },
        { immediate: true, deep: true }
      );
      const initCharts = async () => {
        if (!chartRef.value || !echarts) return;
        await nextTick();
        const chartInstance = getInstance();
        if (chartInstance) {
          chartInstance.clear();
        }
        const chartOption = getChartConfig();
        if (props.option) Object.assign(chartOption, cloneDeep(props.option));
        setOptions(chartOption);
        resize();
      };

      onMounted(() => {
        setTimeout(initCharts, 100);
        window.addEventListener('resize', resize);
      });

      onUnmounted(() => {
        window.removeEventListener('resize', resize);
      });

      expose({ initCharts });
      return { chartRef, overall };
    },
  });
</script>

<style lang="less" scoped>
  .satisfaction-chart {
    transition: all 0.3s;
    box-sizing: border-box;
    overflow: hidden;
    margin-top: 8px;
    min-width: 300px;
  }
  .star {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .star-tit {
    font-size: 16px;
    font-weight: bold;
  }
  .star-num {
    font-size: 28px;
    margin-left: 10px;
    color: red;
  }
</style>
