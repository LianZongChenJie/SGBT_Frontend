<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    wrapClassName="jee-process-modal"
    width="100%"
    :style="{ top: '0', padding: '0' }"
    :bodyStyle="bodyStyle"
    :footer="null"
    :canFullscreen="false"
    keyboard
    defaultFullscreen
    destroyOnClose
    @cancel="handleClose"
  >
    <a-spin :spinning="spinningLoading">
      <iframe id="processDesign" :src="iframeSrc" :height="iframeHeight" @load="iframeLoaded" frameborder="0" width="100%" scrolling="auto"> </iframe>
    </a-spin>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { getToken, getTenantId } from '/@/utils/auth';

  export default {
    name: 'ProcessDesignModal',
    components: {
      BasicModal,
    },
    emits: ['success', 'register'],
    setup(props, { emit }) {
      const bodyStyle = {
        padding: '0',
        height: window.innerHeight + 'px',
      };
      const spinningLoading = ref(false);
      const iframeSrc = ref('');
      const iframeHeight = window.innerHeight - 5 + 'px';
      // NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==

      //useModalInner
      const [registerModal, { closeModal }] = useModalInner((data) => {
        console.log('data', data);
        spinningLoading.value = true;
        resetIframeUrl(data.id);
      });

      /**
       * 根据iframe加载完成,关闭spinning
       */
      function iframeLoaded() {
        spinningLoading.value = false;
      }

      /**
       * 每次进入页面 需重新设置iframe的地址
       */
      function resetIframeUrl(id) {
        //1.TOKEN获取
        let token = getToken();
        //2.租户ID获取
        let tenantIdUrlFragment = '&tenantId=' + getTenantId();
        
        const baseUrl = window._CONFIG['domianURL'] + '/act/designer/index';
        if (id != null && id != undefined && id != '') {
          iframeSrc.value = baseUrl + '?id=' + id + '&token=' + token + tenantIdUrlFragment;
        } else {
          iframeSrc.value = baseUrl + '?token=' + token + tenantIdUrlFragment;
        }
      }

      /**
       * iframe消息绑定-如果当前路由被缓存，需修改语法
       * 进入列表页面就会触发
       */
      onMounted(() => {
        window.addEventListener('message', handleMessage);
      });

      /**
       * iframe消息解绑-如果当前路由被缓存，需修改语法
       * 如果不解绑，会绑定多次
       * 切换路由页面就会触发
       */
      onBeforeUnmount(() => {
        window.removeEventListener('message', handleMessage);
      });
      /**
       * 处理iframe消息
       * @param event
       */
      function handleMessage(event) {
        const data = event.data;
        console.log('iframe message', data);
        if (data.cmd == 'saveProcessDef') {
          emit('success', data);
        }
      }
      
      /**
       * 关闭设计器窗口
       * 
       * @param event
       */
      function handleClose() {
        console.log(' --- 关闭设计器窗口 ---');
        //关闭窗口,清空历史流程设计URL
        iframeSrc.value = '';
        closeModal();
      }
      
      

      return {
        registerModal,
        bodyStyle,
        spinningLoading,
        iframeSrc,
        iframeHeight,
        iframeLoaded,
        handleClose
      };
    },
  };
</script>

<style lang="less">
  .jee-process-modal {
    .ant-modal-header {
      padding: 0 !important;
    }
    .ant-modal-body > .scrollbar {
      padding-top: 0;
    }
  }
</style>
