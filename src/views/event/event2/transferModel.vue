<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit"
              :width="700">
    <BasicForm @register="registerForm"/>
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref, computed, unref, reactive} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {transferSchema} from './event.data';
import {detail, saveOrUpdateEvent, transferCommit} from './eventOrder.api';
// 声明Emits
const emit = defineEmits(['success', 'register']);
const record = reactive({});
//表单配置
const [registerForm, {resetFields, setFieldsValue, validate}] = useForm({
  //labelWidth: 150,
  schemas: transferSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({confirmLoading: false});
  if (unref(record)) {
    //获取详情
    //data.record = await detail({id: data.record.id});
    //表单赋值
    await setFieldsValue({
      ...data.record,
      pics: formatImageUrls(data.record.pics)
    });
  }
});
function formatImageUrls(imageStr) {
  if (!imageStr) return [];

  return imageStr.split(',')
    .map(url => url.trim()) // 去除空格
    .filter(url => url) // 过滤空字符串
    .map(url => {
     return url;
    });
}
//设置标题
const getTitle = computed(() => '转事件工单');

//表单提交事件
async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({confirmLoading: true});
    //提交表单
    await transferCommit(values);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
