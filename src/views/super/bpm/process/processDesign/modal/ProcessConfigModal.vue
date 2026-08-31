<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    wrapClassName="jee-process-config-modal"
    width="90%"
    :footer="null"
    :title="title"
    keyboard
    defaultFullscreen
    :canFullscreen="false"
    destroyOnClose
  >
    <a-card class="card" :bordered="false">
      <a-tabs :activeKey="activeKey" tabPosition="left" @tabClick="handleChangePanel">
        <a-tab-pane tab="流程节点" key="1">
          <process-node-list :process-id="processId"></process-node-list>
        </a-tab-pane>

        <a-tab-pane tab="业务关联" key="2">
          <process-form-list :process-id="processId"></process-form-list>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { getToken } from '/@/utils/auth';
  import ProcessNodeList from '../processNode/ProcessNodeList.vue';
  import ProcessFormList from '../processForm/ProcessFormList.vue';

  export default {
    name: 'ProcessConfigModal',
    components: {
      BasicModal,
      ProcessNodeList,
      ProcessFormList,
    },
    emits: ['success', 'register'],
    setup(props, { emit }) {
      const bodyStyle = {
        padding: '0',
        height: window.innerHeight - 25 + 'px',
      };
      const processId = ref('');
      const activeKey = ref('1');
      const title = ref('');

      //useModalInner
      const [registerModal] = useModalInner((data) => {
        console.log('data', data);
        title.value = '流程【' + data.processName + '】配置';
        processId.value = data.id;
      });

      function handleChangePanel(key) {
        activeKey.value = key;
      }

      return {
        registerModal,
        bodyStyle,
        processId,
        activeKey,
        title,
        handleChangePanel,
      };
    },
  };
</script>

<style lang="less">
  // update-begin--author:liaozhiyang---date:20240521---for：【TV360X-241】流程设计的表单关联页面样式调整
  .card {
    height: 100%;
  }
  // update-end--author:liaozhiyang---date:20240521---for：【TV360X-241】流程设计的表单关联页面样式调整
</style>
