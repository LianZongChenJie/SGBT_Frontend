<template>
  <BasicModal
    :title="title"
    @register="registerModal"
    destroyOnClose
    wrapClassName="jeecg-online-modal"
    style="top: 0px"
    :footer="null"
    keyboard
    defaultFullscreen
    :canFullscreen="false"
    ref="modalRef"
  >
    <a-tabs v-model="activeKey" tabPosition="left">
      <a-tab-pane key="1">
        <template #tab> <file-text-outlined /><span>附加单据</span> </template>
        <BpmDynamicForm :path="taskFormUrl" :form-data="taskFormData" :parentNode="parentNode"/>
      </a-tab-pane>

      <a-tab-pane key="2">
        <template #tab> <user-outlined /><span>任务处理</span> </template>
        <task-handle-inner-content @success="handleSuccess" :form-data="taskFormData" :claim="claimStatus" @claimSuccess="claimSuccess"></task-handle-inner-content>
      </a-tab-pane>

      <a-tab-pane key="3">
        <template #tab> <partition-outlined /><span>流程图</span> </template>
        <task-trace-content :form-data="taskFormData" />
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script lang="ts">
  /**
   * 处理页面
   */
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref , nextTick , computed } from 'vue';
  import { UserOutlined, PartitionOutlined, FileTextOutlined } from '@ant-design/icons-vue';
  import TaskHandleInnerContent from '../content/TaskHandleInnerContent.vue';
  import TaskTraceContent from '../content/TaskTraceContent.vue';
  import BpmDynamicForm from '/@/views/super/bpm/process/components/BpmDynamicForm.vue';

  export default {
    name: 'TaskHandleModal',
    components: {
      BasicModal,
      UserOutlined,
      FileTextOutlined,
      PartitionOutlined,
      TaskHandleInnerContent,
      TaskTraceContent,
      BpmDynamicForm,
    },
    emits: ['success', 'register'],
    setup(_p, { emit }) {
      const title = ref('流程办理');
      const taskFormData = ref({});
      const taskFormUrl = ref('');
      //是否需要签收
      const claimStatus = ref(false);
      //useModalInner
      const [registerModal, { closeModal }] = useModalInner((data) => {
        console.log('流程办理', data);
        taskFormData.value = data.formData;
        taskFormUrl.value = data.formUrl;
        title.value = data.title;
        if(data.isSignTask==true){
          claimStatus.value = true
        }else{
          claimStatus.value = false;
        }
      });

      const activeKey = ref('1');

      // desformView 父级滚动条，只有传了此参数才会突破内部弹窗
      const modalRef = ref();
      const parentNode = computed(() => {
        return modalRef.value?.modalWrapperRef?.wrapperRef?.scrollbarRef?.wrap;
      });
      console.log("parentNode",parentNode)

      function handleSuccess() {
        emit('success');
        closeModal();
      }
      
      function claimSuccess(){
        claimStatus.value = false;
      }

      return {
        title,
        registerModal,
        activeKey,
        taskFormData,
        taskFormUrl,
        handleSuccess,
        claimStatus,
        claimSuccess,
        modalRef,
        parentNode
      };
    },
  };
</script>

<style lang="less" scoped>
  // update-begin--author:liaozhiyang---date:20231220---for：【QQYUN-7670】antd4兼容改造，附加单据页面loading图标偏上
  .ant-tabs {
    :deep(.ant-spin-nested-loading) {
      min-height: 200px;
    }
  }
  // update-end--author:liaozhiyang---date:20231220---for：【QQYUN-7670】antd4兼容改造，附加单据页面loading图标偏上
  // update-begin--author:liaozhiyang---date:20240605---for：【TV360X-1022】流程办理页面左侧固定不随滚动而滚动
  .ant-tabs {
    height: 100%;
    :deep(.ant-tabs-content-holder) {
      height: 100%;
      .ant-tabs-content {
        height: 100%;
        .ant-tabs-tabpane {
          height: 100%;
          padding-right: 6px;
          overflow-y: auto;
        }
      }
    }
  }
  // update-end--author:liaozhiyang---date:20240605---for：【TV360X-1022】流程办理页面左侧固定不随滚动而滚动
</style>
