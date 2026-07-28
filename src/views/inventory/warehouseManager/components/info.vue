<template>
  <Description @register="register" />
  <div class="status-box"> </div>
</template>
<script lang="ts" setup name="OrderInfo">
  import { ref, watch } from 'vue';
  import { Description, useDescription } from '/@/components/Description/index';
  import { schema } from '../data';
  let mockData: Recordable = {};
  const [register, { setDescProps }] = useDescription({
    bordered: false,
    data: mockData,
    schema,
  });
  const props = defineProps({
    detailData: Object,
  });
  watch(
    () => props.detailData,
    () => {
      console.log(props.detailData);
      setDescProps({ data: props.detailData });
    },
    { deep: true }
  );
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

  .status-box {
    position: absolute;
    top: -24px;
    right: 20px;
  }

  .event-status {
    font-size: 16px;
    font-weight: bold;
  }
</style>
