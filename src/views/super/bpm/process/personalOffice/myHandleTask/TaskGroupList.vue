<template>
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"></TableAction>
    </template>
  </BasicTable>

  <!-- 办理 -->
  <task-handle-modal @register="registerHandleModal" @success="reload"></task-handle-modal>
</template>

<script>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useTaskList } from './useTaskList';
  import { useModal } from '/@/components/Modal';
  import TaskHandleModal from './modal/TaskHandleModal.vue';
  import { taskClaim } from './task.handle.api';

  export default {
    name: 'TaskGroupList',
    components: {
      BasicTable,
      TableAction,
      TaskHandleModal,
    },
    setup() {
      const { registerTable, reload, getTaskNodeInfo } = useTaskList('group');

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
        return arr;
      }

      return {
        registerTable,
        getTableAction,
        registerHandleModal,
        reload,
      };
    },
  };
</script>

<style scoped></style>
