<template>
  <BasicDrawer showFooter @register="register" v-bind="$attrs" title="操作" width="30%" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { edgeFormSchema } from '../data';

  const emit = defineEmits(['success', 'register']);
  const nodeId = ref('');
  const [register, { setDrawerProps, closeDrawer }] = useDrawerInner((data) => {
    resetFields();
    setFieldsValue({ ...data.properties });
    nodeId.value = data?.id;
  });
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: edgeFormSchema,
    showActionButtonGroup: false,
  });
  async function handleSubmit() {
    try {
      let values = await validate();
      values.id = nodeId.value;
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
