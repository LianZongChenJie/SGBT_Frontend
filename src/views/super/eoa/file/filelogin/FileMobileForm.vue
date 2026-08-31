<template>
  <Form class="p-4 enter-x" :model="formData" :rules="validatorRules" ref="formRef">
    <FormItem name="mobile" class="enter-x">
      <Input size="large" v-model:value="formData.mobile" :placeholder="t('sys.login.mobile')" class="fix-auto-fill input-background" />
    </FormItem>
    <FormItem name="sms" class="enter-x">
      <CountdownInput
        size="large"
        class="fix-auto-fill sms-code-background"
        v-model:value="formData.sms"
        :placeholder="t('sys.login.smsCode')"
        :sendCodeApi="sendCodeApi"
      />
    </FormItem>
    <FormItem class="enter-x">
      <div style="justify-content: space-between; margin-bottom: 12px">
        <span class="login-color forget-pwd pointer" @click="forgetPwdClick"> 忘记密码 </span>
        <span class="login-color phone-code-login pointer" @click="accountLoginClick">账号登录</span>
      </div>
    </FormItem>
    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
    </FormItem>
    <FormItem class="enter-x">
      <div class="register">
        <span>还没有账号?</span>
        <span class="goto-register pointer" @click="registerClick">前往注册</span>
      </div>
    </FormItem>
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed, unref, toRaw, defineEmits, onMounted } from 'vue';
  import { Form, Input, Button } from 'ant-design-vue';
  import { CountdownInput } from '/@/components/CountDown';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum, SmsEnum } from '/@/views/sys/login/useLogin';
  import { useUserStore } from '/@/store/modules/user';
  import { getCaptcha, phoneLoginApi } from '/@/api/sys/user';
  import { Rule } from '/@/components/Form';
  const FormItem = Form.Item;
  const { t } = useI18n();
  const { handleBackLogin, getLoginState } = useLoginState();
  const validatorRules: Record<string, Rule[]> = {
    mobile: [{ required: true, message: '请输入手机号' }],
    sms: [{ required: true, message: '请输入验证码' }],
  };
  const { notification, createErrorModal } = useMessage();
  const userStore = useUserStore();
  const formRef = ref();
  const loading = ref(false);
  const formData = reactive({
    mobile: '',
    sms: '',
  });
  const { validForm } = useFormValid(formRef);
  const emit = defineEmits(['success', 'account-login', 'forget-password', 'register-account']);

  /**
   * 登录
   */
  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const result = await phoneLoginApi(toRaw({ mobile: data.mobile, captcha: data.sms }), 'none');
      emit('success', result);
      //初始化数据
      initFrom();
    } catch (error) {
      notification.error({
        message: t('sys.api.errorTip'),
        description: error.message || t('sys.api.networkExceptionMsg'),
        duration: 3,
      });
    } finally {
      loading.value = false;
    }
  }
  //倒计时执行前的函数
  function sendCodeApi() {
    return getCaptcha({ mobile: formData.mobile, smsmode: SmsEnum.FORGET_PASSWORD });
  }

  /**
   * 账户登录
   */
  function accountLoginClick() {
    emit('account-login');
  }

  /**
   * 忘记密码
   */
  function forgetPwdClick() {
    emit('forget-password');
  }

  /**
   * 去注册
   */
  function registerClick() {
    emit('register-account');
  }

  /**
   * 初始化from
   */
  function initFrom() {
    Object.assign(formData, { mobile: '', sms: '' });
    formRef.value.clearValidate();
  }

  defineExpose({
    initFrom,
  });
</script>
<style lang="less" scoped>
  /*begin 按钮样式*/
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
  .register {
    color: #999ca0;
    text-align: center;
  }
  .goto-register {
    color: #1890ff;
    margin-left: 6px;
  }
  /*end 按钮样式*/

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
