<template>
  <Form class="p-4 enter-x" :model="formData" :rules="validatorRules" ref="formRef" @keypress.enter="handleLogin">
    <FormItem name="username" class="enter-x">
      <Input size="large" v-model:value="formData.username" :placeholder="t('sys.login.userName')" class="fix-auto-fill input-background" />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        size="large"
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
        class="input-background"
      />
    </FormItem>

    <!--验证码-->
    <ARow class="enter-x">
      <ACol :span="12">
        <FormItem name="inputCode" class="enter-x">
          <Input
            size="large"
            v-model:value="formData.inputCode"
            :placeholder="t('sys.login.inputCode')"
            style="min-width: 100px"
            class="input-background"
          />
        </FormItem>
      </ACol>
      <ACol :span="8">
        <FormItem :style="{ 'text-align': 'right', 'margin-left': '20px' }" class="enter-x">
          <img
            v-if="randCodeData.requestCodeSuccess"
            style="margin-top: 2px; max-width: initial"
            :src="randCodeData.randCodeImage"
            @click="handleChangeCheckCode"
          />
          <img v-else style="margin-top: 2px; max-width: initial" :src="codeImg" @click="handleChangeCheckCode" />
        </FormItem>
      </ACol>
    </ARow>
    <FormItem class="enter-x">
      <div style="justify-content: space-between; margin-bottom: 12px">
        <span class="login-color forget-pwd pointer" @click="forgetPwdClick"> 忘记密码 </span>
        <span class="login-color phone-code-login pointer" @click="phoneCodeClick">手机号登录</span>
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
<script lang="ts" setup name="file-login-from">
  import { reactive, ref, toRaw, unref, computed, onMounted, defineEmits } from 'vue';

  import { Checkbox, Form, Input, Row, Col, Button, Divider } from 'ant-design-vue';
  import { createFromIconfontCN } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { useLoginState, useFormRules, useFormValid } from '/@/views/sys/login/useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getCodeInfo, loginApi } from '/@/api/sys/user';
  import codeImg from '/@/assets/images/checkcode.png';
  import { ErrorMessageMode } from '/#/axios';
  import { Rule } from '/@/components/Form';
  const emit = defineEmits(['success', 'phone-login', 'forget-password', 'register-account']);
  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2316098_umqusozousr.js',
  });
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const { prefixCls } = useDesign('login');
  const userStore = useUserStore();

  //新增表单验证
  const validatorRules: Record<string, Rule[]> = {
    username: [{ required: true, message: '请输入用户名' }],
    password: [{ required: true, message: '请输入密码' }],
    inputCode: [{ required: true, message: '请输入验证码' }],
  };

  const formRef = ref();
  const thirdModalRef = ref();
  const loading = ref(false);
  const rememberMe = ref(false);

  const formData = reactive({
    //初始化不需要用户名和密码
    username: '',
    password: '',
    inputCode: '',
  });
  const randCodeData = reactive({
    randCodeImage: '',
    requestCodeSuccess: false,
    checkKey: null,
  });

  const { validForm } = useFormValid(formRef);

  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const result = await loginApi(
        toRaw({
          password: data.password,
          username: data.username,
          captcha: data.inputCode,
          checkKey: randCodeData.checkKey,
        }),
        'none' //不要默认的错误提示
      );
      emit('success', result);
      //初始化数据
      initFrom();
      loading.value = false;
    } catch (error) {
      notification.error({
        message: t('sys.api.errorTip'),
        description: error.message || t('sys.api.networkExceptionMsg'),
        duration: 3,
      });
      loading.value = false;
      handleChangeCheckCode();
    }
  }

  function handleChangeCheckCode() {
    formData.inputCode = '';
    //TODO 兼容mock和接口，暂时这样处理
    randCodeData.checkKey = 1629428467008; //new Date().getTime();
    getCodeInfo(randCodeData.checkKey).then((res) => {
      randCodeData.randCodeImage = res;
      randCodeData.requestCodeSuccess = true;
    });
  }

  /**
   * 手机号登录
   */
  function phoneCodeClick() {
    emit('phone-login');
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
   * 设置账号数据
   */
  function setFormData(val) {
    Object.assign(formData, val);
  }

  /**
   * 初始化from
   */
  function initFrom() {
    Object.assign(formData, { mobile: '', sms: '' });
    formRef.value.clearValidate();
  }

  //初始化验证码
  onMounted(() => {
    handleChangeCheckCode();
  });

  defineExpose({
    setFormData,
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
    color: @primary-color;
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
  .input-background :deep(.ant-input) {
    background-color: #f2f3f9 !important;
  }
  /*end input颜色样式*/
</style>
