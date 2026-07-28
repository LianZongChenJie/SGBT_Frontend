<template>
  <div class="all-sources-ofevents-echarts-box">
    <div class="title-box">全部事件来源分布</div>
    <div ref="allSourcesOfEvents" style="height: calc(100% - 30px); width: 100%;">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const allSourcesOfEvents = ref(null);
let chartInstance = null;

const initChart = () => {
  if (!allSourcesOfEvents.value) return;

  chartInstance = echarts.init(allSourcesOfEvents.value);

  const seriesData = [
    {
      name: '项目',
      type: 'pie',
      radius: ['60%', '80%'], // 关键点：内外半径控制空心效果
      center: ['30%', '50%'],
      data: [
        {
          name: '项目1',
          value: 36
        },
        {
          name: '楼宇自控系统',
          value: 20
        },
        {
          name: '项目2',
          value: 16
        },
        {
          name: '电梯系统',
          value: 10
        },
        {
          name: '项目3',
          value: 9
        },
        {
          name: '照明系统',
          value: 9
        },
        {
          name: '其他',
          value: 9
        },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: false
      },
      label: {
        show: false,
        position: 'center'
      },
    }
  ]

  const option1 = {
    title: [
      {
        top: '40%',
        left: '26.5%',
        subtext: '全部\n549',
        subtextStyle: {
          color: 'black',
          fontSize: '16px',
          lineHeight: 16
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 60,
      bottom: 20,
      icon: 'circle',
      data: ['项目1', '楼宇自控系统', '项目2', '电梯系统', '项目3', '照明系统', '其他'],
      formatter: function (name) {
        let total = 0
        let target
        for (let i = 0; i < seriesData[0].data.length; i++) {
          total += seriesData[0].data[i].value
          if (seriesData[0].data[i].name === name) {
            target = seriesData[0].data[i].value
          }
        }
        var arr = [
          '{a|' + name + '}',
          '{b|' + '|' + '}',
          '{c|' + ((target / total) * 100).toFixed(0) + '%}'
        ]
        return arr.join('  ')
      },
      textStyle: {	// 添加
        rich: {
          a: {
            fontSize: 15,
            width: 100
          },
          b: {
            fontSize: 15,
            color: '#c1c1c1'
          },
          c: {
            fontSize: 15
          }
        }
      }
    },
    series: seriesData,
  }


  chartInstance.setOption(option1);
};

const resizeChart = () => {
  chartInstance?.resize();
};

const data = genData(7);

function genData(count: number) {
  // prettier-ignore
  const nameList = [
    '赵', '钱', '孙', '李', '周', '吴', '郑'];
  const legendData = [];
  const seriesData = [];
  for (var i = 0; i < count; i++) {
    var name =
      Math.random() > 0.65
        ? makeWord(4, 1) + '·' + makeWord(3, 0)
        : makeWord(2, 1);
    legendData.push(name);
    seriesData.push({
      name: name,
      value: Math.round(Math.random() * 100000)
    });
  }
  
  return {
    legendData: legendData,
    seriesData: seriesData
  };

  function makeWord(max: number, min: number) {
    const nameLen = Math.ceil(Math.random() * max + min);
    const name = [];
    for (var i = 0; i < nameLen; i++) {
      name.push(nameList[Math.round(Math.random() * nameList.length - 1)]);
    }
    return name.join('');
  }
}

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
.all-sources-ofevents-echarts-box {
  height: 100%;
  width: 100%;

  .title-box {
    height: 30px;
    width: 90%;
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    margin-left: 5%;
    border-bottom: 1px solid rgb(194, 191, 191);
  }
}
</style>