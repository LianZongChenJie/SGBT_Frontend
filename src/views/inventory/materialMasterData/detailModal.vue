<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" :width="700"
    :z-index="10000">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>

import BasicModal from "@/components/Modal/src/BasicModal.vue";
import { useForm } from "@/components/Form";
import BasicForm from "@/components/Form/src/BasicForm.vue";
import { useModalInner } from "@/components/Modal";
import { computed, ref } from "vue";
import { saveApi } from "@/views/inventory/materialMasterData/api";
import { formSchema } from './data';

const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
//表单配置
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  //labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;
  //表单赋值
  await setFieldsValue({
    ...data.record
  });
});
const getTitle = computed(() => isUpdate ? '编辑' : '新增');

async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    //提交表单
    await saveApi(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
