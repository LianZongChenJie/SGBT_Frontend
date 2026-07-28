<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled"/>
    <a-card style="background: #f5f4f8;font-size: 16px;" class="ml3 mr3">
      在同一台设备首次触发告警后，在 <a-input-number id="inputNumber" v-model:value="mergeRange" :min="1" :max="10000" placeholder="请输入"/>
      分钟内，在该设备触发的同类型告警消息，规整压缩至首条告警记录内。
    </a-card>
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
const mergeRange = ref(0)
//表单配置
const [registerForm, {resetFields, setFieldsValue, validate}] = useForm({
  labelWidth: 150,
  schemas: formSchema,
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
  if (unref(isUpdate)) {
    //获取详情
    data.record = await getDemoById({id: data.record.id});
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
    // 等后端给提供字段然后赋值
    mergeRange.value = data.record.mergeRange
  }
});
//设置标题
// const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
const title = computed(() => ('告警规则'));

//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    //提交表单
    let obj ={
      ...values,
      mergeRange:mergeRange.value // 等后端给提供字段然后赋值
    }
    await saveOrUpdateDemo(obj, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
