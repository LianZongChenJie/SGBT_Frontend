<template>
  <BasicModal v-bind="$attrs" :title="title" width="40%" @ok="handleSubmit" @register="registerModal">
    <BasicForm :disabled="isDisabled" @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { formSchema } from './demo.data';
  import { buildToolTypePayload, getDemoById, getTreeListGongju, saveOrUpdateDemo, TOOL_TYPE_CATEGORY } from './demo.api';

  const emit = defineEmits(['register', 'success']);

  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const isUpdate = ref(false);

  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();

    const updating = !!data?.isUpdate;
    const addingChild = !!data?.isChild;
    const treeData = await getTreeListGongju();

    isUpdate.value = updating;
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });

    updateSchema({
      field: 'parentId',
      componentProps: {
        treeData,
        allowClear: true,
        placeholder: '请选择上一级分类',
        treeDefaultExpandAll: true,
        disabled: !updating && addingChild,
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
      },
    });

    const record = {
      deviceTypeCategory: TOOL_TYPE_CATEGORY,
      ...(data?.record || {}),
    };

    if (updating && record.id) {
      const detail = await getDemoById({ id: record.id });
      await setFieldsValue({
        deviceTypeCategory: TOOL_TYPE_CATEGORY,
        ...detail,
      });
      return;
    }

    await setFieldsValue(record);
  });

  const title = computed(() => (unref(isUpdate) ? '编辑工具分类' : '新增工具分类'));

  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildToolTypePayload(values);

      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload, isUpdate.value);
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
