<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { buildAppVersionPayload, getDemoById, saveOrUpdateDemo } from './demo.api';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      data.record = await getDemoById({ id: data.record.id });
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildAppVersionPayload(values);
      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload, isUpdate.value);
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
