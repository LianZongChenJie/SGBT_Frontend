<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchemaEdit } from './demo.data';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const editMode = ref<'single' | 'batch'>('batch');

  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 150,
    schemas: formSchemaEdit,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    editMode.value = data?.editMode === 'single' ? 'single' : 'batch';
    await setFieldsValue({ ...data?.record });
  });

  const title = computed(() => (editMode.value === 'single' ? '编辑播放时长' : '批量编辑'));

  async function handleSubmit() {
    try {
      const values = await validate();
      const playDuration = Number(values.playDuration);
      if (!Number.isInteger(playDuration) || playDuration < 1 || playDuration > 3600) {
        message.warning('播放时长请输入 1 至 3600 秒之间的整数');
        return;
      }
      setModalProps({ confirmLoading: true });
      closeModal();
      emit('success', { ...values, playDuration });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
