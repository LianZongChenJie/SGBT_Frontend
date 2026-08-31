<template>
  <BasicModal v-bind="getProps">
    <template #title>
      <div class="desform-modal-header">
        <!-- 弹窗标题 -->
        <div class="desform-modal-title">
          {{ previewIsFullscreen ? '' : getProps.title }}
        </div>
        <!-- 表单设计器页面tab切换 -->
        <div v-show="initial" class="desform-modal-tabs">
          <a-tabs :activeKey="headerActiveKey" @change="onTabChange">
            <a-tab-pane tab="设计表单" key="design"></a-tab-pane>
            <a-tab-pane tab="表单设置" key="setting"></a-tab-pane>
          </a-tabs>
        </div>
        <div class="desform-modal-right"></div>
      </div>
    </template>
    <a-spin :spinning="loading">
      <iframe
          ref="iframeRef"
          :src="iframeFormSrcUrl"
          frameborder="0"
          allow="geolocation *; microphone *; camera *; midi *; encrypted-media *;"
          :style="{ width: '100%', 'min-height': 'calc(100vh - 47px)' }"
      ></iframe>
    </a-spin>
    <a-button v-if="loading && showCloseButton" class="btn-loading-close" type="primary" danger @click="close">
      <span>关闭</span>
    </a-button>
  </BasicModal>

  <!-- 表单设计器调用自定义按钮抽屉 -->
  <DesignerButtonDrawer
    ref="buttonDrawerRef"
    v-if="desformCode!=null && desformCode!=''"
    :desformCode="desformCode"
    :desformName="desformName"
    :designForm="model"
    @command="onButtonDrawerCommand"
  />
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { ref, computed, defineComponent, unref } from 'vue';
  import { useRoute } from 'vue-router';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getTenantId, getToken } from '/@/utils/auth';
  import { randomString, stringIsNull } from '/@/utils/common/compUtils';
  import { defHttp } from '/@/utils/http/axios';
  import DesignerButtonDrawer from '../multi/config/DesignerButtonDrawer.vue';
  import { cloneDeep } from 'lodash-es';

  export default defineComponent({
    name: 'FormDesignerIframeModal',
    components: {
      BasicModal,
      DesignerButtonDrawer,
    },
    props: {
      // 是否是模板模式
      templet: propTypes.bool.def(false),
      // 是否低代码模式（简化使用难度）
      isLowApp: propTypes.bool.def(true),
    },
    emits: ['register', 'success', 'close', 'reload-menu', 'open-dict-dialog'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      const glob = useGlobSetting();
      const route = useRoute();
      const getMessage = useMessage();
      const iframeRef = ref<HTMLIFrameElement>();
      const buttonDrawerRef = ref<InstanceType<typeof DesignerButtonDrawer>>();
      // 消息id（用于区分消息传递）
      const messageId = randomString(16);
      // 顶部tabs
      const headerActiveKey = ref('design');
      // 是否初始化成功
      const initial = ref(false);
      // 当前是否正在加载中
      const loading = ref(true);
      // 页面加载URL
      const iframeFormSrcUrl = ref('');
      // 是否显示关闭按钮（用于长时间未加载成功的情况）
      const showCloseButton = ref(false);
      // 预览窗口是否全屏
      const previewIsFullscreen = ref(false);
      // 表单model
      const model = ref<Recordable>();
      // 是否已更改JSON且已保存过
      let changed = false;
      // 用来判断是否已保存
      let savedJson = null;
      // 注册弹窗
      const [onRegister, { closeModal, setModalProps }] = useModalInner(open);

      const desformCode = computed(() => (props.templet ? model.value?.templetCode : model.value?.desformCode));
      const desformName = computed(() => (props.templet ? model.value?.templetName : model.value?.desformName));
      // 弹窗最终props
      const getProps = computed(() => {
        let title = desformName.value;

        let modalProps: Partial<ModalProps> = {
          title: `${title} - 表单设计器`,
          width: 800,
          zIndex: 999,
          bodyStyle: { padding: '0' },
          wrapClassName: 'design-form-modal',
          confirmLoading: loading.value,
          footer: null,
          closable: previewIsFullscreen.value ? false : initial.value,
          draggable: false,
          maskClosable: false,
          canFullscreen: false,
          destroyOnClose: true,
          defaultFullscreen: true,
        };
        let finalProps: Recordable = {
          keyboard: false,
          ...modalProps,
          ...unref(attrs),
          ...props,
          onCancel: onSendClose,
          onRegister,
        };
        return finalProps;
      });

      const url = computed(() => {
        return props.templet
          ? {
              add: '/desform/templet/add',
              edit: '/desform/templet/edit',
            }
          : {
              add: '/desform/add',
              edit: '/desform/edit',
            };
      });
      // 保存的Json名称
      const saveJsonName = computed(() => (props.templet ? 'templetJson' : 'desformDesignJson'));
      // 添加监听事件
      window.addEventListener(
        'message',
        function (event) {
          let payload = event.data;
          if (`${messageId}` !== payload.messageId) {
            return;
          }
          switch (payload.type) {
            case 'created':
              initial.value = true;
              loading.value = false;
              showCloseButton.value = false;
              previewIsFullscreen.value = false;
              break;
            case 'mounted':
              sendEvent('load-data', { token: getToken() });
              break;
            case 'closing':
              handleClosing(payload.data);
              break;
            case 'modal':
              showModal(payload.data);
              break;
            case 'request':
              request(payload.data);
              break;
            case 'request-save':
              let { designJson, refTableDefaultValDbSync, settings } = payload.data;
              request(designJson, refTableDefaultValDbSync, settings);
              break;
            case 'custom-button:add':
              buttonDrawerRef.value.doAdd();
              break;
            case 'custom-button:edit':
              buttonDrawerRef.value.doEdit(payload.data.record);
              break;
            case 'reload:menu':
              emit('reload-menu');
              break;
            case 'show-message':
              getMessage.createMessage[payload.data.type](payload.data.message);
              break;
            case 'preview-fullscreen-change':
              previewIsFullscreen.value = payload.data.fullscreen;
              break;
            // 通用交互事件，可以传递callback
            case 'base-frame-interaction':
              handlerBaseFrameInteraction(payload.data);
              break;
          }
        },
        false
      );

      /** 弹窗开启 */
      function open(data) {
        model.value = data?.record;
        if (model.value) {
          savedJson = model.value[saveJsonName.value];
        }

        //生成设计表单url
        iframeFormSrcUrl.value = getAutoDesFormUrl(model.value?.id);
        console.log(' --- open iframe src = ', iframeFormSrcUrl.value);

        changed = false;
        initial.value = false;
        loading.value = true;
        // 如果超过2秒还没有得到子组件的反馈，就显示关闭按钮，让用户可手动关闭
        setTimeout(() => {
          if (loading.value) {
            showCloseButton.value = true;
          }
        }, 2000);
      }

      /** 弹窗关闭 */
      function close() {
        console.log(' ----调查缓存问题--- 弹窗关闭 --- ');
        //清空历史url
        iframeFormSrcUrl.value = '';
        closeModal();
        savedJson = null;
        showCloseButton.value = false;
        headerActiveKey.value = 'design';
        //update-begin-author:liusq---date:2024-06-14--for: TV360X-960视图编辑页面关闭后不要自动折叠已经打开的视图树
        let record = cloneDeep(model.value);
        if (changed) emit('success', record);
        //update-end-author:liusq---date:2024-06-14--for: TV360X-960视图编辑页面关闭后不要自动折叠已经打开的视图树
        emit('close');
      }

      // 发送关闭消息，尝试关闭弹窗
      function onSendClose() {
        setModalProps({ visible: true });
        sendEvent('try-close');
      }

      // 切换表单设计器设计页面
      function onTabChange(value) {
        headerActiveKey.value = value;
        sendEvent('change-page', { type: value });
      }

      //生成设计器表单的url
      function getAutoDesFormUrl(id) {
        let { domainUrl } = glob;
        let token = getToken();
        let tenantId = getTenantId();
        let url = '/desform/index';
        let src = domainUrl + url;
        if (id) {
          src += '/' + id;
        }
        src += `?isTemplet=${props.templet}&messageId=${messageId}`;
        // 登录token
        src += `&token=${token}`;
        if (!props.isLowApp) {
          src += `&isLowApp=false`;
        } else if (route.params.appId) {
          src += `&lowAppId=${route.params.appId}`;
        }
        // 兼容多租户
        if (!stringIsNull(tenantId)) {
          src += `&tenantId=${tenantId}`;
        }
        // 设置前端地址
        src += `&originUrl=${encodeURIComponent(window.location.origin)}`;
        return src;
      }

      /** 显示模态弹窗 */
      function showModal(data) {
        let modal: any = null;
        if (data.type === 'alert-warning') {
          modal = getMessage.createWarningModal;
        } else if (data.type === 'alert-error') {
          modal = getMessage.createErrorModal;
        } else if (data.type === 'alert-info') {
          modal = getMessage.createInfoModal;
        }
        if (modal != null) {
          modal({
            title: data.title,
            content: data.content,
            ...data.options,
          });
        }
      }

      /** 关闭提示 */
      function handleClosing(data) {
        if (data.list.length === 0) {
          close();
        } else if (JSON.stringify(data) === (savedJson || (model.value || {})[saveJsonName.value])) {
          close();
        } else {
          getMessage.createConfirm({
            title: '警告',
            iconType: 'warning',
            content: '系统可不会保存您的更改，确定要关闭吗？',
            okText: '关闭',
            okButtonProps: { type: 'default', danger: true },
            cancelText: '取消',
            onOk: () => close(),
          });
        }
      }

      /** iframe 发送消息 */
      function sendEvent(type, data = {}) {
        iframeRef.value?.contentWindow?.postMessage({ messageId, type, data }, '*');
      }

      /**
       * 处理框架交互
       * @param type
       * @param data
       * @param cbKey
       */
      function handlerBaseFrameInteraction({type, data, cbKey}) {
        switch (type) {
          case "openSettingDictModal":
            emit('open-dict-dialog', {
              data: data,
              callback: (res) => {
                sendFrameInteractionCallback(cbKey, res);
              }
            })
            break;
        }
      }

      /**
       * 发送框架交互回调
       * @param cbKey
       * @param data
       */
      function sendFrameInteractionCallback(cbKey: string, data: any) {
        sendEvent('base-frame-interaction-callback', {cbKey, data})
      }

      /** 发送请求 */
      async function request(data, refTableDefaultValDbSync = {}, settings: Recordable = {}) {
        loading.value = true;
        let onlineForm = JSON.parse(data).config.onlineForm;
        try {
          let res = await defHttp.put(
            {
              url: url.value.edit,
              params: {
                id: model.value?.id,
                [saveJsonName.value]: data,
                cgformCode: onlineForm ? onlineForm : undefined,
                updateCount: model.value?.updateCount ?? 0,
                refTableDefaultValDbSync: refTableDefaultValDbSync,
              },
            },
            { successMessageMode: 'none', isTransformResponse: false }
          );
          if (res.success) {
            changed = true;
            savedJson = data;
            let successTip = settings?.successTip ?? '保存成功';
            getMessage.createMessage.success(successTip);
            //【QQYUN-5373】乐观锁，将新的版本号更新到model中
            model.value!.updateCount = res.result.updateCount;
          } else {
            let failTip = settings?.successTip ?? '保存失败';
            getMessage.createErrorModal({ title: failTip, content: res.message });
          }
        } catch (e) {
          console.error(e);
        } finally {
          loading.value = false;
        }
      }

      // 自定义按钮抽屉发送指令
      function onButtonDrawerCommand(args) {
        sendEvent('custom-button:command', {
          ...args,
          type: `custom-button:` + args.type,
        });
      }

      return {
        iframeFormSrcUrl,
        iframeRef,
        model,
        getProps,
        headerActiveKey,
        initial,
        loading,
        desformCode,
        desformName,
        showCloseButton,
        previewIsFullscreen,
        close,
        onTabChange,
        onButtonDrawerCommand,
        getAutoDesFormUrl,
        buttonDrawerRef,
      };
    },
  });
</script>

<style scoped lang="less">
  .btn-loading-close {
    width: 80px;
    height: 36px;
    position: absolute;
    z-index: 999;
    top: 300px;
    left: calc(50% - 36px);

    color: #ff4d4f !important;
    background-color: #fff !important;
    border-color: #ff4d4f !important;

    &:hover {
      color: #fff !important;
      background-color: #ff4d4f !important;
      border-color: #ff4d4f !important;
    }

    &:active {
      color: #fff !important;
      background-color: #cf1322 !important;
      border-color: #cf1322 !important;
    }
  }
</style>

<style lang="less">
  .design-form-modal {
    .ant-modal {
      .ant-modal-header {
        padding: 0;

        .ant-modal-title span {
          cursor: default;
        }
      }

      .ant-modal-body {
        height: calc(100% - 47px);

        .scrollbar {
          padding: 0;
        }
      }

      .scroll-container .scrollbar__wrap {
        margin-bottom: 0 !important;
      }

      // update-begin--author:sunjianlei---date:20220725---for: 表单设计器页面切换tab样式
      .desform-modal-header {
        display: flex;

        .desform-modal-title {
          position: relative;
          display: flex;
          padding: 12px 18px;
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          color: rgba(0, 0, 0, 0.85);
          user-select: none;
          width: 30%;
        }

        .desform-modal-tabs {
          display: flex;
          position: relative;
          flex: 1;
          justify-content: center;

          .ant-tabs-nav {
            margin: 0;
            font-weight: normal;
            border-bottom: none;

            &,
            .ant-tabs-nav-container {
              height: 100%;
            }

            .ant-tabs-tab {
              min-width: 80px;
              text-align: center;
            }

            .ant-tabs-ink-bar {
              bottom: 0;
            }
          }
        }

        .desform-modal-right {
          position: relative;
          display: flex;
          width: 30%;
        }
      }

      // update-end--author:sunjianlei---date:20220725---for: 表单设计器页面切换tab样式
    }
  }
</style>
