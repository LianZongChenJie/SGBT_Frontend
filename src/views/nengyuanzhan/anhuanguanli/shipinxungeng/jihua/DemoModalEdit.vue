<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled"/>
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {formSchemaEdit} from './demo.data';
import { getDemoById } from './demo.api';
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
const [registerForm, {resetFields, setFieldsValue, validate}] = useForm({
  labelWidth: 150,
  schemas: formSchemaEdit,
  showActionButtonGroup: false,
});

//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  if (data.createBy) {
    await setFieldsValue({createBy: data.createBy})
  }
  if (data.createTime) {
    await setFieldsValue({createTime: data.createTime})
  }
  if (isUpdate.value) {
    //获取详情
    data.record = await getDemoById({id: data.record.id});
    //表单赋值
    if (data.record.inspectionYear) {
      data.record.inspectionYear = String(data.record.inspectionYear);
    }
    await setFieldsValue({
      ...data.record,
    });
  }
});

const title = '批量编辑';

//表单提交事件
async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({confirmLoading: true});
    closeModal();
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
