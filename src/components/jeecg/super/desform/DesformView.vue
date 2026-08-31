<template>
  <a-spin v-bind="spinProps">
    <iframe
      ref="iframeRef"
      :class="iframeClass"
      v-if="!reloading"
      v-bind="iframeProps"
      :height="height"
      allow="geolocation *; microphone *; camera *; midi *; encrypted-media *;"
      style="position: absolute; z-index: 1"
      :id="iframeId"
    ></iframe>
    <!-- 占位DIV -->
    <div
      :style="{
        height: getHeight,
        position: 'relative',
        zIndex: 0,
      }"
    >
    </div>
  </a-spin>
  <!-- 递归组件，用于任意弹窗功能 -->
  <AutoDesformDataFullScreen
    v-if="!!linkDialog.desformCode"
    @register="registerDataModal"
    @success="onLinkDialogSuccess"
    @close="linkDialog.desformCode = ''"
  />
</template>

<script lang="ts">
  import { ref, nextTick, defineComponent, computed, watch, reactive } from 'vue';
  import { router } from '/@/router';
  import { defHttp } from '/@/utils/http/axios';
  import { propTypes } from '/@/utils/propTypes';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getToken, getTenantId } from '/@/utils/auth';
  import { randomString, stringIsNull } from '/@/utils/common/compUtils';
  import { DESFORM_ROUTE_DATA_ID, DESFORM_ROUTE_FORM_CODE, DESFORM_ROUTE_TYPE } from '/@/utils/super/desform/desformRouteUtils';
  import { useModal } from '/@/components/Modal';
  import AutoDesformDataFullScreen from '/@/views/super/online/desform/auto/AutoDesformDataFullScreen.vue';

  enum Api {
    add = '/desform/data/add',
    edit = '/desform/data/edit',
    online = '/online/cgform/api/crazyForm',
  }

  /* desform 动态表单页面 */
  export default defineComponent({
    name: 'DesformView',
    components: { AutoDesformDataFullScreen },
    props: {
      iframeId: propTypes.string,
      // add = 新增，edit = 修改，detail = 只读查看
      mode: propTypes.string.isRequired,
      // 表单code
      desformCode: propTypes.string.def(''),
      // 数据id
      dataId: propTypes.string,
      // 视图id
      viewId: propTypes.string,
      // 应用id
      lowAppId: propTypes.string,
      //button id
      customButtonId: propTypes.string.def(''),
      // 是否显示提示框
      alert: propTypes.bool.def(true),
      // 高度
      height: propTypes.string,
      // 最小高度
      minHeight: propTypes.number,
      // 是否内部展示 dialog（form 外面套个dialog））—— 解决popup局部定位问题
      innerDialog: propTypes.bool.def(false),
      // 是否是触发vue3事件弹关联记录
      eventDialog: propTypes.bool.def(true),
      // 数据保存成功后是否跳转到结果页面
      skipPage: propTypes.bool.def(true),
      // 是否是对接online的表单
      isOnline: propTypes.bool.def(false),
      class: propTypes.any,
      // 是否是是关联表单
      isLinkDialog: propTypes.bool.def(false),
      // form默认值
      defaultFormData: propTypes.object,
      // 组件配置 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
      widgetConfig: propTypes.array,
      // 父级html
      parentNode: { type: Object as PropType<HTMLElement> },
      // 是否显示页脚（保存按钮等）
      showFooter: propTypes.bool.def(true),
      // 外传url
      url: propTypes.string.def(''),
      // taskId
      taskId: propTypes.string.def(''),
      // 是否触发流程（审批流程中的表单修改数据不触发流程）
      triggerProcess: propTypes.string.def(''),
    },
    emits: ['reload', 'success', 'error', 'close', 'force-close', 'dialogChange', 'formLoadingChange'],
    setup(props, { emit }) {
      const { createMessage: $message, createErrorModal: $error } = useMessage();
      const { domainUrl } = useGlobSetting();
      const iframeRef = ref<HTMLIFrameElement>();

      // 为了防止多个页面混淆的id
      const messageId = randomString(16);
      const reloading = ref(false);
      const pageLoading = ref(true);
      const loading = ref(false);
      const fullScreen = ref(false);
      const transparent = ref(false);
      const iframeHeight = ref(300);
      const innerDesformCode = ref(props.desformCode);
      // 已打开的弹窗数量
      const dialogCount = ref(0);
      let dialogChangeTime = 0;
      const otherParams = ref('');
      // 关联字段表单
      const linkDialog = reactive({
        desformCode: '',
        dataId: '',
        eventKey: '',
      });
      const [registerDataModal, dataModal] = useModal();

      // iframe实际高度
      const getHeight = computed(() => {
        if (props.height) {
          return props.height;
        }
        if (props.minHeight && iframeHeight.value < props.minHeight) {
          return props.minHeight + 'px';
        }
        return iframeHeight.value + 'px';
      });
      const iframeClass = ref<any[]>([]);
      const iframeProps = computed(() => {
        //update-begin---author:scott ---date:2024-05-29  for：【TV360X-726】我发起的流程，历史查看设计器的表单，看不到---
        // 敲敲云下，解决表单打开太快会有404情况---
        if(!innerDesformCode.value && !props.url){
          console.log("--- computed desformCode value : 空值，不渲染表单 ---")
          return null;
        }
        //update-end---author:scott ---date::2024-05-29  for：【TV360X-726】我发起的流程，历史查看设计器的表单，看不到--
        
        let dataId = props.dataId == null ? 'add' : props.dataId;
        // 拼接 iframe 的 src 属性
        let src;
        if (props.isOnline) {
          // online表单集成表单设计器
          src = `${domainUrl}/desform/${props.mode}/online/${innerDesformCode.value}`;
        } else {
          src = `${domainUrl}/desform/${props.mode}/${innerDesformCode.value}`;
        }

        console.log(" ===desformCode======src====", src)
        
        // 修改和查看都需要传递 dataId 参数
        if (props.mode === 'edit' || props.mode === 'detail') {
          src += `/${dataId}`;
        }
        
        //update-begin-author:taoyan date:2023-2-13 for: 支持外传url
        if(props.url && props.url.length>0){
          src = props.url
        }
        // 传递 token NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
        if(src.indexOf('token=')<0){
          if(src.indexOf('?')>0){
            src += `&token=${getToken()}`;
          }else{
            src += `?token=${getToken()}`;
          }
        }
        src += `&messageId=${messageId}`;
        // QQYUN-3684【应用-流程】低代码里面的审批页面，加载表单的时候，没有传递taskid
        if(props.taskId){
          if(src.indexOf('taskId=')<0){
            src += `&taskId=${props.taskId}`;
          }
        }
        //update-end-author:taoyan date:2023-2-13 for: 支持外传url
        // QQYUN-3684【应用-流程】低代码里面的审批页面，加载表单的时候，没有传递taskid
        if(props.triggerProcess){
          if(src.indexOf('triggerProcess=')<0){
            src += `&triggerProcess=${props.triggerProcess}`;
          }
        }
        //update-end-author:taoyan date:2023-2-13 for: 支持外传url
        
        if (props.customButtonId) {
          src += `&buttonId=${props.customButtonId}`;
        }
        // 兼容多租户
        let tenantId = getTenantId();
        if (!stringIsNull(tenantId)) {
          src += `&tenantId=${tenantId}`;
        }
        // 数据弹窗模式
        src += `&eventDialog=${props.eventDialog}`;
        // 内部展示对话框
        src += `&innerDialog=${props.innerDialog}`;
        if (props.innerDialog || props.skipPage === false) {
          // 是否跳转到成功页面，如果不跳转就触发success事件
          src += `&skip=false`;
        }
        // iframe的内部请求
        src += `&innerRequest=true`;
        // 关闭iframe的内部滚动
        src += `&disableScroll=true`;
        // 是否是透明背景
        src += `&transparent=${transparent.value}`;
        // 是否显示页脚
        src += `&showFooter=${props.showFooter}`;
        // 关联弹窗
        src += `&isLinkDialog=${props.isLinkDialog}`;
        // form默认值（此逻辑作废，改为后台通过buttonId查询）
        if (props.defaultFormData) {
          src += `&defaultFormData=${encodeURIComponent(JSON.stringify(props.defaultFormData))}`;
        }
        // 组件配置（此逻辑作废，改为后台通过buttonId查询）
        if (props.widgetConfig) {
          src += `&widgetConfig=${encodeURIComponent(JSON.stringify(props.widgetConfig))}`;
        }
        // 视图id
        if (props.viewId) {
          src += `&viewId=${props.viewId}`;
        }
        // 应用id
        if (props.lowAppId) {
          src += `&lowAppId=${props.lowAppId}`;
        }
        // 重写一些vue的原型方法
        src += `&doOverrideVuePrototype=true`;
        // 其他参数
        src += otherParams.value;
        return {
          src,
          style: {
            width: '100%',
            height: getHeight.value,
            overflow: 'hidden',
            transition: props.height ? null : 'height 0.3s',
          },
          frameborder: '0',
        };
      });

      const spinProps = computed(() => {
        return {
          spinning: pageLoading.value || loading.value,
          class: props.class,
        };
      });

      watch(
        () => props.desformCode,
        () => (innerDesformCode.value = props.desformCode)
      );

      // watch 如果传了parentNode，则将iframe设为透明背景
      watch(
        () => props.parentNode,
        () => {
          transparent.value = !!props.parentNode;
        },
        { immediate: true }
      );

      window.addEventListener(
        'message',
        function (event) {
          let payload = event.data;

          if (`${messageId}` !== payload.messageId) {
            return;
          }

          switch (payload.type) {
            case 'close':
              handleClose();
              break;
            case 'success':
              emit('success', payload.data);
              break;
            case 'reload':
              handleReload();
              break;
            case 'route-jump':
              handleRouteJump(payload.data);
              break;
            case 'save':
              saveAllData(payload.data);
              break;
            case 'height-change':
              if (!fullScreen.value) {
                iframeHeight.value = payload.data + 10;
                pageLoading.value = false;
              }
              break;
            // 弹窗数量发生变化
            case 'dialog-change':
              dialogChangeTime = payload.data.time;
              dialogCount.value += payload.data.value ? 1 : -1;
              emit('dialogChange', payload.data.value);
              break;
            // 重置弹窗数量，一般是在刷新内部iframe时触发
            case 'dialog-change-reset':
              dialogChangeTime = Date.now()
              dialogCount.value = payload.data;
              break;
            case 'form-loading-change':
              emit('formLoadingChange', payload.data);
              break;
            case 'show-message':
              $message[payload.data.type](payload.data.message);
              break;
            case 'force-close':
              emit('force-close', payload.data);
              break;
            case 'open-link-form':
              linkDialog.desformCode = payload.data.desformCode;
              linkDialog.dataId = payload.data.dataId;
              linkDialog.eventKey = payload.data.eventKey;
              break;
          }
        },
        false
      );

      // 如果超过6秒还没有得到子组件的反馈，就自动停止
      setTimeout(() => {
        if (pageLoading.value) {
          pageLoading.value = false;
        }
      }, 6000);

      async function reload() {
        reloading.value = true;
        await nextTick();
        reloading.value = false;
      }

      // 监听弹窗数量变化
      watch(dialogCount, (val, oldVal) => {
        let diff = Date.now() - dialogChangeTime;
        if (val === 1 && oldVal === 0) {
          // console.warn('[d-c]:view 开启 dialogChange:', {val, oldVal, _: Date.now(), diff})
          // 开启全屏模式
          onDialogChange(true, diff);
        } else if (val === 0 && oldVal >= 1) {
          // console.warn('[d-c]:view 关闭 dialogChange:', {val, oldVal, _: Date.now(), diff})
          // 关闭全屏模式
          onDialogChange(false, diff);
        }
      });

      /**
       * iframe内部弹窗打开或关闭时，动态调节iframe大小
       * @param isVisible
       * @param messageTime 消息间隔时间，间隔时间越长则说明设备性能越差，需要优化
       */
      function onDialogChange(isVisible: boolean, messageTime = 0) {
        if (iframeRef.value == null || props.parentNode == null) {
          return;
        }

        // 约定时间，为了同步 iframe 内和外的动画时间，双方在同一约定时间时执行动作，避免因为动画时间不同步导致的闪烁
        let cehiToken = 'NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ=='
        let agreedTime = Date.now() + (isVisible ? 10 : 220);

        if (messageTime >= 350) {
          agreedTime = agreedTime + 150 + Math.round(messageTime / 2)
        } else if (messageTime >= 300) {
          agreedTime = agreedTime + 100 + Math.round(messageTime / 2)
        } else if (messageTime >= 150) {
          agreedTime = agreedTime + 50 + Math.round(messageTime / 2)
        } else if (messageTime >= 50) {
          agreedTime = agreedTime + 50;
        } else {
        }

        fullScreen.value = isVisible;
        if (isVisible) {
          // 获取iframe的位置与大小
          let iframeRect = iframeRef.value.getBoundingClientRect();
          // 获取父级的位置与大小
          let parentRect = props.parentNode.getBoundingClientRect();
          // 获取父级的滚动条位置
          let parentScroll = {
            top: props.parentNode.scrollTop,
            left: props.parentNode.scrollLeft,
            width: props.parentNode.scrollWidth,
            height: props.parentNode.scrollHeight,
          };
          // iframe相对于父级的位置
          let relativeRect = {
            top: iframeRect.top - parentRect.top + parentScroll.top,
            left: iframeRect.left - parentRect.left + parentScroll.left,
          };
          // console.warn('[d-c]:view 发送 body:useRect:', {
          //   slow: messageTime >= 50,
          //   _: Date.now(),
          //   距离约定时间剩余ms: agreedTime - Date.now(),
          // })

          const sendFn = () => sendEvent('body:useRect', {
            iframeRect,
            parentRect,
            parentScroll,
            relativeRect,
            agreedTime
          });
          const setClsFn = () => {
            iframeClass.value = ['fullscreen'];
            // console.warn('[d-c]:view 全屏:', {_: Date.now()})
          }
          sendFn();
          setTimeout(setClsFn, agreedTime - Date.now());
          // if (messageTime < 50) {
          //   sendFn();
          //   setTimeout(setClsFn, 2);
          // } else {
          //   setTimeout(setClsFn, 0);
          //   sendFn();
          // }

        } else {
          const sendFn = () => {
            sendEvent('body:cancelRect', {agreedTime})
            // console.warn('[d-c]:view 发送 body:cancelRect:', {
            //   _: Date.now(),
            //   距离约定时间剩余ms: agreedTime - Date.now(),
            // })
          }
          const setClsFn = () => {
            iframeClass.value = []
            // console.warn('[d-c]:view 关闭全屏:', {_: Date.now()})
          }
          sendFn();
          setTimeout(setClsFn, agreedTime - Date.now());
        }
      }

      async function saveAllData(query: Recordable) {
        let url = Api.add;
        let method: any = 'post';
        let params = {
          desformCode: innerDesformCode.value,
          desformDataJson: JSON.stringify(query.json),
        };
        if (query.onlineForm) {
          params['onlineFormCode'] = query.onlineForm;
          params['onlineFormDataId'] = query.onlineDataId;
        }

        if (props.dataId != null) {
          url = Api.edit;
          method = 'put';
          params['id'] = props.dataId;
        }
        loading.value = true;

        // 提交到数据表 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
        try {
          let res = await defHttp.request({ url, params, method }, { isTransformResponse: false });

          if (res.success) {
            // props.dataId = res.result.dataId;
            let customURLFail = res.result.customURLFail;
            if (customURLFail) {
              emit('error', { res });
              // 动态显示 alert
              props.alert && $error({ title: '保存失败', content: res.message });
            } else {
              // 关联表单弹窗不自动关闭表单
              if (!props.isLinkDialog) {
                emit('success', { res, dataId: props.dataId });
                // 动态显示 alert
                props.alert && $message.success('保存成功');
              }
            }
          } else {
            emit('error', { res });
            // 动态显示 alert
            props.alert && $error({ title: '保存失败', content: res.message });
          }
        } finally {
          loading.value = false;
        }
      }

      function handleClose() {
        emit('close');
      }

      function handleReload() {
        emit('reload');
      }

      function doActionSubmit(data) {
        sendEvent('action:submit', data);
      }

      /** 处理路由跳转 */
      async function handleRouteJump(data) {
        handleReload();
        let {
          nextRouteConfig: { routeType, routePath },
          dataId,
        } = data;
        let params = `?${DESFORM_ROUTE_DATA_ID}=${dataId}&${DESFORM_ROUTE_FORM_CODE}=${innerDesformCode.value}`;
        if (routeType === DESFORM_ROUTE_TYPE.form) {
          innerDesformCode.value = routePath;
          otherParams.value = '&' + params.substring(1);
        } else if (routeType === DESFORM_ROUTE_TYPE.menu) {
          await routeJumpNextTick();
          router.push(routePath + params);
        } else if (routeType === DESFORM_ROUTE_TYPE.href) {
          await routeJumpNextTick();
          window.open(routePath + params, '_blank');
        }
      }

      function routeJumpNextTick() {
        handleClose();
        return nextTick();
      }

      // 重写弹窗注册方法逻辑
      function registerDataModalOverwrite(modalMethod, uuid) {
        registerDataModal(modalMethod, uuid);
        if (linkDialog.desformCode) {
          // 关联记录数据处理模式
          let mode = !linkDialog.dataId ? 'add' : 'edit';
          dataModal.openModal(true, {
            // 如果当前表单为detail模式，那么关联记录也强制为detail模式
            mode: props.mode === 'detail' ? 'detail' : mode,
            desformCode: linkDialog.desformCode,
            dataId: linkDialog.dataId,
            isOnline: false,
            isLinkDialog: true,
          });
        }
      }

      // 当关联记录表单填写完毕后触发
      function onLinkDialogSuccess(data) {
        //update-begin---author:scott ---date:2023-08-14  for：【QQYUN-6271】任务办理填报表单，添加子表数据 显示已删除---
        let dataId = data.dataId;
        let { newData } = data;
        //update-begin---author:scott ---date:2023-08-14  for：【QQYUN-6271】任务办理填报表单，添加子表数据 显示已删除---
        sendEvent('link-form:success', {
          dataId,
          newData,
          eventKey: linkDialog.eventKey,
        });
      }

      // 调用系统打印
      function doPrint() {
        sendEvent('action:print');
      }

      /** iframe 发送消息 */
      function sendEvent(type, data = {}) {
        iframeRef.value?.contentWindow?.postMessage({ messageId, type, data }, '*');
      }

      return {
        iframeRef,

        reload,
        reloading,
        loading,
        pageLoading,
        spinProps,
        getHeight,
        iframeProps,
        iframeClass,
        iframeHeight,
        linkDialog,
        onLinkDialogSuccess,

        doPrint,
        sendEvent,
        doActionSubmit,
        registerDataModal: registerDataModalOverwrite,
      };
    },
  });
</script>

<style scoped lang="less">
  // 全屏样式
  iframe.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 1999 !important;
    transition: none !important;
    overflow: hidden !important;
  }
</style>
