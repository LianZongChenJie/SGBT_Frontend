<template>
  <BasicDrawer showFooter @register="register" v-bind="$attrs" title="基本设置" width="30%" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { panelFormSchema } from '../data';
  const emit = defineEmits(['success', 'register']);
  const [register, { setDrawerProps, closeDrawer }] = useDrawerInner((data) => {
    console.log(data, 'panelDrawer');
    resetFields();
    setFieldsValue({ ...data });
  });
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 90,
    schemas: panelFormSchema,
    showActionButtonGroup: false,
  });
  async function handleSubmit() {
    try {
      let values = await validate();
      setDrawerProps({ confirmLoading: true });
      //关闭弹窗
      closeDrawer();
      //刷新列表
      emit('success', values);
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
