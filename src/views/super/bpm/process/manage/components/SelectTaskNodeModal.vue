<!--选择跳转节点弹窗-->
<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :bodyStyle="{ minHeight: '100px', maxHeight: '100px' }"
    title="选择跳转节点"
    @ok="handleSubmit"
    :width="700"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { skipNode } from './bpm.api';
  import { taskNodeFormSchema } from './bpm.data';
  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 150,
    schemas: taskNodeFormSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false });
    await setFieldsValue({
      ...data,
    });
  });

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //提交跳转
      await skipNode(values);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
