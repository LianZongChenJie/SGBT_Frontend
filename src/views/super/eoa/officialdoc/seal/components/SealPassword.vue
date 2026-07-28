<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="修改密码" @ok="handleSubmit" width="600px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { sealPassWordSchema } from '../seal.data';
  import { updateSealPassWord } from '../seal.api';
  // 声明Emits
  const emit = defineEmits(['register']);
  const $message = useMessage();
  const formRef = ref();
  //印章id
  const sealId = ref('');
  //表单配置
  const [registerForm, { resetFields, validate, clearValidate }] = useForm({
    schemas: sealPassWordSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    sealId.value = data.id;
  });

  /**
   * 表单提交事件
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      let params = Object.assign({}, values);
      params.id = sealId.value;
      updateSealPassWord(params).then((res) => {
        console.log('res:::', res);
        if (res.success) {
          $message.createMessage.success(res.message);
          //关闭弹窗
          closeModal();
        } else {
          $message.createMessage.warning(res.message);
        }
      });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
