<template>
  <div class="timeLineBox">
    <a-timeline style="padding: 10px 0">
      <a-timeline-item v-for="(t, index) in timeLineArr" :key="index" position="right" :class="{ 'timeout-red': t.isOutTime === true }">
        <div class="time">{{ t.operationTime }}</div>
        <div class="operation">{{ t.operationShowName }}</div>
        <div class="detail">执行人：{{ t.operatorName }}</div>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script lang="ts" setup name="OrderRecord">
  import { Timeline } from 'ant-design-vue';
  const ATimeline = Timeline;
  const ATimelineItem = Timeline.Item;
  import { watch, ref, onMounted } from 'vue';
  import { useEventStoreWithOut } from '/@/store/modules/event';
  import { storeToRefs } from 'pinia';
  const useEventStor = useEventStoreWithOut();
  const { changeFlag } = storeToRefs(useEventStor);
  let timeLineArr = ref<any>([]);
  // const props = defineProps({
  //   record: Object,
  // });
  const props = defineProps({
    record: {
      type: Array, // 父组件传的是数组，必须定义为Array
      default: () => [], // 默认空数组
      required: false,
    },
  });
  // 获取详情数据
  // const fetchDetail = async () => {
  //   try {
  //     if (props.record?.id) {
  //       const res = await getEventProcessList({ orderId: props.record.id });
  //       timeLineArr.value = res;
  //     }
  //   } catch (e) {
  //     console.error('加载记录失败:', e);
  //   }
  // };
  // 监听record变化（如果父组件可能更新record）
  // 监听record变化（如果父组件可能更新record）
  onMounted(() => {
    console.log('子组件挂载，接收数据:', props.record);
    timeLineArr.value = props.record;
  });

  watch(
    () => props.record,
    (newVal) => {
      timeLineArr.value = newVal;
    },
    { deep: true, immediate: true }
  );
</script>

<style scoped lang="less">
  .detail {
    color: rgba(0, 0, 0, 0.45);
    margin-top: 4px;
    font-size: 13px;
  }
  .timeLineBox {
    padding-left: 200px;
    .time {
      margin-left: -170px;
    }
    .operation {
      margin-top: -25px;
    }
  }
  .timeout-red {
    color: red;
    .detail {
      color: red;
    }
  }
</style>
