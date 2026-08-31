<template>
  <BasicModal useWrapper v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled"> </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema, syncShiftDaySchemas } from './demo.data';
  import { buildGroupPayload, getDemoById, saveOrUpdateDemo } from './demo.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

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

  function buildShiftDayValues(itemList: Record<string, unknown>[] = []) {
    return itemList.reduce<Record<string, unknown>>((result, item) => {
      if (item.itemIndex != null) {
        result[`shiftDay${item.itemIndex}`] = item.itemId;
      }
      return result;
    }, {});
  }

  async function updateShiftSchemaOptions(sysOrgCode?: string | string[], cycleDays = 0) {
    await syncShiftDaySchemas(formActionTypeProxy, cycleDays, sysOrgCode);
  }

  const formActionTypeProxy = {
    updateSchema,
  };

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    const treeDataRen = await getTreeListRenyuan();
    updateSchema([
      {
        field: 'leader',
        componentProps: {
          treeData: treeDataRen,
        },
      },
    ]);

    await updateShiftSchemaOptions();
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      data.record = await getDemoById({ id: data.record.id });
      await setFieldsValue({
        ...data.record,
        ...buildShiftDayValues(data.record.itemList),
      });
      await updateShiftSchemaOptions(data.record.sysOrgCode, data.record.cycleDays);
    }
  });
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  async function handleSubmit() {
    try {
      const values = await validate();
      const shiftItemList = buildShiftItems(values);
      const submitData = buildGroupPayload({
        ...values,
        sysOrgCode: Array.isArray(values.sysOrgCode) ? values.sysOrgCode[0] : values.sysOrgCode,
        items: shiftItemList,
      });

      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(submitData, isUpdate.value);
      closeModal();
      emit('success', submitData);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function buildShiftItems(values: Record<string, any>) {
    const days = values.cycleDays || 0;
    const result = [];

    for (let i = 1; i <= days; i++) {
      const val = values[`shiftDay${i}`];
      if (val !== undefined && val !== null) {
        result.push({
          itemIndex: i,
          itemId: Number(val),
        });
      }
    }

    return result;
  }
</script>
