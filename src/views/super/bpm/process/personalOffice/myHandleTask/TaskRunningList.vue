<template>
  <BasicTable @register="registerTable">
    <template #bpmBizTitle="{ text, record }">
      <notification-two-tone v-if="record.taskUrge" title="催办提醒" twoToneColor="#eb2f96" @click="taskNotify(record)" />
      <j-ellipsis :value="text" :length="15" />
    </template>

    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"></TableAction>
    </template>
  </BasicTable>

  <!-- 催办 -->
  <task-notify-me-modal @register="registerNotifyModal"></task-notify-me-modal>

  <!-- 办理 -->
  <task-handle-modal @register="registerHandleModal" @success="reload"></task-handle-modal>

  <!-- 委托 -->
  <select-entruster-modal @register="registerEntrusterModal" @selected="selectedEntruster"></select-entruster-modal>

  <!-- 转办 -->
  <select-entruster-modal @register="registerComplaintModal" @selected="selectedComplaint"></select-entruster-modal>
</template>

<script>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useTaskList } from './useTaskList';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import { NotificationTwoTone } from '@ant-design/icons-vue';
  import TaskNotifyMeModal from './modal/TaskNotifyMeModal.vue';
  import TaskHandleModal from './modal/TaskHandleModal.vue';
  import { useModal } from '/@/components/Modal';
  import SelectEntrusterModal from './modal/SelectEntrusterModal.vue';
  import { taskEntrust, taskClaim, taskComplaint } from './task.handle.api';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  
  export default {
    name: 'TaskRunningList',
    components: {
      BasicTable,
      TableAction,
      JEllipsis,
      NotificationTwoTone,
      TaskNotifyMeModal,
      TaskHandleModal,
      SelectEntrusterModal,
    },

    setup() {
      const { registerTable, reload, getTaskNodeInfo } = useTaskList('run');
      const userStore = useUserStore();
      const { createMessage } = useMessage();
      //催办
      const [registerNotifyModal, { openModal: openNotifyModal }] = useModal();
      function taskNotify(record) {
        openNotifyModal(true, {
          procInstId: record.processInstanceId,
        });
      }

      //办理
      const [registerHandleModal, { openModal: openHandleModal }] = useModal();
      async function handleProcess(record) {
        let { formData, formUrl } = await getTaskNodeInfo(record);
        formData['PROCESS_TAB_TYPE'] = 'run';
        openHandleModal(true, {
          formData,
          formUrl,
          title: '流程办理',
        });
      }

      // 委托
      const [registerEntrusterModal, { openModal: openEntrusterModal }] = useModal();
      // 转办
      const [registerComplaintModal, { openModal: openComplaintModal }] = useModal();
      // 委托——弹出选择界面
      function handleSelectEntruster(record) {
        openEntrusterModal(true, {
          taskId: record.id,
        });
      }
      // 转办——弹出选择界面
      function handleComplaintEntruster(record) {
        openComplaintModal(true, {
          taskId: record.id,
        });
      }
      
      // 委托——回调处理
      async function selectedEntruster(params) {
        console.log('委托', params);
        await taskEntrust(params);
        await reload();
      }
      // 转办——回调处理
      async function selectedComplaint(params) {
        console.log('转办', params);
        await taskComplaint(params);
        await reload();
      }

      //签收
      async function handleClaim(record) {
        let params = { taskId: record.id };
        await taskClaim(params);
        await reload();
      }

      function getTableAction(record) {
        let arr = [];
        if (record.taskAssigneeId && record.taskAssigneeId != '') {
          arr.push({
            label: '办理',
            onClick: handleProcess.bind(null, record),
          });
        } else {
          arr.push({
            label: '签收',
            popConfirm: {
              title: '确定签收吗？',
              placement: 'left',
              confirm: handleClaim.bind(null, record),
            },
          });
        }
       
        arr.push({
          label: '转办',
          onClick: handleComplaintEntruster.bind(null, record),
        });

        arr.push({
          label: '委托',
          onClick: handleSelectEntruster.bind(null, record),
        });
        return arr;
      }

      /**
       * 消息跳转时打开表单页面的逻辑
       * @param taskId
       */
      async function openHrefModal(taskId){
        let { formData, formUrl, isSignTask, taskIsHandel, assignee } = await getTaskNodeInfo({id: taskId });
        if(taskIsHandel==true){
          //如果已经处理过了
          return;
        }
        let username = userStore.getUserInfo.username;
        if(assignee && username!=assignee){
          //不是你办理的任务
          createMessage.warning('任务已被他人签收~')
          return;
        }
        formData['PROCESS_TAB_TYPE'] = 'run';
        openHandleModal(true, {
          formData,
          formUrl,
          isSignTask,
          title: '流程办理',
        });
      }
      
      
      return {
        registerTable,
        taskNotify,
        registerNotifyModal,
        registerHandleModal,
        getTableAction,
        reload,
        selectedEntruster,
        selectedComplaint,
        registerEntrusterModal,
        registerComplaintModal,
        openHrefModal
      };
    },
  };
</script>

<style scoped></style>
