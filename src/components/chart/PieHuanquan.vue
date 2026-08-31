<template>
  <div ref="chartRef" :style="{ height, width }"></div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, Ref, watchEffect, reactive, watch } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { cloneDeep } from 'lodash-es';

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
        default: () => {},
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
    setup(props, { emit }) {
      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions, getInstance, resize } = useECharts(chartRef as Ref<HTMLDivElement>);
      const total = ref(0);
      const option = reactive({
        tooltip: {
          formatter: '{b} ({c})',
        },
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: '34%',
            z: 10,
            style: {
              text: [`{title|${props.middleName}}`, `{value|${total.value} }`, `{value|设备总数 }`].join('\n'), // 数组join实现换行
              textAlign: 'center',
              rich: {
                title: {
                  fontSize: 14,
                  color: '#525252',
                  padding: [0, 0, 0, 0], // 下内边距，使两行间距合适
                },
                value: {
                  fontSize: 20,
                  color: '#525252',
                  fontWeight: 'bold',
                },
              },
            },
          },
        ],
        series: [
          {
            color: ['#5685cf', '#87d590', '#4fcce4', '#ffd16e', '#ff7670'],
            type: 'pie',
            radius: ['50%', '75%'],
            center: ['50%', '45%'],
            data: [],
            labelLine: { show: true },
            label: {
              show: true,
              formatter: '{b}',
              // formatter: '{b}: {c}',
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
        total.value = props.num;
        setOptions(option);
        resize();
        getInstance()?.off('click', onClick);
        getInstance()?.on('click', onClick);
      }

      function onClick(params) {
        emit('click', params);
      }

      return { chartRef, total };
    },
  });
</script>
