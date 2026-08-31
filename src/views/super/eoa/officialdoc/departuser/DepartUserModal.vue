<template>
  <BasicModal v-bind="$attrs" @register="registerModal" width="500px" destroyOnClose :title="title" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { formSchema } from './depart.user.data';
  import { ref, unref } from 'vue';
  import { save, update } from './depart.user.api';

  const labelKey = ref('realname');
  const rowKey = ref('id');
  const emit = defineEmits(['register', 'success']);
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  const isUpdate = ref<boolean>(false);
  const title = ref<string>('');
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    isUpdate.value = !!data?.isUpdate;
    setModalProps({ confirmLoading: false });
    title.value = unref(isUpdate) ? '编辑分发人员' : '新增分发人员';
    //编辑的时候在赋值
    if (unref(isUpdate)) {
      //表单赋值
      await updateSchema({ field: 'userId', componentProps: { params: { departId: data.record.departId } } });
      await setFieldsValue({ ...data.record });
    } else {
      await setFieldsValue({});
    }
  });

  /**
   * 数据修改和新增
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
