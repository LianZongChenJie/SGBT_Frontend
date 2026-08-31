<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled"/>
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
import { getJump, getSkip } from './demo.api';
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
const formSchema: FormSchema[] = [
  // {
  //   field: 'id',
  //   label: 'id',
  //   component: 'Input',
  //   show: false,
  // },
  // {
  //   field: 'createBy',
  //   label: 'createBy',
  //   component: 'Input',
  //   show: false,
  // },
  // {
  //   field: 'createTime',
  //   label: 'createTime',
  //   component: 'Input',
  //   show: false,
  // },
  {
    field: 'skipReason',
    label: '跳过原因',
    component: 'InputTextArea',
    required: false,
    componentProps: {
      rows:3
    },
  },
];
//表单配置
const [registerForm, {resetFields, setFieldsValue, validate,updateSchema}] = useForm({
  //labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  await resetFields();

  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  // if (data.createBy) {
  //   await setFieldsValue({createBy: data.createBy})
  // }
  // if (data.createTime) {
  //   await setFieldsValue({createTime: data.createTime})
  // }
  if (unref(isUpdate)) {
    //获取详情
    //    = data.record.deviceIds
    obj.value  = data.record;
    // await setFieldsValue({
    //   ...obj,
    // });
    console.log(data.record,'cccccccccc');

  }
});
const obj = ref({})
//设置标题
const title = computed(() => (!unref(isUpdate) ? '跳过巡检' : '跳过巡检'));

//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    console.log(values,'bbbbbbbb');
    setModalProps({confirmLoading: true});
    let params = {
      deviceIds:obj.value.deviceIds,
      taskId:Number(obj.value.id),
      skipReason:values.skipReason
    }
    //提交表单
    await getSkip(params);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
