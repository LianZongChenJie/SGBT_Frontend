<template>
  <a-modal
    v-model:open="open"
    :title="title"
    @ok="handleSubmit"
    width="600px"
  >
    <BasicForm
      @register="registerForm"
      :schemas="formSchemas"
      :showActionButtonGroup="false"
      :labelWidth="100"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { BasicForm, FormSchema, useForm } from '/@/components/Form';
import { message } from 'ant-design-vue';
import { addDeviceApi, editDeviceApi, getDeviceByIdApi } from '../Device.api';

const props = defineProps({
  reload: {
    type: Function,
    required: true,
  },
});

const open = ref(false);
const isUpdate = ref(false);
const recordId = ref('');

const title = computed(() => (isUpdate.value ? '编辑设备' : '新增设备'));

const formSchemas: FormSchema[] = [
  {
    field: 'deviceName',
    component: 'Input',
    label: '设备名称',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入设备名称',
    },
  },
  {
    field: 'deviceDesc',
    component: 'InputTextArea',
    label: '设备描述',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入设备描述',
      rows: 3,
    },
  },
  {
    field: 'remark',
    component: 'InputTextArea',
    label: '备注',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入备注',
      rows: 2,
    },
  },
];

const [registerForm, { validate, resetFields, setFieldsValue }] = useForm();

const showModal = async (record?) => {
  open.value = true;
  await nextTick();
  resetFields();
  isUpdate.value = !!record?.id;
  recordId.value = record?.id || '';
  if (isUpdate.value) {
    const res = await getDeviceByIdApi({ id: record.id });
    setFieldsValue(res);
  }
};

const handleSubmit = async () => {
  try {
    const values = await validate();
    if (isUpdate.value) {
      await editDeviceApi({ ...values, id: recordId.value });
      message.success('编辑成功');
    } else {
      await addDeviceApi(values);
      message.success('新增成功');
    }
    open.value = false;
    props.reload();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

defineExpose({
  showModal,
});
</script>
