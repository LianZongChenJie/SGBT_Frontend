<template>
  <Description @register="register1" />
</template>
<script lang="ts" setup name="OrderInfo">
  import { ref, watch } from 'vue';
  import { Description, useDescription } from '/@/components/Description/index';
  import { schema } from '../event.data';
  import { useEventStoreWithOut } from '/@/store/modules/event';
  import { storeToRefs } from 'pinia';
  const useEventStor = useEventStoreWithOut();
  const { changeFlag, eventOperationList } = storeToRefs(useEventStor);
  const [register1, { setDescProps }] = useDescription({
    bordered: false,
    data: {},
    schema,
  });
  const props = defineProps({
    record: Object,
  });

  // 获取详情数据
  // const fetchDetail = async () => {
  //   try {
  //     if (props.record?.id) {
  //       const res = await detail({ id: props.record.id });
  //       mockData = res;
  //       nowStatus.value = mockData.status;
  //       eventOperationList.value = mockData.eventOperationList;
  //       // 动态设置数据
  //       setDescProps({
  //         data: mockData,
  //       });
  //     }
  //   } catch (e) {
  //     console.error('加载详情失败:', e);
  //   }
  // };
  // 监听record变化（如果父组件可能更新record）
  // 监听record变化（如果父组件可能更新record）
  watch(
    () => props.record,
    () => {
      setDescProps({
        data: props.record,
      });
    },
    { deep: true, immediate: true }
  );
  defineExpose({
    eventOperationList,
  });
</script>
<style scoped lang="less">
  /* 关键样式 - 隐藏上传区域 */
  :deep(.hide-upload .ant-upload.ant-upload-select) {
    display: none !important;
  }

  /* 可选：调整图片列表样式 */
  :deep(.hide-upload .ant-upload-list) {
    margin: 0;
    border: none;
  }

  :deep(.ant-upload.ant-upload-select.ant-upload-select-picture-card.ant-upload-disabled) {
    display: none;
  }
</style>
