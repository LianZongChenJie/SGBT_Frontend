<template>
  <div>
    <BasicForm @register="registerForm" style="padding-top: 20px" />
    <div class="ant-col ant-col-md-24 ant-col-lg-19" style="text-align: right; margin: 0 auto 20px">
      <a-button class="send-margin-right" type="primary" preIcon="ant-design:send-outlined" @click="sendEmail(0)">发送 </a-button>
      <a-button class="send-margin-right" type="primary" preIcon="ant-design:send-outlined" @click="sendEmail(1)">发送继续 </a-button>
      <a-button preIcon="ant-design:save-outlined" @click="saveDraft">存为草稿</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, watch } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../EoaMailBox.data';
  import { addEmail, saveEmail } from '../EoaMailBox.api';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { PropType } from 'vue';

  // Emits声明
  const emit = defineEmits(['register', 'success', 'changeinbox']);
  const isUpdate = ref(true);
  const $message = useMessage();
  //表单配置
  //注册表单
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  const userStore = useUserStore();
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  const props = defineProps({
    replyRecord: { type: Object as PropType<any>, default: () => [] },
  });

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
        resetFields();
      }
    });
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
    //是否紧急 0 否 1 是
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
        emit('changeinbox', 1);
      }
    });
  }

  /**
   * 初始化邮箱，给表单设置值
   * @param replyRecord
   */
  async function loadData(replyRecord) {
    if (replyRecord && replyRecord.replyType) {
      const emailData = ref<any>({});
      let title = '';
      let oldTitle = replyRecord.title;
      //1 转发 2回复 3 再次发送
      if (replyRecord.replyType == '1') {
        title = '转发：' + oldTitle;
      } else if (replyRecord.replyType == '2') {
        if (oldTitle.startsWith('回复：')) {
          title = oldTitle;
        } else {
          title = '回复：' + oldTitle;
        }
        emailData.value.realname = replyRecord.senderId_dictText;
        emailData.value.receiverIds = replyRecord.senderId;
      } else if (replyRecord.replyType == '3') {
        //再次发送
        emailData.value.realname = replyRecord.receiverIds_dictText;
        emailData.value.receiverIds = replyRecord.receiverIds;
        title = oldTitle;
      }
      emailData.value.title = title;
      if (replyRecord.replyType == '3') {
        emailData.value.content = replyRecord.content;
      } else {
        if (!replyRecord.content) {
          replyRecord.content = '';
        }
        emailData.value.content = `<br/><br/>------------------ 原始邮件 ------------------<br>
          发件人:'${replyRecord.senderId_dictText}'</br><br>
          发送时间:'${replyRecord.sendTime}'</br><br>
          收件人:'${replyRecord.receiverIds_dictText}'</br><br>
          主题:' ${replyRecord.title}'</br>
          ${replyRecord.content}`;
      }
      setTimeout(() => {
        resetFields();
        setFieldsValue({ ...emailData.value });
      }, 0);
    }
  }

  watch(
    props.replyRecord,
    (replyRecord) => {
      //初始化数据
      loadData(replyRecord);
    },
    { deep: true, immediate: true }
  );

  defineExpose({
    loadData,
  });
</script>

<style lang="less" scoped>
  .send-margin-right {
    margin-right: 10px;
  }
</style>
