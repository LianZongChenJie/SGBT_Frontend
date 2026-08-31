<template>
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"></TableAction>
    </template>
  </BasicTable>

  <task-handle-modal @register="registerModal"></task-handle-modal>
</template>

<script>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useTaskList } from './useTaskList';
  import { useModal } from '/@/components/Modal';
  import TaskHandleModal from './modal/TaskHandleModal.vue';

  export default {
    name: 'TaskHistoryList',
    components: {
      BasicTable,
      TableAction,
      TaskHandleModal,
    },
    setup() {
      const { registerTable, getHistoryTaskInfo } = useTaskList('history');

      const [registerModal, { openModal }] = useModal();

      async function showHistoryInfo(record) {
        let { formData, formUrl } = await getHistoryTaskInfo(record);
        formData['PROCESS_TAB_TYPE'] = 'history';
        openModal(true, {
          formData,
          formUrl,
          title: '流程历史',
        });
      }

      function getTableAction(record) {
        return [
          {
            label: '历史',
            onClick: showHistoryInfo.bind(null, record),
          },
        ];
      }

      return {
        registerTable,
        registerModal,
        getTableAction,
      };
    },
  };
</script>

<style scoped></style>
