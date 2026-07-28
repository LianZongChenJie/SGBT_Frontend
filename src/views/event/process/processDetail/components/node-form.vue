<template>
  <BasicDrawer showFooter @register="register" v-bind="$attrs" :title="title" width="30%" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { nodeFormSchema } from '../data';
  const emit = defineEmits(['success', 'register']);
  const title = ref('');
  const nodeId = ref('');

  const [register, { setDrawerProps, closeDrawer }] = useDrawerInner((data) => {
    console.log(data);
    resetFields();
    setFieldsValue({ ...data.properties });
    nodeId.value = data?.id;
    title.value = data?.text.value;
  });
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: nodeFormSchema,
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
