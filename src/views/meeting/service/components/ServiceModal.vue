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
import { addServiceApi, editServiceApi, getServiceByIdApi } from '../Service.api';

const props = defineProps({
  reload: {
    type: Function,
    required: true,
  },
});

const open = ref(false);
const isUpdate = ref(false);
const recordId = ref('');

const title = computed(() => (isUpdate.value ? '编辑服务' : '新增服务'));

const formSchemas: FormSchema[] = [
  {
    field: 'serviceName',
    component: 'Input',
    label: '服务名称',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入服务名称',
    },
  },
  {
    field: 'serviceDesc',
    component: 'InputTextArea',
    label: '服务描述',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入服务描述',
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
    const res = await getServiceByIdApi({ id: record.id });
    setFieldsValue(res);
  }
};

const handleSubmit = async () => {
  try {
    const values = await validate();
    if (isUpdate.value) {
      await editServiceApi({ ...values, id: recordId.value });
      message.success('编辑成功');
    } else {
      await addServiceApi(values);
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
