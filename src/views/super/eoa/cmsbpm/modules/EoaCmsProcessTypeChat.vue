<template>
  <a-card :bordered="false" :style="{ marginTop: '12px', height: '320px' }">
    <template #title>
      <span> <a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />流程类型统计</span>
    </template>
    <template #extra>
      <!-- <a @click="loadMore">更多</a> -->
    </template>
    <Pie :chartData="pieDate" height="20vh" :size="size"></Pie>
  </a-card>
</template>

<script lang="ts" setup name="eoa-cms-process-type">
  import Pie from '/@/components/chart/Pie.vue';
  import { ref } from 'vue';
  import { getPieData } from '../cmsbpm.api';

  const pieDate = ref([]);
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
    getPieData().then((res) => {
      if (res.success) {
        pieDate.value = res.result.map((obj) => {
          let { item, count } = obj;
          return { name: item, value: count };
        });
      }
    });
  }
</script>

<style scoped></style>
