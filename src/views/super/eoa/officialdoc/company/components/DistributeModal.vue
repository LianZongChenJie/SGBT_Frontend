<template>
  <BasicModal
    @register="registerModal"
    title="转发"
    destroyOnClose
    :width="500"
    :bodyStyle="{ minHeight: '100px', maxHeight: '100px' }"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <SelectDepart v-model:value="departIds" placeholder="请选择部门" />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, toRaw, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import SelectDepart from '/@/views/super/eoa/officialdoc/received/components/SelectDepart.vue';
  import { forward, updateStatus } from '/@/views/super/eoa/officialdoc/company/distribute.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { startProcess } from '/@/api/common/api';

  const emit = defineEmits(['register', 'success']);
  const confirmLoading = ref(false);
  //转发部门
  const departIds = ref('');
  //表单对象
  const model = ref<any>({});
  //转发类型
  const type = ref('');
  //流程编码
  const flowCode = 'dev_oa_officialdoc_received_001';
  //提示
  const { createMessage: $message } = useMessage();
  //表单赋值
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await resetField();
    type.value = data.type;
    model.value = data.type ? { ...data } : { ...data.record };
  });

  /**
   * 确认转发
   */
  function handleOk() {
    if (departIds.value) {
      //批量转发
      if (unref(type)) {
        updateStatus({
          ids: unref(model).ids,
          departId: unref(departIds),
        }).then(async (res) => {
          if (res.success) {
            if (res.result) {
              let result = res.result.split(',');
              console.log(result);
              for (let i = 0; i < result.length; i++) {
                await handleStartProcess(result[i]);
              }
              $message.success('转发成功！');
              emit('success');
              handleCancel();
            }
          } else {
            $message.warning('转发文失败！');
          }
        });
      } else {
        //单一转发
        let formData: any = toRaw(model.value);
        formData.departId = toRaw(departIds.value);
        forward(formData).then(async (res) => {
          if (res.success) {
            await handleStartProcess(res.result);
            $message.success('转发成功！');
            emit('success');
            handleCancel();
          } else {
            $message.warning(res.message);
          }
        });
      }
    }
  }

  /**
   * 发起流程
   * @param record
   */
  async function handleStartProcess(record) {
    let params = {
      flowCode: flowCode,
      id: record,
      formUrl: 'super/eoa/officialdoc/received/components/ReceivedForm',
      formUrlMobile: 'super/eoa/officialdoc/received/components/ReceivedForm',
    };
    await startProcess(params);
  }

  /**
   * 字段重置
   */
  function resetField() {
    model.value = {};
    type.value = '';
    departIds.value = '';
  }
  /**
   * 取消
   */
  function handleCancel() {
    closeModal();
    resetField();
  }
</script>
