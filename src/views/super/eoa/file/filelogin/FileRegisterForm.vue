<template>
  <a-form class="p-4 enter-x" :model="formData" :rules="validatorRules" ref="formRef">
    <a-form-item name="mobile" class="enter-x">
      <a-input size="large" v-model:value="formData.mobile" :placeholder="t('sys.login.mobile')" class="input-background" />
    </a-form-item>
    <a-form-item name="sms" class="enter-x">
      <CountdownInput
        size="large"
        v-model:value="formData.sms"
        :placeholder="t('sys.login.smsCode')"
        :sendCodeApi="sendCodeApi"
        class="sms-code-background"
      />
    </a-form-item>
    <a-form-item class="enter-x">
      <a-button type="primary" size="large" block @click="handleLogin" :loading="loading">注册</a-button>
    </a-form-item>
    <a-form-item class="enter-x">
      <div class="exit-account">
        <span>已有账号</span>
        <span class="sign-now-login pointer" @click="accountLoginClick">立即登录</span>
      </div>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref, defineEmits, toRaw, onMounted } from 'vue';
  import { CountdownInput } from '/@/components/CountDown';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useFormValid, SmsEnum } from '/@/views/sys/login/useLogin';
  import { getCaptcha, register } from '/@/api/sys/user';
  import { Rule } from '/@/components/Form';
  const { t } = useI18n();
  const validatorRules: Record<string, Rule[]> = {
    mobile: [{ required: true, message: '请输入手机号' }],
    sms: [{ required: true, message: '请输入验证码' }],
  };
  const { createMessage } = useMessage();
  const formRef = ref();
  const loading = ref(false);
  const formData = reactive({
    mobile: '',
    sms: '',
  });
  const { validForm } = useFormValid(formRef);
  const emit = defineEmits(['success', 'account-login', 'forget-password', 'login-data']);

  /**
   * 登录
   */
  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const resultInfo = await register(
        toRaw({
          phone: data.mobile,
          smscode: data.sms,
        })
      );
      if (resultInfo.data.success) {
        createMessage.success(resultInfo.data.message || t('sys.api.registerMsg'));
        emit('login-data', { username: data.mobile, password: '123456' });
        initFrom();
      } else {
        createMessage.warn(resultInfo.data.message || t('sys.api.networkExceptionMsg'));
      }
    } catch (error) {
      createMessage.error(error.message || t('sys.api.networkExceptionMsg'));
    } finally {
      loading.value = false;
    }
  }
  //倒计时执行前的函数
  function sendCodeApi() {
    return getCaptcha({ mobile: formData.mobile, smsmode: SmsEnum.REGISTER });
  }

  /**
   * 初始化from
   */
  function initFrom() {
    Object.assign(formData, { mobile: '', sms: '' });
    formRef.value.clearValidate();
  }

  /**
   * 账户登录
   */
  function accountLoginClick() {
    emit('account-login');
  }

  defineExpose({
    initFrom,
  });
</script>
<style lang="less" scoped>
  .login-color {
    color: @primary-color;
    font-size: 14px;
  }
  .phone-code-login {
    float: right;
  }
  .pointer {
    cursor: pointer;
  }
  .exit-account {
    color: #999ca0;
    font-size: 14px;
    text-align: center;
  }
  .sign-now-login {
    color: #1890ff;
    margin-left: 6px;
  }
  /*begin input颜色样式*/
  .input-background {
    background-color: #f2f3f9 !important;
    border-color: #f2f3f9 !important;
    border-radius: 8px;
  }
  .input-background:focus,
  .input-background:active {
    border-color: #f2f3f9 !important;
    box-shadow: none !important;
  }
  .sms-code-background :deep(.ant-input) {
    background-color: #f2f3f9 !important;
    border-color: #f2f3f9 !important;
    border-radius: 8px;
    box-shadow: none !important;
  }
  /*end input颜色样式*/
</style>
