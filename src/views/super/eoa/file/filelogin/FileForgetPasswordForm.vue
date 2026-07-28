<template>
  <a-form class="p-4 enter-x" :model="formData" :rules="validatorRules" ref="formRef" v-show="type === 'checkPhone'">
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
      <a-button type="primary" size="large" block @click="handleNext" :loading="loading"> 下一步 </a-button>
      <div class="mt-4 login-color pointer callback-login" @click="handleBackLogin">返回登录</div>
    </a-form-item>
  </a-form>
  <a-form class="p-4 enter-x" :model="modifyPwdData" ref="formPwdRef" :rules="validatorPwdRules" v-show="type === 'modifyPwd'">
    <a-form-item name="password" class="enter-x">
      <a-input-password size="large" v-model:value="modifyPwdData.password" placeholder="请输入新密码" class="input-background" />
    </a-form-item>
    <a-form-item name="confirmPassword" class="enter-x">
      <a-input-password size="large" v-model:value="modifyPwdData.confirmPassword" placeholder="请再次输入新密码" class="input-background" />
    </a-form-item>
    <a-form-item class="enter-x">
      <a-button type="primary" size="large" block @click="finishPwdClick" :loading="loading"> 完成 </a-button>
      <div class="mt-4 login-color pointer callback-login" @click="handleBackLogin">返回登录</div>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" name="file-forget-password-form" setup>
  import { reactive, ref, toRaw, unref, defineEmits, onMounted } from 'vue';
  import { SmsEnum, useFormRules, useFormValid, LoginStateEnum } from '/@/views/sys/login/useLogin';
  import { CountdownInput } from '/@/components/CountDown';
  import { getCaptcha, passwordChange, phoneVerify } from '/@/api/sys/user';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Rule } from '/@/components/Form';
  const { t } = useI18n();
  //按钮加载
  const loading = ref<boolean>(false);
  const formRef = ref();
  const formPwdRef = ref();
  //手机号登录验证
  const formData = reactive<any>({
    mobile: '',
    sms: '',
  });
  //用户数据
  const accountInfo = ref<any>({});
  const emit = defineEmits(['account-login', 'login-data']);
  //手机号表单验证
  const { validForm } = useFormValid(formRef);
  const validatorRules: Record<string, Rule[]> = {
    mobile: [{ required: true, message: '请输入手机号' }],
    sms: [{ required: true, message: '请输入验证码' }],
  };
  //修改密码表单验证
  const validatorPwdRules: Record<string, Rule[]> = {
    password: [{ required: true, message: '请输入密码' }],
    confirmPassword: [{ required: true, validator: checkPassword }],
  };
  //类型 checkPhone验证手机号/modifyPwd 修改密码
  const type = ref('checkPhone');
  //倒计时执行前的函数
  function sendCodeApi() {
    return getCaptcha({ mobile: formData.mobile, smsmode: SmsEnum.FORGET_PASSWORD });
  }
  const { createMessage } = useMessage();
  //修改密码数据
  const modifyPwdData = reactive<any>({
    password: '',
    confirmPassword: '',
  });

  /**
   * 返回登录
   */
  function handleBackLogin() {
    emit('account-login');
    Object.assign(formData, { mobile: '', sms: '' });
    accountInfo.value = {};
    type.value = 'checkPhone';
  }

  /**
   * 下一步
   */
  async function handleNext() {
    accountInfo.value = {};
    const data = await validForm();
    if (!data) return;
    loading.value = true;
    const resultInfo = await phoneVerify(
      toRaw({
        phone: data.mobile,
        smscode: data.sms,
      })
    );
    if (resultInfo.success) {
      accountInfo.value = {
        username: resultInfo.result.username,
        phone: data.mobile,
        smscode: resultInfo.result.smscode,
      };
      type.value = 'modifyPwd';
      formPwdRef.value.clearValidate();
    } else {
      createMessage.error(resultInfo.message || t('sys.api.networkExceptionMsg'));
    }
    loading.value = false;
  }

  /**
   * 验证再次输入密码是否正确
   */
  function checkPassword(_rule: Rule, value: string) {
    if (!value) {
      return Promise.reject('请再次输入密码');
    } else {
      if (value !== modifyPwdData.password) {
        return Promise.reject('确认密码不一致!');
      } else {
        return Promise.resolve();
      }
    }
  }

  /**
   * 修改密码
   */
  async function finishPwdClick() {
    const data = await formPwdRef.value.validateFields();
    const resultInfo = await passwordChange(
      toRaw({
        username: accountInfo.value.username,
        password: data.password,
        smscode: formData.sms,
        phone: formData.mobile,
      })
    );
    if (resultInfo.success) {
      //修改密码
      emit('login-data', { username: accountInfo.value.username, password: data.password });
      initFrom();
    } else {
      //错误提示
      createMessage.error(resultInfo.message || t('sys.api.networkExceptionMsg'));
    }
  }

  /**
   * 初始化from
   */
  function initFrom() {
    Object.assign(formData, { mobile: '', sms: '' });
    accountInfo.value = {};
    Object.assign(modifyPwdData, { password: '', confirmPassword: '' });
    formRef.value.clearValidate();
  }

  defineExpose({
    initFrom,
  });
</script>

<style lang="less" scoped>
  .login-color {
    color: #1890ff;
    font-size: 14px;
  }
  .phone-code-login {
    float: right;
  }
  .pointer {
    cursor: pointer;
  }
  .callback-login {
    text-align: center;
    margin-top: 10px;
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
  .input-background :deep(.ant-input) {
    background-color: #f2f3f9 !important;
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
