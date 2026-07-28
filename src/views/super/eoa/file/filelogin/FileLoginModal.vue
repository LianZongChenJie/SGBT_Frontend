<template>
  <BasicModal
    wrapClassName="file-login-modal"
    v-bind="$attrs"
    @register="registerModal"
    width="428px"
    :title="title"
    :showCancelBtn="false"
    :showOkBtn="false"
    :closable="closable"
    :maskClosable="maskClosable"
    @visible-change="visibleChange"
  >
    <!-- 微信登录 -->
    <div>
      <a-button size="large" class="wechat" block preIcon="ant-design:wechat-outlined" @click="wechatClick">
        <span>微信登录</span>
      </a-button>
      <a-divider class="or-divider">或</a-divider>
    </div>
    <!-- 账号登录 -->
    <div v-show="loginType === 'accountLogin'">
      <FileLoginForm
        ref="fileLoginRef"
        @success="afterLoginAction"
        @phone-login="toPhoneLogin"
        @forget-password="forgetPassword"
        @register-account="registerAccount"
      />
    </div>
    <!-- 手机号登录 -->
    <div v-show="loginType === 'phoneLogin'">
      <FileMobileForm
        ref="fileMobileRef"
        @success="afterLoginAction"
        @account-login="toAccountLogin"
        @forget-password="forgetPassword"
        @register-account="registerAccount"
      />
    </div>
    <!-- 忘记密码 -->
    <div v-show="loginType === 'forgetPassword'">
      <FileForgetPasswordForm ref="filePwdRef" @account-login="toAccountLogin" @login-data="loginData" />
    </div>
    <!-- 注册账号 -->
    <div v-show="loginType === 'registerAccount'">
      <FileRegisterForm ref="fileRegisterRef" @account-login="toAccountLogin" @login-data="loginData" />
    </div>
  </BasicModal>
  <FileThirdModal ref="fileThirdRef" @success="afterLoginAction"></FileThirdModal>
</template>
<script lang="ts" setup>
  import { ref, defineEmits, nextTick } from 'vue';
  import FileLoginForm from './FileLoginForm.vue';
  import FileMobileForm from './FileMobileForm.vue';
  import FileForgetPasswordForm from './FileForgetPasswordForm.vue';
  import FileRegisterForm from './FileRegisterForm.vue';
  import FileThirdModal from './FileThirdModal.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';
  import { JDragConfigEnum } from '/@/enums/jeecgEnum';
  import { useUserStore } from '/@/store/modules/user';
  import BasicModal from '/@/components/Modal/src/BasicModal.vue';
  import { useModalInner } from '/@/components/Modal';
  //组件参数
  const props = defineProps({
    closable: { type: Boolean, default: true },
    maskClosable: { type: Boolean, default: true }
  });
  //登录类型
  const loginType = ref<string>('accountLogin');

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const showLocale = localeStore.getShowPicker;
  const title = ref<string>('');
  const emit = defineEmits(['success', 'register']);
  const userStore = useUserStore();
  const fileLoginRef = ref();
  const fileMobileRef = ref();
  const filePwdRef = ref();
  const fileRegisterRef = ref();
  const fileThirdRef = ref();

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });
    title.value = '登录';
  });

  /**
   * 登录成功之后传递参数
   * @param data
   */
  async function afterLoginAction(data) {
    const { token, userInfo } = data;
    userStore.setToken(token);
    userStore.setTenant(userInfo.loginTenantId);
    await userStore.getUserInfoAction();
    let sessionTimeout = userStore.getSessionTimeout;
    if (sessionTimeout) {
      userStore.setSessionTimeout(false);
    } else {
      await userStore.setLoginInfo({ ...data, isLogin: true });
      localStorage.setItem(JDragConfigEnum.DRAG_BASE_URL, useGlobSetting().domainUrl);
    }
    emit('success', userInfo);
    closeModal();
  }

  /**
   * 手机号登录
   */
  function toPhoneLogin() {
    title.value = '登录';
    loginType.value = 'phoneLogin';
    setTimeout(() => {
      fileMobileRef.value.initFrom();
    }, 300);
  }

  /**
   * 账户登录
   */
  function toAccountLogin() {
    title.value = '登录';
    loginType.value = 'accountLogin';
    initFrom();
  }

  /**
   * 忘记密码
   */
  function forgetPassword() {
    title.value = '重置密码';
    loginType.value = 'forgetPassword';
    setTimeout(() => {
      filePwdRef.value.initFrom();
    }, 300);
  }

  /**
   * 注册账户
   */
  function registerAccount() {
    title.value = '注册账号 ';
    loginType.value = 'registerAccount';
    setTimeout(() => {
      fileRegisterRef.value.initFrom();
    }, 300);
  }

  /**
   * 设置登录数据
   */
  function loginData(val) {
    nextTick(() => {
      loginType.value = 'accountLogin';
      fileLoginRef.value.setFormData(val);
    });
  }

  /**
   * 弹窗打开关闭事件
   */
  function visibleChange(visible: boolean) {
    if (!visible) {
      loginType.value = 'accountLogin';
      initFrom();
    }
  }

  /**
   * 初始化from
   */
  function initFrom() {
    setTimeout(() => {
      fileLoginRef.value.initFrom();
    }, 300);
  }

  /**
   * 微信登录点击
   */
  function wechatClick() {
    fileThirdRef.value.onThirdLogin('wechat_open');
  }
</script>
<style lang="less">
  .file-login-modal .scrollbar__thumb {
    display: none;
  }
  .file-login-modal {
    border-radius: 8px;
  }
  .file-login-modal .ant-modal-content,
  .ant-modal-header {
    border-radius: 8px;
  }
</style>
<style lang="less" scoped>
  .or-divider {
    font-size: 12px;
    color: rgba(197, 197, 197, 1);
  }
  .wechat {
    color: rgba(0, 194, 103, 1);
    font-weight: 500;
    justify-content: center;
    align-items: center;
    span {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }
  }
</style>
