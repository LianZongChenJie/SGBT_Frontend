<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled"/>
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {formSchema} from './demo.data';
import {saveOrUpdateDemo, getDemoById} from './demo.api';
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
const [registerForm, {resetFields, setFieldsValue, validate,clearValidate}] = useForm({
  //labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
});

function normalizeIds(value) {
  if (!value && value !== 0) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(Number).filter((item) => !Number.isNaN(item));
  }
  return String(value)
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));
}
//表单赋值
const [registerModal, {setModalProps, closeModal,}] = useModalInner(async (data) => {
  console.log(data, '11111111');
  //重置表单
  await resetFields();
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  // await updateSchema([
  //   {
  //     //字段必填
  //     field: 'formName',
  //     componentProps: {
  //       disabled: isUpdate.value,
  //     },
  //   }
  // ])
  if (data.createBy) {
    await setFieldsValue({createBy: data.createBy})
  }
  if (data.createTime) {
    await setFieldsValue({createTime: data.createTime})
  }
  if (unref(isUpdate)) {

    //获取详情
    data.record = await getDemoById({id: data.record.id});

    //表单赋值
    await setFieldsValue({
      ...data.record,
      acceptorIds: normalizeIds(data.record.acceptorIds),
      scopeIds: normalizeIds(data.record.scopeIds),
    });
    clearValidate()
  }
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? '新增验收' : '编辑验收'));

//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    //提交表单
    await saveOrUpdateDemo(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
