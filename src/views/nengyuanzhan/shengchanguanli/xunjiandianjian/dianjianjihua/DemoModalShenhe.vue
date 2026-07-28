<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { saveShenhe } from './demo.api';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const formSchema: FormSchema[] = [
    {
      field: 'id',
      label: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'createBy',
      label: 'createBy',
      component: 'Input',
      show: false,
    },
    {
      field: 'createTime',
      label: 'createTime',
      component: 'Input',
      show: false,
    },
    {
      field: 'auditResult',
      label: '审核结果',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '通过', value: 1 },
          { label: '驳回', value: 2 },
        ],
      },
    },
    {
      field: 'remark',
      label: '审核意见',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        rows: 3,
        style: { width: '100%' },
      },
    },
  ];

  const [registerForm, { resetFields, setFieldsValue, validate, clearValidate }] = useForm({
    labelWidth: 120,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      setFieldsValue({
        id: data.record.id,
        remark: '',
        auditResult: data.num ?? undefined,
      });
      clearValidate();
    }
  });

  const title = computed(() => (!unref(isUpdate) ? '审核' : '审核'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      const params = {
        auditResult: values.auditResult,
        id: Number(values.id),
        remark: values.remark,
      };
      await saveShenhe(params, () => {
        emit('success', values);
      });
      closeModal();
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
