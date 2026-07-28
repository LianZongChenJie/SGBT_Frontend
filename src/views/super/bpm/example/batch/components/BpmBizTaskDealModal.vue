<template>
  <!-- 批量业务办理弹出框 -->
  <a-modal :open="visible" width="100%" destroyOnClose :bodyStyle="bodyStyle" style="top: 0" :footer="null" @cancel="handleModalCancel">
    <a-spin :spinning="confirmLoading">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        当前任务环节：
        <a-select style="width: 300px" :defaultValue="currTask.id">
          <a-select-option :value="currTask.id">{{ currTask.taskName }}</a-select-option>
        </a-select>
        <template v-if="!currTask.suspendFlag">
          <template v-if="currTask.taskClaimFlag">
            <a-button @click="handleClaim()" type="primary" preIcon="ant-design:caret-right-outlined">签收</a-button>
          </template>
          <template v-else>
            <a-button @click="handleOpt('submit')" type="primary" preIcon="ant-design:caret-right-outlined">发送</a-button>
            <a-button @click="handleOpt('reject')" type="primary" preIcon="ant-design:rollback-outlined">退回</a-button>
            <a-button @click="selectEntruster()" type="primary" preIcon="ant-design:user-outlined">委托</a-button>
            <a-button @click="handleSuspend()" type="primary" preIcon="ant-design:lock-outlined">挂起</a-button>
          </template>
        </template>
        <template v-else>
          <a-button @click="handleActive()" type="primary" preIcon="ant-design:unlock-outlined">解挂</a-button>
        </template>
        <span style="color: red" v-if="currTask.suspendFlag">当前流程已挂起，需要进行解挂，再进行办理！</span>
      </div>
      <div>
        <template v-if="isComp">
          <DynamicLink :path="path" :formData="formData"></DynamicLink>
        </template>
        <template v-else>
          <iframe :src="iframeUrl" frameborder="0" width="100%" :height="height" scrolling="auto"></iframe>
        </template>
      </div>
    </a-spin>
    <DelegateModal @register="registerModal" @success="handleEntruster"></DelegateModal>
    <BpmBizTaskOptModal ref="bpmBizTaskOptModal" :formData="formData" @success="completeProcess"></BpmBizTaskOptModal>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs, computed, getCurrentInstance } from 'vue';
  import DelegateModal from '/src/views/super/bpm/process/manage/components/DelegateModal.vue';
  import DynamicLink from '/src/views/super/bpm/process/manage/components/DynamicLink.vue';
  import BpmBizTaskOptModal from './BpmBizTaskOptModal.vue';
  import { isUrl, getBpmFormUrl } from '/src/utils/is';
  import { getToken } from '/src/utils/auth';
  import { useGlobSetting } from '/src/hooks/setting';
  import { useMessage } from '/src/hooks/web/useMessage';
  import { useModal } from '/src/components/Modal';
  import { claim, taskEntrust, suspend, restart } from '/src/views/super/bpm/process/manage/components/bpm.api.ts';

  export default defineComponent({
    name: 'BpmBizTaskDealModal',
    components: {
      DynamicLink,
      DelegateModal,
      BpmBizTaskOptModal,
    },
    props: ['path', 'formData'],
    emits: ['ok'],
    setup(props, { emit }) {
      const globSetting = useGlobSetting();
      const { createMessage, createConfirm } = useMessage();
      //委派弹窗
      const [registerModal, { openModal }] = useModal();

      //弹窗示例
      const instance = getCurrentInstance();

      const data = reactive({
        loading: false,
        title: '流程',
        visible: false,
        confirmLoading: false,
        currTask: {},
        bodyStyle: {
          padding: '0',
          height: window.innerHeight + 'px',
          'overflow-y': 'auto',
        },
        iframeUrl: '',
      });

      let TOKEN = getToken();
      let DOMAIN_URL = globSetting.domainUrl;
      let TASKID = props.formData.taskDefKey;
      //是否组件
      const isComp = computed(() => {
        //获取流程审批url
        //let URL = (props.path || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)); // URL支持{{ window.xxx }}占位符变量
        let URL = getBpmFormUrl(props.path, TOKEN, DOMAIN_URL, TASKID);
        
        if (isUrl(URL)) {
          data.iframeUrl = URL;
          return false;
        }
        return true;
      });

      // 关闭模态框
      function handleModalCancel() {
        data.visible = false;
      }

      /**
       * 打开弹窗处理数据
       * @param processData
       */
      function deal(processData) {
        console.log('-----任务办理组件数据：-------', processData);
        let taskList = processData.bizTaskList;
        data.currTask = taskList && taskList.length > 0 ? taskList[0] : {};
        data.visible = true;
      }

      /**
       * 完成
       */
      function completeProcess() {
        data.visible = false;
        emit('ok');
      }

      /**
       * 发送
       * @param opt
       */
      function handleOpt(opt) {
        console.log('handleOpt', opt);
        instance.refs.bpmBizTaskOptModal.deal(opt);
        instance.refs.bpmBizTaskOptModal.data.title = opt == 'submit' ? '发送' : '退回';
      }
      //签收
      function handleClaim() {
        let params = { taskId: data.currTask?.id }; //查询条件
        createConfirm({
          title: '确认签收吗',
          centered: false,
          content: '是否签收该任务?',
          onOk: async () => {
            data.confirmLoading = true;
            let res = await claim(params);
            data.confirmLoading = false;
            if (res.success) {
              createMessage.success(res.message);
              completeProcess();
            } else {
              createMessage.warning(res.message);
            }
          },
        });
      }
      //委托
      function selectEntruster() {
        openModal(true);
      }

      /**
       * 委派选择回调
       * @param data
       */
      async function handleEntruster(obj) {
        let params = { taskId: data.currTask.id, taskAssignee: obj.username };
        await taskEntrust(params, (res) => {
          if (res.success) {
            createMessage.success(res.message);
            completeProcess();
          } else {
            createMessage.warning(res.message);
          }
        });
      }
      //挂起
      function handleSuspend() {
        let params = { processInstanceId: data.currTask?.procInstId }; //查询条件
        createConfirm({
          title: '确认挂起吗',
          centered: false,
          content: '是否挂起该任务?',
          onOk: async () => {
            data.confirmLoading = true;
            let res = await suspend(params);
            data.confirmLoading = false;
            if (res.success) {
              createMessage.success(res.message);
              completeProcess();
            } else {
              createMessage.warning(res.message);
            }
          },
        });
      }

      /**
       * 解挂
       */
      function handleActive() {
        let params = { processInstanceId: data.currTask?.procInstId }; //查询条件
        createConfirm({
          title: '确认解挂吗',
          centered: false,
          content: '是否解挂该任务?',
          onOk: async () => {
            data.confirmLoading = true;
            let res = await restart(params);
            data.confirmLoading = false;
            if (res.success) {
              createMessage.success(res.message);
              completeProcess();
            } else {
              createMessage.warning(res.message);
            }
          },
        });
      }
      return {
        handleModalCancel,
        handleOpt,
        handleClaim,
        selectEntruster,
        handleEntruster,
        handleActive,
        handleSuspend,
        completeProcess,
        deal,
        registerModal,
        isComp,
        ...toRefs(data),
      };
    },
  });
</script>

<style lang="less" scoped>
  html[data-theme='light'] {
    .ant-alert {
      color: rgba(0, 0, 0, 0.85);
    }
  }
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px;
  }
  .ant-alert {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    
    font-size: 14px;
    font-variant: tabular-nums;
    line-height: 1.5715;
    list-style: none;
    font-feature-settings: tnum;
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 15px;
    word-wrap: break-word;
    border-radius: 2px;
  } 
  .ant-alert-info {
    background-color: @alert-info-bg-color;
    border: 1px solid @alert-info-border-color;
  }
</style>
