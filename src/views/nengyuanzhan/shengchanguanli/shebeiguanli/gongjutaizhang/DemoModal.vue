<template>
  <BasicModal :title="title" v-bind="$attrs" width="70%" @ok="handleSubmit" @register="registerModal">
    <BasicForm :disabled="isDisabled" @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { formSchema } from './demo.data';
  import { buildToolPayload, getDemoById, getTreeList, saveOrUpdateDemo, TOOL_LEDGER_CATEGORY } from './demo.api';
  import { getTreeListSpace } from '@/views/nengyuanzhan/xitongshezhi/kongjianguanli/depart.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';

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

    const [toolTypeTree, spaceTree, employeeTree] = await Promise.all([getTreeList(), getTreeListSpace(), getTreeListRenyuan()]);

    updateSchema([
      {
        field: 'deviceTypeId',
        componentProps: {
          treeData: toolTypeTree,
        },
      },
      {
        field: 'official',
        componentProps: {
          treeData: employeeTree,
        },
      },
      {
        field: 'user',
        componentProps: {
          treeData: employeeTree,
        },
      },
      {
        field: 'spaceId',
        componentProps: {
          treeData: spaceTree,
        },
      },
    ]);

    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;

    if (!unref(isUpdate)) {
      await setFieldsValue({
        category: TOOL_LEDGER_CATEGORY,
        ...(data?.record || {}),
      });
      return;
    }

    if (data?.record?.id) {
      const detail = await getDemoById({ id: data.record.id });
      await setFieldsValue({
        category: TOOL_LEDGER_CATEGORY,
        ...detail,
      });
    }
  });

  const title = computed(() => (unref(isUpdate) ? '编辑工具台账' : '新增工具台账'));

  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildToolPayload(values);

      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload, isUpdate.value);
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
