<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" :width="700"
    :z-index="10000">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup name="EventUserSelect">
import { ref, computed } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { userSelectSchema } from './event.data';
import { userSelectCommit } from './eventOrder.api';
import { useEventStoreWithOut } from '/@/store/modules/event';
import { storeToRefs } from 'pinia';
const useEventStor = useEventStoreWithOut();
// 声明Emits
const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
//表单配置
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  //labelWidth: 150,
  schemas: userSelectSchema,
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
    id: data.record.id
  });
});
//设置标题
const getTitle = computed(() => '分配人员');

//表单提交事件
async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    //提交表单
    await userSelectCommit(values);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
