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
  import { getDemoById, getTreeListShipinjiankongfenzu, saveOrUpdateDemo } from './demo.api';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(false);

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

    const treeData = await getTreeListShipinjiankongfenzu();
    updateSchema({
      field: 'parentId',
      show: false,
      required: false,
      componentProps: {
        disabled: true,
        treeData,
      },
    });

    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;

    const record = unref(data?.record) || {};
    const formValues = unref(isUpdate) ? await getDemoById({ id: record.id }) : record;

    await setFieldsValue({
      ...(data.createBy ? { createBy: data.createBy } : {}),
      ...(data.createTime ? { createTime: data.createTime } : {}),
      ...formValues,
    });
  });

  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(values, isUpdate.value);
      closeModal();
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
