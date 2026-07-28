<template>
  <a-timeline style="padding: 10px 0">
    <a-timeline-item v-for="(t, index) in timeLineArr" :key="index" :class="{ 'timeout-red': t.isOutTime === true }">
      <div>{{ t.operationShowName }}</div>
      <div class="detail">{{ t.operatorName }} {{ t.operationTime }} {{ t.remarks }}</div>
    </a-timeline-item>
  </a-timeline>
</template>

<script lang="ts" setup name="EventRecord">
  import { watch, ref } from 'vue';
  import { getEventProcessList } from '../eventOrder.api';
  import { useEventStoreWithOut } from '/@/store/modules/event';
  import { storeToRefs } from 'pinia';
  const useEventStor = useEventStoreWithOut();
  const { changeFlag } = storeToRefs(useEventStor);
  let timeLineArr = ref([{ operationShowName: '', operatorName: '', operationTime: '', remarks: '' }]);
  const props = defineProps({
    record: Object,
  });
  // 获取详情数据
  const fetchDetail = async () => {
    try {
      if (props.record?.id) {
        const res = await getEventProcessList({ orderId: props.record.id });
        timeLineArr.value = res;
      }
    } catch (e) {
      console.error('加载记录失败:', e);
    }
  };
  // 监听record变化（如果父组件可能更新record）
  watch(
    () => changeFlag,
    () => {
      fetchDetail();
    },
    { deep: true }
  );
  // 监听record变化（如果父组件可能更新record）
  watch(
    () => props.record,
    () => {
      fetchDetail();
    },
    { deep: true }
  );
</script>

<style scoped>
  .detail {
    color: rgba(0, 0, 0, 0.45);
    margin-top: 4px;
    font-size: 13px;
  }
  .timeout-red {
    color: red;
    .detail {
      color: red;
    }
  }
</style>
