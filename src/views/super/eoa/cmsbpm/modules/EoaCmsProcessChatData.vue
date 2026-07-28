<template>
  <a-card :bordered="false" :style="{ marginTop: '12px', height: '320px' }">
    <template #title>
      <span> <a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />流程数据分析</span>
    </template>
    <template #extra>
      <!-- <a @click="loadMore">更多</a> -->
    </template>
    <StackBar :chartData="chartDate" height="30vh" :size="size"></StackBar>
  </a-card>
</template>

<script lang="ts" setup name="eoa-cms-process-chart">
  import StackBar from '/@/components/chart/StackBar.vue';
  import { ref } from 'vue';
  import { getChartData } from '../cmsbpm.api';

  const chartDate = ref([]);

  const props = defineProps({
    isDesign: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: Object,
      default: () => {},
    },
  });
  loadChartData();

  function loadMore(path) {
    //this.$router.push({path: path, query: query})
  }

  function loadChartData() {
    getChartData().then((res) => {
      console.log('res:getChartData>>>', res);
      if (res.success) {
        let arr = [];
        res.result.forEach((obj) => {
          let { State } = obj;
          arr.push({ name: State, type: '流转中', value: obj['流转中'] });
          arr.push({ name: State, type: '已归档', value: obj['已归档'] });
        });
        chartDate.value = arr;
        console.log('chartDate', chartDate.value);
      }
    });
  }
</script>

<style scoped></style>
