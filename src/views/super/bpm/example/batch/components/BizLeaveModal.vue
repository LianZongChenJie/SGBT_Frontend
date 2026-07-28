<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :bodyStyle="{height: '350px'}" :title="title" @ok="handleSubmit" :width="700">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { formSchema } from '../leave.data';
  import { saveOrUpdate } from '../leave.api';
  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(true);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, setProps }] = useForm({
    // labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false, showOkBtn: !!!data?.isDetail });
    // update-begin--author:liaozhiyang---date:20240625---for：【TV360X-1359】批量审批详情弹窗应该禁用
    setProps({ disabled: !!data?.isDetail });
    // update-end--author:liaozhiyang---date:20240625---for：【TV360X-1359】批量审批详情弹窗应该禁用
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdate(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
