<template>
  <div :class="prefixCls" class="login-background-img">
    <AppLocalePicker class="absolute top-4 right-4 enter-x xl:text-gray-600" :showText="false" />
    <AppDarkModeToggle class="absolute top-3 right-7 enter-x" />
    <div class="aui-logo" v-if="!getIsMobile">
      <div>
        <h3>
          <!-- <img :src="logoImg" alt="jeecg" /> -->
        </h3>
      </div>
    </div>
    <div v-else class="aui-phone-logo">
      <!-- <img :src="logoImg" alt="jeecg" /> -->
    </div>
    <div v-show="type === 'login'" class="login-scene">
      <section class="login-branding" aria-labelledby="platform-title">
<!--        <div class="brand-eyebrow">SMART CONTROL PLATFORM</div>-->
        <h1 id="platform-title">智慧管控平台</h1>
        <div class="brand-divider"></div>
        <p class="brand-name">中国北方稀土（集团）绿色冶炼能源站一体化零碳智慧中心</p>
        <p class="brand-description">汇聚能源运行、设备状态与低碳管理，让园区决策更实时、更清晰。</p>
        <div class="brand-tags" aria-label="平台能力">
          <span>能源协同</span>
          <span>智慧运行</span>
          <span>零碳管理</span>
        </div>
      </section>
      <div class="aui-content">
        <div class="aui-container">
          <div class="aui-form">
            <!-- <div class="aui-image">
              <div class="aui-image-text">
                <img :src="adTextImg" />
              </div>
            </div> -->
            <div class="aui-formBox">
              <div class="aui-formWell">
                <div class="login-panel__header">
                  <h2>欢迎登录智慧管控平台</h2>
                  <p>请输入您的账号信息完成身份验证</p>
                </div>
                <div class="aui-form-box" style="height: 180px">
                  <a-form ref="loginRef" :model="formData" v-if="activeIndex === 'accountLogin'" @keyup.enter.native="loginHandleClick">
                    <div class="aui-account">
                      <div class="aui-inputClear">
                        <i class="icon icon-code"></i>
                        <a-form-item>
                          <a-input class="fix-auto-fill" :placeholder="t('sys.login.userName')" v-model:value="formData.username" />
                        </a-form-item>
                      </div>
                      <div class="aui-inputClear">
                        <i class="icon icon-password"></i>
                        <a-form-item>
                          <a-input class="fix-auto-fill" type="password" :placeholder="t('sys.login.password')" v-model:value="formData.password" />
                        </a-form-item>
                      </div>
                      <div class="aui-inputClear">
                        <i class="icon icon-code"></i>
                        <a-form-item>
                          <a-input class="fix-auto-fill" type="text" :placeholder="t('sys.login.inputCode')" v-model:value="formData.inputCode" />
                        </a-form-item>
                        <div class="aui-code">
                          <img v-if="randCodeData.requestCodeSuccess" :src="randCodeData.randCodeImage" @click="handleChangeCheckCode" />
                          <img v-else style="margin-top: 2px; max-width: initial" :src="codeImg" @click="handleChangeCheckCode" />
                        </div>
                      </div>
                      <div class="aui-flex">
                        <div class="aui-flex-box">
                          <div class="aui-choice">
                            <a-input class="fix-auto-fill" type="checkbox" v-model:value="rememberMe" />
                            <span style="margin-left: 5px">{{ t('sys.login.rememberMe') }}</span>
                          </div>
                        </div>
                        <!-- <div class="aui-forget">
                          <a @click="forgetHandelClick"> {{ t('sys.login.forgetPassword') }}</a>
                        </div> -->
                      </div>
                    </div>
                  </a-form>
                  <a-form v-else ref="phoneFormRef" :model="phoneFormData" @keyup.enter.native="loginHandleClick">
                    <div class="aui-account phone">
                      <div class="aui-inputClear phoneClear">
                        <a-input class="fix-auto-fill" :placeholder="t('sys.login.mobile')" v-model:value="phoneFormData.mobile" />
                      </div>
                      <div class="aui-inputClear">
                        <a-input class="fix-auto-fill" :maxlength="6" :placeholder="t('sys.login.smsCode')" v-model:value="phoneFormData.smscode" />
                        <div v-if="showInterval" class="aui-code" @click="getLoginCode">
                          <a>{{ t('component.countdown.normalText') }}</a>
                        </div>
                        <div v-else class="aui-code">
                          <span class="aui-get-code code-shape">{{ t('component.countdown.sendText', [unref(timeRuning)]) }}</span>
                        </div>
                      </div>
                    </div>
                  </a-form>
                </div>
                <div class="aui-formButton">
                  <div class="aui-flex">
                    <a-button :loading="loginLoading" class="aui-link-login" type="primary" @click="loginHandleClick">
                      {{ t('sys.login.loginButton') }}</a-button
                    >
                  </div>
                  <!-- <div class="aui-flex">
                    <a class="aui-linek-code aui-flex-box" @click="codeHandleClick">{{ t('sys.login.qrSignInFormTitle') }}</a>
                  </div>
                  <div class="aui-flex">
                    <a class="aui-linek-code aui-flex-box" @click="registerHandleClick">{{ t('sys.login.registerButton') }}</a>
                  </div> -->
                </div>
              </div>
              <!-- <a-form @keyup.enter.native="loginHandleClick">
                <div class="aui-flex aui-third-text">
                  <div class="aui-flex-box aui-third-border">
                    <span>{{ t('sys.login.otherSignIn') }}</span>
                  </div>
                </div>
                <div class="aui-flex" :class="`${prefixCls}-sign-in-way`">
                  <div class="aui-flex-box">
                    <div class="aui-third-login">
                      <a title="github" @click="onThirdLogin('github')"><GithubFilled /></a>
                    </div>
                  </div>
                  <div class="aui-flex-box">
                    <div class="aui-third-login">
                      <a title="企业微信" @click="onThirdLogin('wechat_enterprise')"><icon-font class="item-icon" type="icon-qiyeweixin3" /></a>
                    </div>
                  </div>
                  <div class="aui-flex-box">
                    <div class="aui-third-login">
                      <a title="钉钉" @click="onThirdLogin('dingtalk')"><DingtalkCircleFilled /></a>
                    </div>
                  </div>
                  <div class="aui-flex-box">
                    <div class="aui-third-login">
                      <a title="微信" @click="onThirdLogin('wechat_open')"><WechatFilled /></a>
                    </div>
                  </div>
                </div>
              </a-form> -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="type === 'forgot'" :class="`${prefixCls}-form`">
      <MiniForgotpad ref="forgotRef" @go-back="goBack" @success="handleSuccess" />
    </div>
    <div v-show="type === 'register'" :class="`${prefixCls}-form`">
      <MiniRegister ref="registerRef" @go-back="goBack" @success="handleSuccess" />
    </div>
    <div v-show="type === 'codeLogin'" :class="`${prefixCls}-form`">
      <MiniCodelogin ref="codeRef" @go-back="goBack" @success="handleSuccess" />
    </div>
    <!-- 第三方登录相关弹框 -->
    <ThirdModal ref="thirdModalRef"></ThirdModal>

    <!-- 图片验证码弹窗 -->
    <CaptchaModal @register="captchaRegisterModal" @ok="getLoginCode" />
  </div>
</template>
<script lang="ts" setup name="login-mini">
  import { getCaptcha, getCodeInfo } from '/@/api/sys/user';
  import { computed, onMounted, reactive, ref, toRaw, unref } from 'vue';
  import codeImg from '/@/assets/images/checkcode.png';
  import { Rule } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SmsEnum } from '/@/views/sys/login/useLogin';
  import ThirdModal from '/@/views/sys/login/ThirdModal.vue';
  import MiniForgotpad from './MiniForgotpad.vue';
  import MiniRegister from './MiniRegister.vue';
  import MiniCodelogin from './MiniCodelogin.vue';
  import logoImg from '/@/assets/loginmini/icon/jeecg_logo.png';
  import adTextImg from '/@/assets/loginmini/icon/jeecg_ad_text.png';
  import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import { useLocaleStore } from '/@/store/modules/locale';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useAppInject } from '/@/hooks/web/useAppInject';
  import { GithubFilled, WechatFilled, DingtalkCircleFilled, createFromIconfontCN } from '@ant-design/icons-vue';
  import CaptchaModal from '@/components/jeecg/captcha/CaptchaModal.vue';
  import { useModal } from '@/components/Modal';
  import { ExceptionEnum } from '@/enums/exceptionEnum';

  import { loginApi } from './Standardized.api';

  const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2316098_umqusozousr.js',
  });
  const { prefixCls } = useDesign('mini-login');
  const { notification, createMessage } = useMessage();
  const userStore = useUserStore();
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const showLocale = localeStore.getShowPicker;
  const randCodeData = reactive<any>({
    randCodeImage: '',
    requestCodeSuccess: false,
    checkKey: null,
  });
  const rememberMe = ref<string>('0');
  //手机号登录还是账号登录
  const activeIndex = ref<string>('accountLogin');
  const type = ref<string>('login');
  //账号登录表单字段
  const formData = reactive<any>({
    inputCode: '',
    username: '',
    password: '',
  });
  //手机登录表单字段
  const phoneFormData = reactive<any>({
    mobile: '',
    smscode: '',
  });
  const loginRef = ref();
  //第三方登录弹窗
  const thirdModalRef = ref();
  //扫码登录
  const codeRef = ref();
  //是否显示获取验证码
  const showInterval = ref<boolean>(true);
  //60s
  const timeRuning = ref<number>(60);
  //定时器
  const timer = ref<any>(null);
  //忘记密码
  const forgotRef = ref();
  //注册
  const registerRef = ref();
  const loginLoading = ref<boolean>(false);
  const { getIsMobile } = useAppInject();
  const [captchaRegisterModal, { openModal: openCaptchaModal }] = useModal();
  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  /**
   * 获取验证码
   */
  function handleChangeCheckCode() {
    formData.inputCode = '';

    randCodeData.checkKey = 1629428467008;
    getCodeInfo(randCodeData.checkKey).then((res) => {
      randCodeData.randCodeImage = res;
      randCodeData.requestCodeSuccess = true;
    });
  }

  /**
   * 切换登录方式
   */
  function loginClick(type) {
    activeIndex.value = type;
  }

  /**
   * 账号或者手机登录
   */
  async function loginHandleClick() {
    if (unref(activeIndex) === 'accountLogin') {
      accountLogin();
    } else {
      //手机号登录
      phoneLogin();
    }
  }

  async function accountLogin() {
    if (!formData.username) {
      createMessage.warn(t('sys.login.accountPlaceholder'));
      return;
    }
    if (!formData.password) {
      createMessage.warn(t('sys.login.passwordPlaceholder'));
      return;
    }
    try {
      loginLoading.value = true;
      const { userInfo } = await userStore.login(
        toRaw({
          password: formData.password,
          username: formData.username,
          captcha: formData.inputCode,
          checkKey: randCodeData.checkKey,
          mode: 'none', //不要默认的错误提示
        })
      );
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realname}`,
          duration: 3,
        });
      }
      await loginApi();
    } catch (error) {
      notification.error({
        message: t('sys.api.errorTip'),
        description: error.message || t('sys.login.networkExceptionMsg'),
        duration: 3,
      });
      handleChangeCheckCode();
    } finally {
      loginLoading.value = false;
    }
  }

  /**
   * 手机号登录
   */
  async function phoneLogin() {
    if (!phoneFormData.mobile) {
      createMessage.warn(t('sys.login.mobilePlaceholder'));
      return;
    }
    if (!phoneFormData.smscode) {
      createMessage.warn(t('sys.login.smsPlaceholder'));
      return;
    }
    try {
      loginLoading.value = true;
      const { userInfo }: any = await userStore.phoneLogin({
        mobile: phoneFormData.mobile,
        captcha: phoneFormData.smscode,
        mode: 'none', //不要默认的错误提示
      });
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realname}`,
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: t('sys.api.errorTip'),
        description: error.message || t('sys.login.networkExceptionMsg'),
        duration: 3,
      });
    } finally {
      loginLoading.value = false;
    }
  }

  /**
   * 获取手机验证码
   */
  async function getLoginCode() {
    if (!phoneFormData.mobile) {
      createMessage.warn(t('sys.login.mobilePlaceholder'));
      return;
    }
    //update-begin---author:wangshuai---date:2024-04-18---for:【QQYUN-9005】同一个IP，1分钟超过5次短信，则提示需要验证码---
    const result = await getCaptcha({ mobile: phoneFormData.mobile, smsmode: SmsEnum.FORGET_PASSWORD }).catch((res) => {
      if (res.code === ExceptionEnum.PHONE_SMS_FAIL_CODE) {
        openCaptchaModal(true, {});
      }
    });
    //update-end---author:wangshuai---date:2024-04-18---for:【QQYUN-9005】同一个IP，1分钟超过5次短信，则提示需要验证码---
    if (result) {
      const TIME_COUNT = 60;
      if (!unref(timer)) {
        timeRuning.value = TIME_COUNT;
        showInterval.value = false;
        timer.value = setInterval(() => {
          if (unref(timeRuning) > 0 && unref(timeRuning) <= TIME_COUNT) {
            timeRuning.value = timeRuning.value - 1;
          } else {
            showInterval.value = true;
            clearInterval(unref(timer));
            timer.value = null;
          }
        }, 1000);
      }
    }
  }

  /**
   * 第三方登录
   * @param type
   */
  function onThirdLogin(type) {
    thirdModalRef.value.onThirdLogin(type);
  }

  /**
   * 忘记密码
   */
  function forgetHandelClick() {
    type.value = 'forgot';
    setTimeout(() => {
      forgotRef.value.initForm();
    }, 300);
  }

  /**
   * 返回登录页面
   */
  function goBack() {
    activeIndex.value = 'accountLogin';
    type.value = 'login';
  }

  /**
   * 忘记密码/注册账号回调事件
   * @param value
   */
  function handleSuccess(value) {
    Object.assign(formData, value);
    Object.assign(phoneFormData, { mobile: '', smscode: '' });
    type.value = 'login';
    activeIndex.value = 'accountLogin';
    handleChangeCheckCode();
  }

  /**
   * 注册
   */
  function registerHandleClick() {
    type.value = 'register';
    setTimeout(() => {
      registerRef.value.initForm();
    }, 300);
  }

  /**
   * 注册
   */
  function codeHandleClick() {
    type.value = 'codeLogin';
    setTimeout(() => {
      codeRef.value.initFrom();
    }, 300);
  }

  onMounted(() => {
    //加载验证码
    handleChangeCheckCode();
  });
</script>

<style lang="less" scoped>
  @import '/@/assets/loginmini/style/home.less';
  @import '/@/assets/loginmini/style/base.less';

  :deep(.ant-input:focus) {
    box-shadow: none;
  }
  .aui-get-code {
    float: right;
    position: relative;
    z-index: 3;
    background: #ffffff;
    color: #1573e9;
    border-radius: 100px;
    padding: 5px 16px;
    margin: 7px;
    border: 1px solid #1573e9;
    top: 12px;
  }

  .aui-get-code:hover {
    color: #1573e9;
  }

  .code-shape {
    border-color: #dadada !important;
    color: #aaa !important;
  }

  :deep(.jeecg-dark-switch) {
    position: absolute;
    margin-right: 10px;
  }
  .login-background-img {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    isolation: isolate;

    &::before,
    &::after {
      position: absolute;
      inset: 0;
      z-index: -1;
      content: '';
      pointer-events: none;
    }

    &::before {
      background: linear-gradient(90deg, rgba(4, 20, 35, 0.76) 0%, rgba(7, 28, 44, 0.48) 42%, rgba(4, 15, 28, 0.18) 100%);
    }

    &::after {
      background: radial-gradient(circle at 28% 42%, rgba(72, 181, 255, 0.24), transparent 34%);
      animation: ambient-glow 7s ease-in-out infinite alternate;
    }
  }

  .login-scene {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 100svh;
    padding: clamp(84px, 10vh, 128px) clamp(44px, 8vw, 152px) clamp(44px, 7vh, 88px);
  }

  .login-branding {
    max-width: 620px;
    color: #fff;
    animation: brand-enter 0.8s cubic-bezier(0.2, 0.75, 0.25, 1) both;
  }

  .brand-eyebrow {
    margin-bottom: 22px;
    color: #8ed4ff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.22em;
  }

  .login-branding h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(48px, 5vw, 78px);
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.08;
    text-shadow: 0 12px 38px rgba(0, 0, 0, 0.25);
  }

  .brand-divider {
    width: 56px;
    height: 3px;
    margin: 30px 0 26px;
    background: #53c7ff;
    box-shadow: 0 0 18px rgba(83, 199, 255, 0.9);
  }

  .brand-name {
    margin: 0;
    color: #f4fbff;
    font-size: clamp(17px, 1.45vw, 22px);
    font-weight: 500;
    line-height: 1.55;
    white-space: nowrap;
  }

  .brand-description {
    max-width: 500px;
    margin: 18px 0 30px;
    color: rgba(236, 248, 255, 0.78);
    font-size: 15px;
    line-height: 1.8;
  }

  .brand-tags {
    display: flex;
    gap: 16px;
    color: rgba(235, 249, 255, 0.9);
    font-size: 13px;

    span + span::before {
      display: inline-block;
      width: 4px;
      height: 4px;
      margin: 0 16px 3px 0;
      background: #58c8ff;
      border-radius: 50%;
      content: '';
    }
  }

  .aui-content {
    min-height: auto;
    padding: 0;
  }

  .aui-container {
    position: relative;
    top: auto;
    left: auto;
    width: min(690px, 100%);
    max-width: none;
    margin: 0;
    box-shadow: none;
    transform: none;
    animation: panel-enter 0.75s 0.1s cubic-bezier(0.2, 0.75, 0.25, 1) both;
  }

  .aui-form {
    width: 100%;
  }

  .aui-formBox {
    position: relative;
    overflow: hidden;
    padding: 60px 62px 54px;
    background:
      linear-gradient(145deg, rgba(5, 30, 48, 0.58) 0%, rgba(8, 62, 80, 0.46) 100%),
      repeating-linear-gradient(90deg, rgba(133, 218, 255, 0.07) 0 1px, transparent 1px 38px),
      repeating-linear-gradient(0deg, rgba(133, 218, 255, 0.06) 0 1px, transparent 1px 38px);
    border: 1px solid rgba(108, 207, 250, 0.74);
    border-radius: 2px;
    box-shadow: 0 24px 64px rgba(0, 13, 27, 0.34), 0 0 26px rgba(48, 178, 230, 0.18), inset 0 1px 0 rgba(191, 239, 255, 0.3);
    animation: panel-pulse 4.8s ease-in-out infinite;
    will-change: border-color, box-shadow;
  }

  .aui-formBox::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, transparent, #50d3ff, #fff, #50d3ff, transparent);
    background-size: 200% 100%;
    content: '';
    animation: edge-flow 3.6s linear infinite;
    will-change: background-position;
  }

  .aui-formBox::after {
    position: absolute;
    top: -28%;
    left: -34%;
    width: 26%;
    height: 160%;
    background: linear-gradient(90deg, transparent, rgba(161, 237, 255, 0.3), transparent);
    content: '';
    opacity: 0;
    pointer-events: none;
    transform: skewX(-18deg);
    animation: panel-sweep 6s ease-in-out infinite;
    will-change: opacity, transform;
  }

  .aui-formWell {
    position: relative;
    z-index: 1;
  }

  .login-panel__header {
    margin-bottom: 36px;
    padding-bottom: 26px;
    border-bottom: 1px solid rgba(176, 226, 246, 0.18);
  }

  .login-panel__header h2 {
    margin: 0 0 8px;
    color: #f4fbff;
    font-size: 35px;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1.35;
    text-shadow: 0 4px 18px rgba(0, 0, 0, 0.24);
  }

  .login-panel__header p {
    margin: 0;
    color: rgba(209, 235, 248, 0.76);
    font-size: 16px;
    line-height: 1.6;
  }

  .aui-form-box {
    height: auto !important;
  }

  .aui-inputClear {
    box-sizing: border-box;
    height: 60px;
    margin: 18px 0;
    padding-left: 44px;
    background: rgba(4, 38, 57, 0.52);
    border: 1px solid rgba(117, 206, 244, 0.48);
    border-radius: 2px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .aui-inputClear:hover,
  .aui-inputClear:focus-within {
    background: rgba(6, 54, 76, 0.7);
    border-color: #53bce8;
    box-shadow: 0 0 0 3px rgba(80, 185, 233, 0.12);
  }

  .aui-inputClear .icon {
    top: 19px;
    left: 14px;
    width: 22px;
    height: 22px;
    background-size: 22px 22px;
  }

  .aui-inputClear input {
    height: 58px;
    padding: 12px 10px;
    color: #f5fcff;
    font-size: 17px;
  }

  :deep(.aui-inputClear input::placeholder) {
    color: rgba(219, 240, 250, 0.74);
  }

  .aui-code {
    right: 9px;
    bottom: 7px;
  }

  .aui-choice {
    min-height: 30px;
    margin-top: 8px;
    color: #d4e9f3;
    font-size: 15px;
    line-height: 30px;
  }

  .aui-choice input {
    width: 19px;
    height: 19px;
  }

  .aui-formButton {
    padding-top: 20px;
  }

  .aui-link-login {
    height: 60px;
    margin: 0;
    width: 100%;
    border: 0;
    border-radius: 3px;
    background: linear-gradient(90deg, #0577b6, #36c9f5, #0577b6);
    background-size: 200% 100%;
    box-shadow: 0 10px 20px rgba(6, 17, 28, 0.28), 0 0 18px rgba(41, 190, 244, 0.34), inset 0 1px 0 rgba(220, 249, 255, 0.32);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.2em;
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    animation: button-flow 3.2s linear infinite;
    will-change: background-position;
  }

  .aui-link-login:hover {
    filter: brightness(1.06);
    box-shadow: 0 14px 24px rgba(28, 133, 191, 0.32);
    transform: translateY(-1px);
  }

  .top-3 {
    top: 0.45rem;
  }

  @keyframes brand-enter {
    from {
      opacity: 0;
      transform: translateY(22px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes panel-enter {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes ambient-glow {
    from {
      opacity: 0.45;
      transform: scale(0.96);
    }
    to {
      opacity: 0.8;
      transform: scale(1.06);
    }
  }

  @keyframes edge-flow {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: 0 0;
    }
  }

  @keyframes panel-sweep {
    0%,
    32% {
      opacity: 0;
      transform: translateX(0) skewX(-18deg);
    }
    42% {
      opacity: 0.9;
    }
    58%,
    100% {
      opacity: 0;
      transform: translateX(510%) skewX(-18deg);
    }
  }

  @keyframes panel-pulse {
    0%,
    100% {
      border-color: rgba(108, 207, 250, 0.56);
      box-shadow: 0 24px 64px rgba(0, 13, 27, 0.34), 0 0 20px rgba(48, 178, 230, 0.12), inset 0 1px 0 rgba(191, 239, 255, 0.22);
    }
    50% {
      border-color: rgba(135, 225, 255, 0.94);
      box-shadow: 0 26px 70px rgba(0, 13, 27, 0.4), 0 0 34px rgba(54, 192, 245, 0.34), inset 0 1px 0 rgba(218, 249, 255, 0.44);
    }
  }

  @keyframes button-flow {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: 0 0;
    }
  }

  @media (max-width: 900px) {
    .login-scene {
      padding: 96px 48px 52px;
    }

    .login-branding {
      max-width: 48%;
    }
  }

  @media (min-width: 721px) and (max-width: 1100px) {
    .login-scene {
      gap: 20px;
      padding-right: 32px;
      padding-left: 32px;
    }

    .login-branding {
      flex: 1;
      max-width: none;
      min-width: 0;
    }

    .brand-name {
      font-size: 14px;
      letter-spacing: -0.04em;
    }

    .aui-container {
      width: min(460px, 50vw);
      flex: 0 0 auto;
    }

    .aui-formBox {
      padding: 48px 40px 42px;
    }
  }

  @media (max-width: 720px) {
    .login-background-img::before {
      background: rgba(4, 19, 34, 0.45);
    }

    .login-scene {
      justify-content: center;
      padding: 76px 22px 36px;
    }

    .login-branding {
      display: none;
    }

    .aui-container {
      width: min(540px, 100%);
    }

    .aui-formBox {
      padding: 42px 30px 36px;
    }

    .login-panel__header h2 {
      font-size: 29px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .login-background-img::after,
    .login-branding,
    .aui-container {
      animation: none;
    }

    .aui-link-login {
      transition: none;
    }
  }
</style>

<style lang="less">
  @prefix-cls: ~'@{namespace}-mini-login';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg !important;
      background-image: none;

      &::before {
        background-image: url(/@/assets/svg/login-bg-dark.svg);
      }
      .aui-inputClear {
        background-color: #232a3b !important;
      }
      .ant-input,
      .ant-input-password {
        background-color: #232a3b !important;
      }

      .ant-btn:not(.ant-btn-link):not(.ant-btn-primary) {
        border: 1px solid #4a5569 !important;
      }

      &-form {
        background: @dark-bg !important;
      }

      .app-iconify {
        color: #fff !important;
      }
      .aui-inputClear input,
      .aui-input-line input,
      .aui-choice {
        color: #c9d1d9 !important;
      }

      .aui-formBox {
        background-color: @dark-bg !important;
      }
      .aui-third-text span {
        background-color: @dark-bg !important;
      }
      .aui-form-nav .aui-flex-box {
        color: #c9d1d9 !important;
        text-align: center;
      }

      .aui-formButton .aui-linek-code {
        background: @dark-bg !important;
        color: white !important;
      }
      .aui-code-line {
        border-left: none !important;
      }
      .ant-checkbox-inner,
      .aui-success h3 {
        border-color: #c9d1d9;
      }
      //update-begin---author:wangshuai ---date:20230828  for：【QQYUN-6363】这个样式代码有问题，不在里面，导致表达式有问题------------
      &-sign-in-way {
        .anticon {
          font-size: 22px !important;
          color: #888 !important;
          cursor: pointer !important;

          &:hover {
            color: @primary-color !important;
          }
        }
      }
      //update-end---author:wangshuai ---date:20230828  for：【QQYUN-6363】这个样式代码有问题，不在里面，导致表达式有问题------------
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }

    .ant-divider-inner-text {
      font-size: 12px !important;
      color: @text-color-secondary !important;
    }
    .aui-third-login a {
      background: transparent;
    }
  }
</style>
