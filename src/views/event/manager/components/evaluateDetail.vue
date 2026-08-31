<template>
  <Description @register="register1">
    <template #redio="{ value }">
      <div class="star-container">
        <!-- 循环渲染对应数量的星星 -->
        <img v-for="i in value" :key="i" :src="star" alt="星星" class="star-icon" />
      </div>
    </template>
  </Description>
</template>
<script lang="ts" setup name="evaluateDetail">
  import { ref, watch } from 'vue';
  import { Description, useDescription } from '/@/components/Description/index';
  import { schemaEvaluate } from '../event.data';
  import { useEventStoreWithOut } from '/@/store/modules/event';
  import { storeToRefs } from 'pinia';
  import star from '/@/assets/images/star.png';

  import { getEventProcessList } from '../eventOrder.api';
  const useEventStor = useEventStoreWithOut();
  const { changeFlag, eventOperationList } = storeToRefs(useEventStor);
  const [register1, { setDescProps }] = useDescription({
    bordered: false,
    data: {},
    schema: schemaEvaluate,
  });
  const props = defineProps({
    record: Object,
  });
  const mockData = ref({});
  // 获取详情数据
  const fetchDetail = async () => {
    try {
      if (props.record?.id) {
        const res = await getEventProcessList({ orderId: props.record.id });
        const data = res.find((item) => item.targetStatusName === props.record.status);
        // 新增：判断 data 是否存在，避免 JSON.parse 报错
        if (!data?.eventOrderAttributeJsonInfo?.content) {
          console.warn('无评价数据', props.record.id);
          mockData.value = {};
          setDescProps({ data: {} });
          return;
        }
        mockData.value = JSON.parse(data.eventOrderAttributeJsonInfo.content);
        const redioMap = {
          // Y: '非常满意',
          // Z: '满意',
          // N: '不满意',
          Y: 5,
          Z: 3,
          N: 1,
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
        };
        // 映射为数字（核心：确保value是数字，用于循环）
        mockData.value.redio = redioMap[mockData.value.redio] || 0;
        mockData.value['operatorName'] = data.operatorName;
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
  .star-container {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .star-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
</style>
