<template>
  <BasicModal v-bind="$attrs" :title="title" @register="registerModal" width="500px" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { distributeSchema } from './organcode.data';
  import { save, update } from './organcode.api';
  import { ref, unref } from 'vue';

  const emit = defineEmits(['register', 'success']);
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    // labelWidth: 150,
    schemas: distributeSchema,
    showActionButtonGroup: false,
  });
  const isUpdate = ref<boolean>(false);
  const title = ref<string>('');
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false, minHeight: 80 });
    isUpdate.value = !!data?.isUpdate;
    setModalProps({ confirmLoading: false });
    title.value = unref(isUpdate) ? '编辑' : '新增';
    //编辑的时候在赋值
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({ ...data.record });
    }
  });

  /**
   * 表单提交事件
   */
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      if (unref(isUpdate)) {
        await update(values);
      } else {
        await save(values);
      }
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', { isUpdate: unref(isUpdate), values: { ...values } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style scoped></style>
