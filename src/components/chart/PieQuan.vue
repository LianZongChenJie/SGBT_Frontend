<!--<template>
  <div ref="chartRef" :style="{ height, width }"></div>
</template>
<script lang="ts">
import {defineComponent, PropType, ref, Ref, watchEffect, reactive, watch} from 'vue';
import {useECharts} from '/@/hooks/web/useECharts';
import {cloneDeep} from 'lodash-es';

export default defineComponent({
  name: 'Pie',
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
    middleName: {
      type: String,
      default: () => '',
    },
    num: {
      type: Number,
      default: () => 0,
    },
    size: {
      type: Object,
      default: () => {
      },
    },
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
      default: 'calc(100vh - 78px)',
    },
  },
  emits: ['click'],
  setup(props, {emit}) {
    const chartRef = ref<HTMLDivElement | null>(null);
    const {setOptions, getInstance, resize} = useECharts(chartRef as Ref<HTMLDivElement>);
    const total = ref(0)
    const option = reactive({
      tooltip: {
        formatter: '{b} ({c})',
      },
      graphic: [{
        type: 'text',
        left: 'center',
        top: '45%',
        z: 10,
        style: {
          text: [
            `{title|${props.middleName}}`,
            `{value|${total.value} 台}`
          ].join('\n'), // 数组join实现换行
          textAlign: 'center',
          rich: {
            title: {
              fontSize: 14,
              color: '#999',
              padding: [0, 0, 5, 0] // 下内边距，使两行间距合适
            },
            value: {
              fontSize: 20,
              color: '#333',
              fontWeight: 'bold'
            }
          }
        }
      }],
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '55%'],
          data: [],
          labelLine: {show: true},
          label: {
            show: true,
            formatter: '{b}: {c}',
            color: '#B1B9D3',
          },
        },
      ],
    });

    watchEffect(() => {
      props.chartData && initCharts();
    });
    /**
     * 监听拖拽大小变化
     */
    watch(
        () => props.size,
        () => {
          resize();
        },
        {
          immediate: true,
        }
    );

    function initCharts() {
      if (props.option) {
        Object.assign(option, cloneDeep(props.option));
      }
      option.series[0].data = props.chartData;
      total.value = props.num
      setOptions(option);
      resize();
      getInstance()?.off('click', onClick);
      getInstance()?.on('click', onClick);
    }

    function onClick(params) {
      emit('click', params);
    }

    return {chartRef,total};
  },
});
</script>-->
<template>
  <div ref="chart" :style="{ height,width }" class="chart"></div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount,watch, nextTick} from 'vue';
import * as echarts from 'echarts';
// import {echartColor} from "@/api/constant.js";

const chart = ref(null);
let chartInstance = null;

const props = defineProps({
  option: {
    type: Object,
    required: true,
    default: () => {
      return {
        grid: {
          left: "2%",
          right: "2%",
          top: "50px",
          bottom: "50px",
          containLabel: true
        },
        legend: {
          // data: ['本期', '同比', '环比',]
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: "对比分析",
            id: "101",
            type: "pie",
            radius: '70%',
            data: [
              {value: 1048, name: '排放口1'},
              {value: 735, name: '排放口2'},
              {value: 735, name: '排放口3'},
              {value: 735, name: '排放口4'},
              {value: 735, name: '排放口5'},
              {value: 735, name: '排放口43'},
              {value: 735, name: '排放口32'},
            ],
            itemStyle: {

              color: function (params) {
                var colorList = echartColor.value;
                return colorList[params.dataIndex];
              }

            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
        ]
      };
    }
  },
  width: {
    type: String,
    default: () => {
      return "100%"
    },
    required: false
  },
  height: {
    type: String,
    default: "200px",
    required: false
  },
});

const initChart = () => {
  if (chart.value) {
    chartInstance = echarts.init(chart.value);
    chartInstance.setOption(props.option);
  }
};

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', resizeChart);
    watch(() => props.option,()=>{
      updateChart()
    }, { deep: true });
  });

});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', resizeChart);
});

// 监听 props 的变化
const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption(props.option,true);
  }
};


</script>
<style lang="less" scoped>
.chart{
  width:100%;
}
</style>
