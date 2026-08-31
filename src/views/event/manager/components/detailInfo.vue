<template>
  <Description @register="register1" />
</template>
<script lang="ts" setup name="OrderInfo">
  import { ref, watch } from 'vue';
  import { Description, useDescription } from '/@/components/Description/index';
  import { schemaAA } from '../event.data';
  import { useEventStoreWithOut } from '/@/store/modules/event';
  import { storeToRefs } from 'pinia';

  import { getEventProcessList } from '../eventOrder.api';
  const useEventStor = useEventStoreWithOut();
  const { changeFlag, eventOperationList } = storeToRefs(useEventStor);
  const [register1, { setDescProps }] = useDescription({
    bordered: false,
    data: {},
    schema: schemaAA,
  });
  const props = defineProps({
    record: Object,
  });
  const mockData = ref({});
  // 获取详情数据
  const fetchDetail = async () => {
    try {
      if (props.record?.id) {
        mockData.value = {};
        const res = await getEventProcessList({ orderId: props.record.id });
        const data = res.find((item) => item?.operationCode?.includes('已终止'));
        if (data) {
          mockData.value = JSON.parse(data.eventOrderAttributeJsonInfo.content);
        }
        // 动态设置数据
        setDescProps({
          data: mockData.value,
        });
      }
    } catch (e) {
      console.error('加载详情失败:', e);
    }
  };
  // 监听record变化（如果父组件可能更新record）
  watch(
    () => props.record,
    () => {
      fetchDetail();
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
