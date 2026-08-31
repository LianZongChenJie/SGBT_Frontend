<template>
  <div class="event-analysis-echarts-box">
    <div class="title-box">
      事件分布
      <div class="time-range-selector">
        <button v-for="range in timeRanges" :key="range.value" :class="{ active: activeRange === range.value }"
          @click="changeTimeRange(range.value)">
          {{ range.label }}
        </button>
      </div>
    </div>
    <div ref="eventDistributionEcharts" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const eventDistributionEcharts = ref(null);
let chartInstance = null;
const activeRange = ref('today'); // 默认显示今日数据

// 时间范围选项
const timeRanges = [
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'last7days', label: '近7天' }
];

// 生成模拟数据（包含待处理和转工单两种数据）
const generateMockData = (range) => {
  const now = new Date();
  let labels = ['N4-4转运站', '提升泵站', '原料仓', '除尘改造', '备件库', '主电室'];
  let pendingData = []; // 待处理数据
  let transferredData = []; // 转工单数据

  if (range === 'today' || range === 'yesterday') {
    // 24小时数据
    const isToday = range === 'today';
    const baseDate = isToday ? now : new Date(now.getTime() - 86400000);
    pendingData = [30, 60, 25, 75, 5, 10]
    transferredData = [15, 25, 15, 20, 15, 30]
  } else {
    // 近7天数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      pendingData = [30, 60, 25, 75, 5, 10]
      transferredData = [15, 25, 15, 20, 15, 30]
    }
  }
  return { labels, pendingData, transferredData };
};

// 初始化图表
const initChart = () => {
  if (!eventDistributionEcharts.value) return;

  chartInstance = echarts.init(eventDistributionEcharts.value);
  updateChart();
};

// 更新图表数据
const updateChart = () => {
  const { labels, pendingData, transferredData } = generateMockData(activeRange.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: params => {
        const pending = params[0].data;
        const transferred = params[1].data;
        const total = pending + transferred;
        return `${params[0].axisValue}<br/>
                待处理: ${pending} (${((pending / total) * 100).toFixed(1)}%)<br/>
                转工单: ${transferred} (${((transferred / total) * 100).toFixed(1)}%)<br/>
                <hr style='margin: 5px 0; border-top: 1px dashed #ccc;'/>
                总计: ${total}`;
      }
    },
    legend: {
      data: ['待处理', '转工单'],
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
        interval: activeRange.value === 'last7days' ? 0 : 3,
        rotate: activeRange.value === 'last7days' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '数量(个)',
      nameLocation: 'end',
      nameTextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: '待处理',
        type: 'bar',
        stack: 'total', // 堆叠组名称
        data: pendingData,
        itemStyle: {
          color: '#FF9D4D',
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
          position: 'inside',
          formatter: '{c}',
          color: '#fff'
        }
      },
      {
        name: '转工单',
        type: 'bar',
        stack: 'total', // 必须使用相同的堆叠组名称
        data: transferredData,
        itemStyle: {
          color: '#36A3F7',
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
          formatter: function (params) {
            const total = pendingData[params.dataIndex] + params.data;
            return `${((params.data / total) * 100).toFixed(1)}%`;
          }
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

  .time-bar-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.time-range-selector {
  gap: 8px;
}

.time-range-selector button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  font-size: 15px;
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
  height: calc(100% - 30px);
}
}
</style>