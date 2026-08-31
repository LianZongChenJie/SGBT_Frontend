<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="审批" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import BasicModal from '@/components/Modal/src/BasicModal.vue';
  import { useForm } from '@/components/Form';
  import BasicForm from '@/components/Form/src/BasicForm.vue';
  import { useModalInner } from '@/components/Modal';
  import { approveForm } from './data';
  import { approve } from './api';
  import { ref } from 'vue';
  const emit = defineEmits(['success', 'register']);
  const approveId = ref<string>('');
  /**
   * BasicForm绑定注册;
   */
  const [registerForm, { validate, resetFields }] = useForm({
    //注册表单列
    schemas: approveForm,
    showActionButtonGroup: false,
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false });
    approveId.value = data.id;
  });
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      console.log(approveId.value);
      await approve({
        id: approveId.value,
        ...values,
      });
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
