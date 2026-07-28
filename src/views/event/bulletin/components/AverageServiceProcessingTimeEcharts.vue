<template>
  <div class="average-service-processing-time-echarts-box">
    <div class="title-box">
      服务平均处理时长分析
    </div>
    <div ref="averageServiceProcessingTimeEcharts" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const averageServiceProcessingTimeEcharts = ref(null);
let chartInstance:any = null;

// 生成模拟数据
const generateMockData = () => {
  const now = new Date();
  const labels = ['2025.1月', '2025.1月', '2025.1月', '2025.1月', '2025.1月', '2025.1月', '2025.1月'];
  const repairData:string[] = []; // 报事报修
  const securityData: string[] = []; // 安防事件
  const cleaningData: string[] = []; // 清洁
    // 一周数据
    for (let i = 0; i < 7; i++) {
      repairData.push((Math.random() * 180 + 60).toFixed(1));
      securityData.push((Math.random() * 90 + 30).toFixed(1));
      cleaningData.push((Math.random() * 150 + 50).toFixed(1));
    }
  return {
    labels,
    repairData,
    securityData,
    cleaningData
  };
};

// 初始化图表
const initChart = () => {
  if (!averageServiceProcessingTimeEcharts.value) return;

  chartInstance = echarts.init(averageServiceProcessingTimeEcharts.value);
  updateChart();
};

// 更新图表数据
const updateChart = () => {
  const { labels, repairData, securityData, cleaningData } = generateMockData();

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach(param => {
          result += `${param.seriesName}: ${param.data} 分钟<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['报事报修', '安防事件', '清洁'],
      right: 10,
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        interval: 0,
      },
      name: '时间',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '处理时长 (分钟)',
      nameLocation: 'end',
      nameGap: 20,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '报事报修',
        type: 'bar',
        barWidth: '25%',
        data: repairData,
        itemStyle: {
          color: '#56aef7',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      },
      {
        name: '安防事件',
        type: 'bar',
        barWidth: '25%',
        data: securityData,
        itemStyle: {
          color: '#49d3cc',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      },
      {
        name: '清洁',
        type: 'bar',
        barWidth: '25%',
        data: cleaningData,
        itemStyle: {
          color: '#117a88',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

// 响应式调整
const resizeChart = () => {
  chartInstance?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  chartInstance?.dispose();
  window.removeEventListener('resize', resizeChart);
});
</script>

<style lang="less" scoped>
.average-service-processing-time-echarts-box{
  position: relative;
  height: 100%;
  width: 100%;

  .title-box {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    height: 30px;
    width: 90%;
    font-weight: 600;
    font-size: 18px;
    line-height: 15px;
    margin-left: 5%;
    border-bottom: 1px solid rgb(194, 191, 191);
  }
  .chart-container{
    height: calc(100% - 30px);
  }
}
</style>