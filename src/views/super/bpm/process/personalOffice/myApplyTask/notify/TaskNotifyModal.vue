<template>
  <BasicModal :title="title" width="60%" destroyOnClose :bodyStyle="bodyStyle" :footer="null" @register="registerModal">
    <a-tabs defaultActiveKey="1" tabPosition="top">
      <a-tab-pane key="1">
        <template #tab> <file-text-outlined /><span>催办</span> </template>
        <notify-form :procInstId="procInstId" @ok="notifyOk"></notify-form>
        <!--<ext-act-task-notification-modal ref="extActTaskNotificationModal" :procInstId="procInstId" @ok="handleOk"></ext-act-task-notification-modal>-->
        <p></p>
      </a-tab-pane>

      <a-tab-pane key="2">
        <template #tab> <user-outlined /><span>我提醒的</span> </template>
        <notify-list :procInstId="procInstId"></notify-list>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import NotifyForm from './NotifyForm.vue';
  import NotifyList from './NotifyList.vue';
  import { UserOutlined, FileTextOutlined } from '@ant-design/icons-vue';
  import { ref } from 'vue';

  export default {
    name: 'TaskNotifyModal',
    emits: ['register'],
    components: {
      BasicModal,
      NotifyForm,
      NotifyList,
      UserOutlined,
      FileTextOutlined,
    },
    setup(_p, { emit }) {
      const title = ref('');
      const bodyStyle = {
        padding: '0 5px',
        'overflow-y': 'auto',
      };
      const procInstId = ref('');

      //useModalInner
      const [registerModal, { closeModal }] = useModalInner((data) => {
        console.log('data', data);
        title.value = data.title;
        procInstId.value = data.procInstId;
      });

      function notifyOk() {
        //emit('success')
        closeModal();
      }

      return {
        title,
        registerModal,
        bodyStyle,
        procInstId,
        notifyOk,
      };
    },
  };
</script>

<style scoped></style>
