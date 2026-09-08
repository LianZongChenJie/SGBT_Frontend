<template>
  <BasicModal :title="title" v-bind="$attrs" width="70%" @ok="handleSubmit" @register="registerModal">
    <BasicForm class="device-ledger-form" :disabled="isDisabled" @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { saveOrUpdateDemo, getDemoById, getTreeList, buildDevicePayload } from './demo.api';
  import { getTreeListSpace } from '@/views/nengyuanzhan/xitongshezhi/kongjianguanli/depart.api';

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    labelWidth: 136,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();

    const treeData = await getTreeList();
    const treeDataSpace = await getTreeListSpace();
    updateSchema([
      {
        field: 'deviceTypeId',
        componentProps: {
          treeData,
        },
      },
      {
        field: 'spaceId',
        componentProps: {
          treeData: treeDataSpace,
        },
      },
    ]);
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (!unref(isUpdate)) {
      await setFieldsValue({
        category: '1',
        ...(data?.record || {}),
      });
    }
    if (unref(isUpdate) && data?.record?.id) {
      data.record = await getDemoById({ id: data.record.id });
      await setFieldsValue({
        ...data.record,
      });
    }
  });

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildDevicePayload(values);
      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload, isUpdate.value);
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  :deep(.device-ledger-form) {
    overflow-x: hidden;
  }

  :deep(.device-ledger-form .ant-form-item-label) {
    flex: 0 0 136px;
    width: 136px !important;
    max-width: 136px;
    text-align: left !important;
  }

  :deep(.device-ledger-form .ant-form-item-label > label) {
    justify-content: flex-start;
    width: 100%;
    white-space: nowrap;
  }
</style>
