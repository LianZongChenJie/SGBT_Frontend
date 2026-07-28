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
import { addTerminalApi, editTerminalApi, getTerminalByIdApi } from '../Terminal.api';

const props = defineProps({
  reload: {
    type: Function,
    required: true,
  },
});

const open = ref(false);
const isUpdate = ref(false);
const recordId = ref('');

const title = computed(() => (isUpdate.value ? '编辑终端' : '新增终端'));

const formSchemas: FormSchema[] = [
  {
    field: 'terminalName',
    component: 'Input',
    label: '终端名称',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入终端名称',
    },
  },
  {
    field: 'terminalIp',
    component: 'Input',
    label: 'IP地址',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入IP地址',
    },
  },
  {
    field: 'macAddress',
    component: 'Input',
    label: 'MAC地址',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入MAC地址',
    },
  },
  {
    field: 'deviceStatus',
    component: 'Select',
    label: '设备状态',
    colProps: { span: 24 },
    defaultValue: '0',
    componentProps: {
      placeholder: '请选择设备状态',
      options: [
        { label: '离线', value: '0' },
        { label: '在线', value: '1' },
      ],
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
    const res = await getTerminalByIdApi({ id: record.id });
    setFieldsValue(res);
  }
};

const handleSubmit = async () => {
  try {
    const values = await validate();
    if (isUpdate.value) {
      await editTerminalApi({ ...values, id: recordId.value });
      message.success('编辑成功');
    } else {
      await addTerminalApi(values);
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
