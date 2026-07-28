<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="用户绑定" @ok="handleSubmit" :width="900" :height="300" :z-index="10000">
    <BasicForm @register="registerForm"> </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import BasicModal from '@/components/Modal/src/BasicModal.vue';
  import { useForm } from '@/components/Form';
  import BasicForm from '@/components/Form/src/BasicForm.vue';
  import { useModalInner } from '@/components/Modal';
  import { ref } from 'vue';
  import { saveRoles, getRoles } from '../renter.api';
  import { userFormSchema } from '../renter.data';
  const emit = defineEmits(['success', 'register']);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    //labelWidth: 150,
    schemas: userFormSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false });
    let res = await getRoles({ id: data.record.id });
    console.log(res, 'res');
    //表单赋值
    await setFieldsValue({
      ...data.record,
      ids: res,
    });
  });

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      values.ids = values.ids.split(',');
      //提交表单
      await saveRoles(values);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
<style scoped>
  .ant-input-number {
    width: 100%;
  }
</style>
