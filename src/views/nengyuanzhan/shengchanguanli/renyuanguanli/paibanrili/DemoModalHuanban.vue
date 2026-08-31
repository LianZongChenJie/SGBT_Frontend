<template>
  <BasicModal :title="title" v-bind="$attrs" width="40%" @ok="handleSubmit" @register="registerModal">
    <BasicForm :disabled="isDisabled" @register="registerForm">
      <template #shiftDate="{ model, field }">
        <a-date-picker
          v-model:value="model[field]"
          placeholder="请选择换班日期"
          value-format="YYYY-MM-DD"
          @change="onShiftDateChange(model, field)"
        />
      </template>

      <template #changeUserName="{ model, field }">
        <a-input disabled v-model:value="model[field]" placeholder="换班人" />
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchemaHuanban } from './demo.data';
  import { buildChangeLeaderPayload, getPaibanList, saveOrUpdateDemo1 } from './demo.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';

  const emit = defineEmits(['register', 'success']);

  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchemaHuanban,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async () => {
    await resetFields();
    const treeData = await getTreeListRenyuan();

    updateSchema({
      field: 'newLeaderId',
      componentProps: {
        treeData,
      },
    });

    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
  });

  const title = computed(() => '换班');

  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildChangeLeaderPayload(values);
      if (!payload.id) {
        message.warning('当前换班日期没有可换班的值班领导');
        return;
      }
      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo1(payload);
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  async function handleShiftDateChange(shiftDate: string) {
    await setFieldsValue({
      id: undefined,
      changeUserName: '',
      newLeaderId: undefined,
    });

    const res = await getPaibanList({
      day: shiftDate,
    });

    const leader = Array.isArray(res) ? res[0] : undefined;
    if (!leader) {
      message.warning('当前换班日期没有可换班的值班领导');
      return;
    }

    await setFieldsValue({
      id: leader.id,
      changeUserName: leader.employeeName,
    });
  }

  async function onShiftDateChange(model: Record<string, unknown>, field: string) {
    const val = model[field];
    if (!val) {
      return;
    }
    await handleShiftDateChange(String(val));
  }
</script>
