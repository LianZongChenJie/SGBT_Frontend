<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" :width="700">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './event.data';
  import { detail, saveOrUpdateEvent } from './eventOrder.api';
  import { findAllCustomerUser, userSelf } from '@/views/event/event/eventOrder.api';
  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(true);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    //labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    localStorage.setItem('customerUser', JSON.stringify(await findAllCustomerUser()));
    const userSelfData = await userSelf();
    const userSelfOption = [];
    (userSelfOption as any[]).push(userSelfData);
    localStorage.setItem('userSelf', JSON.stringify(userSelfOption));
    await resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //获取详情
      data.record = await detail({ id: data.record.id });
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    } else {
      //表单赋值
      await setFieldsValue({
        contractPhone: JSON.parse(localStorage.getItem('userSelf') || '[]')[0].phone,
        contractPeople: JSON.parse(localStorage.getItem('userSelf') || '[]')[0].realname,
      });
    }
  });
  //设置标题
  const getTitle = computed(() => (!unref(isUpdate) ? '创建事件' : '编辑事件'));

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateEvent(values);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
