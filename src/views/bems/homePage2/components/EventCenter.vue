<template>
  <div class="event-center">
    <div class="title">
      能源运行事件管理中心
      <div class="my-tabs-box">
        <MyTabs :handleSwitchDate="handleSwitchDate" />
      </div>
    </div>
    <div class="alarm-list">
      <a-tabs
        v-model:activeKey="activeKey"
        :centered="true"
        :tabBarGutter="100"
      >
        <a-tab-pane
          key="1"
          :tab="'未处理' + '(' + alarmNum.untreated.length + ')' "
        >
          <a-select
            v-model:value="alarmSort.untreatedSort"
            style="width: 240px"
            @change="handleChangeUntreatedSort"
          >
            <a-select-option value="报单事件从晚到早">报单事件从晚到早</a-select-option>
            <a-select-option value="报单级别从高到低">报单级别从高到低</a-select-option>
          </a-select>
          <div class="alarm-box">
            <MyAlarmList />
          </div>
        </a-tab-pane>
        <a-tab-pane
          key="2"
          :tab="'处理中' + '(' + alarmNum.processing.length + ')' "
          force-render
        >
          <a-select
            v-model:value="alarmSort.untreatedSort"
            style="width: 240px"
            @change="handleChangeUntreatedSort"
          >
            <a-select-option value="报单事件从晚到早">报单事件从晚到早</a-select-option>
            <a-select-option value="报单级别从高到低">报单级别从高到低</a-select-option>
          </a-select>
          <div class="alarm-box">
            <MyAlarmList />
          </div>
        </a-tab-pane>
        <a-tab-pane
          key="3"
          :tab="'已处理' + '(' + alarmNum.processed.length + ')' "
        >
          <a-select
            v-model:value="alarmSort.untreatedSort"
            style="width: 240px"
            @change="handleChangeUntreatedSort"
          >
            <a-select-option value="报单事件从晚到早">报单事件从晚到早</a-select-option>
            <a-select-option value="报单级别从高到低">报单级别从高到低</a-select-option>
          </a-select>
          <div class="alarm-box">
            <MyAlarmList />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="task-completion-chart-box">
      <div class="task-completion-title">
        <div class="icon-box"></div>
        <div>任务完成排行榜</div>
      </div>
      <div id="taskCompletionChart" ref="taskCompletionChart"> 

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

import MyTabs from './MyTabs.vue';
import MyAlarmList from './MyAlarmList.vue';

// tabs切换
const activeKey = ref('1');

// 警告数量
const alarmNum = ref({
  untreated: [
    {
      info: '空调KT-32设定温度过高',
      position: '歌剧院F4办公楼',
      reportTime: '2022-05-02 14:00:00',
      finishTime: '2022-05-05 14:00:00',
      repairPerson: '张三',
      status: '未处理',
    },
    {
      info: '空调机组KT-28堵塞告警',
      position: '歌剧院F4办公楼',
      reportTime: '2022-05-02 14:00:00',
      finishTime: '2022-05-05 14:00:00',
      repairPerson: '张三',
      status: '未处理',
    },
  ],
  processing: [],
  processed: [],
});

// 排序方式
const alarmSort = ref({
  untreatedSort: '报单事件从晚到早',
  processingSort: '',
  processedSort: '',
});

// 排行榜数据
const data = ref([
      { name: '张三', totalTasks: 20, completedTasks: 18 },
      { name: '李四', totalTasks: 18, completedTasks: 15 },
      { name: '王五', totalTasks: 15, completedTasks: 12 },
      { name: '赵六', totalTasks: 12, completedTasks: 10 },
      { name: '钱七', totalTasks: 10, completedTasks: 8 },
      { name: '孙八', totalTasks: 8, completedTasks: 6 },
      { name: '周九', totalTasks: 6, completedTasks: 5 },
      { name: '吴十', totalTasks: 5, completedTasks: 3 }
    ])

    const taskCompletionChart = ref(null);
let chartInstance:any = null;


// 切换时间
const handleSwitchDate = (type) => {
  console.log('handleSwitchDate----------------->', type);
};

// 切换未处理事件的排序
const handleChangeUntreatedSort = (value) => {
  console.log('handleChangeUntreatedSort----------------->', value);
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

const initChart = () => {
  if (!taskCompletionChart.value) return;
  
  chartInstance = echarts.init(taskCompletionChart.value);
  updateChart();
};

const updateChart = () => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: params => {
        const totalData = params[0].data;
        const completedData = params[1].data;
        return `
          ${params[0].axisValue}<br/>
          总任务数: ${totalData}<br/>
          已完成: ${completedData}<br/>
          完成率: ${((completedData / totalData) * 100).toFixed(1)}%
        `;
      }
    },
    legend: {
      data: ['总任务数', '已完成'],
      bottom: 0,
      itemWidth: 20,
      itemHeight: 12
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '8%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '任务数量',
      axisLine: {
        show: true
      },
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: data.value.map(item => item.name),
      axisLine: {
        show: true
      },
      axisLabel: {
        interval: 0,
        width: 100,
        overflow: 'truncate',
        fontSize: 12
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: '总任务数',
        type: 'bar',
        barWidth: '30%',
        barGap: '10%',
        emphasis: {
          focus: 'series'
        },
        data: data.value.map(item => item.totalTasks),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#5B8FF9' },
            { offset: 1, color: '#3D76DD' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          color: '#333'
        }
      },
      {
        name: '已完成',
        type: 'bar',
        barWidth: '30%',
        emphasis: {
          focus: 'series'
        },
        data: data.value.map(item => item.completedTasks),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#5AD8A6' },
            { offset: 1, color: '#36CAB1' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: params => {
            const dataIndex = params.dataIndex;
            const percentage = (data.value[dataIndex].completedTasks / data.value[dataIndex].totalTasks * 100).toFixed(1);
            return `${params.data}`;
          },
          color: '#333'
        }
      }
    ]
  };

  chartInstance.setOption(option);
};
</script>

<style lang="less" scoped>
.event-center {
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  padding: 6px 12px;
  .title {
    height: 30px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .my-tabs-box {
      height: 90%;
      width: 30%;
    }
  }

  .alarm-list {
    padding: 0 24px;

    .alarm-box {
      margin-top: 10px;
      height: 260px;
    }
  }

  .task-completion-chart-box{
    padding: 12px 6px;
    height: calc(100% - 390px);
    width: 100%;
    .task-completion-title {
      height: 40px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 0 16px;
      .icon-box{
        height: 26px;
        border: 2px solid #5990d8;
        margin-right: 6px;
      }
    }
    #taskCompletionChart{
      height: calc(100% - 40px);
      width: 100%;
    }
  }

  
}
</style>