<template>
  <!--流程图弹窗-->
  <BasicModal v-bind="$attrs" :bodyStyle="bodyStyle" :width="900" destroyOnClose :footer="null" @register="registerModal" title="流程图">
    <BpmGraphic :instanceId="procInsId"></BpmGraphic>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import BpmGraphic from '/src/views/super/bpm/process/components/BpmGraphic.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getProcessInfo } from './bpm.api';

  // Emits声明
  const emit = defineEmits(['register']);
  // 提示声明
  const $message = useMessage();
  // 流程实例id
  const procInsId = ref('');
  //样式
  const bodyStyle = {
    'overflow-y': 'auto',
    'overflow-x': 'auto',
  };

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (params) => {
    //初始化数据
    await initData(params);
  });

  /**
   * 初始化流程数据
   * @param params
   */
  async function initData(params) {
    let res = await getProcessInfo(params);
    if (res.success) {
      procInsId.value = res.result.processInstanceId;
    } else {
      $message.warning(res.message);
    }
  }
</script>
