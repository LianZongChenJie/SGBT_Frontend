<template>
  <BasicModal v-bind="$attrs" :title="title" @register="registerModal" width="800px" destroyOnClose>
    <BasicForm @register="registerForm" style="padding-top: 20px" />
    <template #footer>
      <a-button class="send-margin-right" type="primary" preIcon="ant-design:send-outlined" @click="sendEmail(0)">发送 </a-button>
      <a-button class="send-margin-right" type="primary" preIcon="ant-design:send-outlined" @click="sendEmail(1)">发送继续 </a-button>
      <a-button preIcon="ant-design:save-outlined" @click="saveDraft">存为草稿</a-button>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup name="eoa-email-box-drafts-modal">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../EoaMailBox.data';
  import { addEmail, saveEmail } from '../EoaMailBox.api';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  // Emits声明
  const emit = defineEmits(['register', 'success', 'changeinbox']);
  const isUpdate = ref(true);
  const $message = useMessage();
  //注册表单
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //update-begin---author:wangshuai ---date:20220617  for：邮箱弹出高度统一修改--------------
    setModalProps({ height: 400 });
    //update-end---author:wangshuai ---date:20220617  for：邮箱弹出高度统一修改--------------
    //重置表单
    //0不用回执 1 回执
    //update-begin---author:wangshuai---date:2024-07-01---for:【TV360X-1484】邮件存草稿后，紧急和回执被勾选了---
    if (!data.receiptFlag || data.receiptFlag == '0') {
      data.receiptFlag = false;
    }else{
      data.receiptFlag = true;
    }

    //0 不紧急 1紧急
    if (!data.urgentFlag || data.urgentFlag == '0') {
      data.urgentFlag = false;
    }else{
      data.urgentFlag = true;
    }
    //update-end---author:wangshuai---date:2024-07-01---for:【TV360X-1484】邮件存草稿后，紧急和回执被勾选了---
    await resetFields();
    await setFieldsValue({ ...data });
  });
  const userStore = useUserStore();
  //设置标题
  const title = ref<string>('写邮件');

  /**
   * 发送邮件
   * @param type 0 发送 1发送继续
   */
  async function sendEmail(type) {
    const values = await getValue();
    //提交表单
    await addEmail(values).then((res) => {
      if (res.success) {
        $message.createMessage.success('发送成功');
        emit('changeinbox', type);
      }
    });
    //update-begin---author:wangshuai ---date:20220608  for：[VUEN-1240]草稿箱中，点击发送继续，表单直接关闭了------------
    if (type == 0) {
      closeModal();
    }
    await resetFields();
    //update-end---author:wangshuai ---date:20220608  for：[VUEN-1240]草稿箱中，点击发送继续，表单直接关闭了--------------
    //刷新列表
    emit('success');
  }

  /**
   * 获取表单的值
   */
  async function getValue() {
    let values = await validate();
    //是否需要回执 0 否 1 是
    if (values.receiptFlag) {
      values.receiptFlag = '1';
    } else {
      values.receiptFlag = '0';
    }
    //是否需要紧急 0 否 1 是
    if (values.urgentFlag) {
      values.urgentFlag = '1';
    } else {
      values.urgentFlag = '0';
    }
    values.senderId = userStore.getUserInfo.id;
    return values;
  }

  /**
   * 保存草稿
   */
  async function saveDraft() {
    const values = await getValue();
    //提交表单
    await saveEmail(values).then((res) => {
      if (res.success) {
        $message.createMessage.success('保存成功');
        emit('success')
        closeModal();
      }
    });
  }
</script>

<style lang="less" scoped>
  .send-margin-right {
    margin-right: 10px;
  }
</style>
