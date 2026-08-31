<template>
  <BasicModal :title="title" v-bind="$attrs" width="40%" @ok="handleSubmit" @register="registerModal">
    <BasicForm :disabled="isDisabled" @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { buildPlanLeaderPayload, saveOrUpdateDemo } from './demo.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';

  const emit = defineEmits(['register', 'success']);

  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    const treeData = await getTreeListRenyuan();
    updateSchema([
      {
        field: 'leaderIds',
        componentProps: {
          treeData,
        },
      },
    ]);

    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });

    if (data?.record) {
      await setFieldsValue({
        ...data.record,
      });
    }
  });

  const title = computed(() => '设置值班领导');

  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildPlanLeaderPayload(values);
      if (payload.leaderIds.length !== payload.leaderCount) {
        message.warning('轮换顺序人数需和值班领导人数一致');
        return;
      }
      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload);
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
