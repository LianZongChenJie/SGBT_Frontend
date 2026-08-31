<template>
  <BasicModal v-bind="$attrs" :title="title" @register="registerModal" width="500px" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup name="eoa-mailbox-category">
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { categorySchema } from '../EoaMailBox.data';
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { addCategory } from '../EoaMailBox.api';
  import { useUserStore } from '/@/store/modules/user';

  const emit = defineEmits(['register', 'success']);
  const userStore = useUserStore();
  const title = ref<string>('新增标签');
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 90,
    schemas: categorySchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
  });

  /**
   * 表单提交
   */
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      values.userId = userStore.getUserInfo.id;
      await addCategory(values);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
