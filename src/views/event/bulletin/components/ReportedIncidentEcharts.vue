<template>
  <div class="event-analysis-echarts-box">
    <div class="title-box">报事时间分布分析</div>
    <div class="time-line-chart">
      <div class="chart-header">
        <div class="time-range-selector">
          <button v-for="range in timeRanges" :key="range.value" :class="{ active: activeRange === range.value }"
            @click="changeTimeRange(range.value)">
            {{ range.label }}
          </button>
        </div>
      </div>
      <div ref="reportedIncidentEcharts" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const reportedIncidentEcharts = ref(null)

let chartInstance = null;

const activeRange = ref('week');

// 时间范围选项
const timeRanges = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' }
];

// 模拟数据
const mockData = {
  week: {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    values: [33, 40, 30, 65, 80, 60, 30]
  },
  month: {
    dates: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
    values: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 50)
  },
  year: {
    dates: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    values: [820, 932, 901, 934, 1290, 1330, 1320, 1150, 980, 1100, 1250, 1400]
  }
};

// 初始化图表
const initChart = () => {
  if (!reportedIncidentEcharts.value) return;

  chartInstance = echarts.init(reportedIncidentEcharts.value);
  updateChart();
};

// 更新图表数据
const updateChart = () => {
  const currentData = mockData[activeRange.value];

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>数值: {c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: currentData.dates,
      axisLabel: {
        interval: activeRange.value === 'month' ? 2 : 0 // 月数据间隔显示
      },
      name: activeRange.value === 'year' ? '时间(月)' :
        activeRange.value === 'month' ? '时间(点)' : '时间(周)',
      nameLocation: 'middle',
      nameGap: 30, // 名称与轴线的距离
      nameTextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '数量(个)',
      nameLocation: 'end',
      nameGap: 20, // 名称与轴线的距离
      nameTextStyle: {
        fontSize: 12,
        color: '#666',
        align: 'right'
      },
      axisLabel: {
        formatter: '{value} 次' // 在Y轴刻度值后添加单位
      }
    },
    series: [
      {
        name: '数值',
        type: 'line',
        data: currentData.values,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#1890ff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.5)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
          ])
        },
        lineStyle: {
          width: 3
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

// 切换时间范围
const changeTimeRange = (range) => {
  activeRange.value = range;
  updateChart();
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
.event-analysis-echarts-box{
  position: relative;
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

    .time-line-chart {
      width: 100%;
      height: calc(100% - 30px);
      display: flex;
      flex-direction: column;
    }
  
    .chart-header {
      right: 10%;
      display: flex;
      position: absolute;
      justify-content: space-between;
      align-items: center;
      margin-top: 18px;
      z-index: 99;
    }
  
    .time-range-selector {
      display: flex;
      justify-content: flex-end;
      width: 90%;
      margin-left: 5%;
    }
  
    .time-range-selector button {
      width: 60px;
      border: 1px solid #d9d9d9;
      background: #fff;
      cursor: pointer;
      transition: all 0.3s;
    }
  
    .time-range-selector button:hover {
      color: #1890ff;
      border-color: #1890ff;
    }
  
    .time-range-selector button.active {
      color: #fff;
      background: #1890ff;
      border-color: #1890ff;
    }
  
    .chart-container {
      flex: 1;
    }
}
</style>