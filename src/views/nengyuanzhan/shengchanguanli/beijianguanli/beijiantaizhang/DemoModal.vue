<template>
  <BasicModal :title="title" v-bind="$attrs" width="40%" @ok="handleSubmit" @register="registerModal">
    <BasicForm :disabled="isDisabled" @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { formSchema } from './demo.data';
  import { buildSparePartsPayload, getDemoById, getTreeList, saveOrUpdateDemo, SPARE_PARTS_CATEGORY } from './demo.api';

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

    const treeData = await getTreeList();
    updateSchema({
      field: 'deviceTypeId',
      componentProps: {
        treeData,
        allowClear: true,
        placeholder: '请选择备件类型',
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
      },
    });

    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;

    if (!unref(isUpdate)) {
      await setFieldsValue({
        category: SPARE_PARTS_CATEGORY,
        ...(data?.record || {}),
      });
      return;
    }

    if (data?.record?.id) {
      const detail = await getDemoById({ id: data.record.id });
      await setFieldsValue({
        category: SPARE_PARTS_CATEGORY,
        ...detail,
      });
    }
  });

  const title = computed(() => (unref(isUpdate) ? '编辑备件台账' : '新增备件台账'));

  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildSparePartsPayload(values);

      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload, isUpdate.value);
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
