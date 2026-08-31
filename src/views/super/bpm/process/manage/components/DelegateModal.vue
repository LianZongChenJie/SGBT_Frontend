<template>
  <!--委派弹窗-->
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :bodyStyle="{ minHeight: '100px', maxHeight: '100px' }"
    :title="title"
    @ok="handleSubmit"
    :width="700"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { delegateFormSchema } from './bpm.data';
  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  //组件接受传参
  const props = defineProps({
    title: { type: String, default: '请选择委托人', required: false },
  });

  //表单配置
  const [registerForm, { resetFields, validate }] = useForm({
    labelWidth: 90,
    schemas: delegateFormSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
  });

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style scoped>
/*update-begin---author:wangshuai ---date:20230703  for：【QQYUN-5685】3、租户角色下,查询居左显示*/
:deep(.ant-form-item-control-input-content){
  text-align: left;
}
/*update-end---author:wangshuai ---date:20230703  for：【QQYUN-5685】3、租户角色下,查询居左显示*/
</style>
