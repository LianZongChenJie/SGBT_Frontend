<template>
  <div class="event-analysis-echarts-box">
    <div class="title-box">各个项目事件分析</div>
    <div ref="eventAnalysisEcharts" style="height: calc(100% - 30px); width: 100%;">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const eventAnalysisEcharts = ref(null)

const data = [
  { name: '特钢园区', value: 15 },
  { name: '服贸会项目部', value: 8 },
  { name: '三高炉项目部', value: 17 },
  { name: '制氧创新中心项目部', value: 6 },
  { name: '金安桥科幻广场项目部', value: 18 },
  { name: '体育大厦项目部', value: 10 },
  { name: '基础物业项目部', value: 15 }
];

onMounted(() => {
  const chart = echarts.init(eventAnalysisEcharts.value);

  const option = {
    title: [
      {
        subtext: '项目',
        left: 20,
        subtextStyle: {
          color: 'black',
          fontSize: '16px',
          lineHeight: 16,
          textAlign: 'center'
        }
      },
      {
        subtext: '进行中',
        right: 90,
        subtextStyle: {
          color: 'black',
          fontSize: '16px',
          lineHeight: 16,
          textAlign: 'center'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '170px', // 为左侧标签留出空间
      right: '10px',
      top: '50px',
      bottom: '50px'
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: {	show: false },
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        margin: 150, // 调整标签位置
        color: '#333',
        fontSize: 14,
        align: 'left', // 标签左对齐
        verticalAlign: 'middle'
      }
    },
    series: [{
      name: '数量',
      type: 'bar',
      data: data.map(item => item.value),
      itemStyle: {
        color: '#188df0',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      // label: {
      //   show: true,
      //   position: 'right',
      //   formatter: '{c}',
      //   color: '#188df0',
      //   fontWeight: 'bold'
      // }
    }]
  };

  chart.setOption(option);

  // 窗口大小变化时自适应
  window.addEventListener('resize', () => chart.resize());
});

</script>

<style lang="less" scoped>
.event-analysis-echarts-box{
  height: 100%;
  width: 100%;

  .title-box {
    height: 30px;
    width: 90%;
    font-weight: 600;
    font-size: 18px;
    line-height: 15px;
    margin-left: 5%;
    border-bottom: 1px solid rgb(194, 191, 191);
  }
}
</style>