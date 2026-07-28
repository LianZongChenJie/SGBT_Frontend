<!-- 表单设计器 —— 查询工作表 中转组件 -->
<template>
  <div v-show="visible" :class="[prefixCls]">
    <a-spin :spinning="loading">
      <iframe ref="iframeRef" :src="iframeSrc" frameborder="0" allow="geolocation *; microphone *; camera *; midi *; encrypted-media *;"></iframe>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref } from 'vue';
  import { getTenantId, getToken } from '@/utils/auth';
  import { randomString } from '@/utils/common/compUtils';
  import { useGlobSetting } from '@/hooks/setting';
  import { useRoute } from 'vue-router';
  import { useDesign } from '@/hooks/web/useDesign';
  import { sleep } from '@/utils';
  import { cloneDeep } from 'lodash-es';

  const glob = useGlobSetting();
  const route = useRoute();
  const { prefixCls } = useDesign('desform-data-linkage-modal');

  const props = defineProps({
    desformCode: {
      type: String,
      default: '',
      required: true,
    },
  });

  const loading = ref(true);
  const visible = ref(false);
  // 消息id（用于区分消息传递）
  const messageId = randomString(16);

  const iframeSrc = ref(getIframeSrc());

  const iframeRef = ref<HTMLIFrameElement>();

  type RulesType = Recordable[];

  let callbackFn: (rules: RulesType) => void;

  // 添加监听事件
  window.addEventListener(
    'message',
    async function (event) {
      const payload = event.data;
      if (`${messageId}` !== payload.messageId) {
        return;
      }
      const { type, data } = payload;
      switch (type) {
        case 'update:visible':
          if (!data) {
            await sleep(150);
          }
          visible.value = data;
          break;
        case 'update:loading':
          loading.value = data;
          break;
        case 'created':
          loading.value = false;
          break;
        case 'mounted':
          sendEvent('update:visible', true);
          break;
        case 'ok':
          console.log('modal - callback ok :', data);
          if (typeof callbackFn === 'function') {
            callbackFn(data);
          }
          break;
      }
    },
    false
  );

  type OpenParamsType = {
    // 要查询的工作表编码
    desformCode: string;
    // 是否需要显示系统字段
    needSystemFields: boolean;
    widgetKey: string;
    widgetKeys?: string[];
    rules: RulesType;
    callback: typeof callbackFn;
  };

  // 打开查询工作表弹窗
  async function open(params: OpenParamsType) {
    visible.value = true;
    loading.value = true;
    await nextTick();
    iframeRef.value?.focus();
    const advancedSetting: Recordable = {
      defaultValue: { type: 'compose', value: '' },
    };
    if (Array.isArray(params.rules) && params.rules.length > 0) {
      advancedSetting.defaultValue.type = 'linkage';
      advancedSetting.defaultValue.value = {
        sorts: [],
        linkages: [],
        rules: params.rules,
        desformCode: params.desformCode,
      };
    }

    sendEvent('setup', {
      advancedSetting,
      widgetKey: params.widgetKey,
      widgetKeys: params.widgetKeys,
      needSystemFields: params.needSystemFields,
      props: {
        visible: true,
        isMultiple: false,
        isSuperQueryMode: true,
        customModel: {
          desformCode: params.desformCode,
        },
        fixedCode: params.desformCode,
        selectFormProps: {
          otherApp: 'never',
        },
      },
    });
    callbackFn = params.callback;
  }

  function getIframeSrc() {
    const { domainUrl } = glob;
    let url = domainUrl + '/desform/comp/dataLinkageDialog/' + props.desformCode;
    url += `?messageId=${messageId}`;
    if (route.params.appId) {
      url += `&lowAppId=${route.params.appId}`;
    }
    url += `&tenantId=${getTenantId()}`;
    url += `&token=${getToken()}`;
    return url;
  }

  /** iframe 发送消息 */
  function sendEvent(type, data = {}) {
    data = cloneDeep(data);
    iframeRef.value?.contentWindow?.postMessage({ messageId, type, data }, '*');
  }

  defineExpose({
    // 打开查询工作表弹窗
    open,
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-desform-data-linkage-modal';

  .@{prefix-cls} {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;

    &,
    & .ant-spin-nested-loading,
    & .ant-spin-container,
    & iframe {
      width: 100%;
      height: 100%;
    }
  }
</style>
