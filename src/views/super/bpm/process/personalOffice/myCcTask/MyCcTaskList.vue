<template>
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>

  <!-- 查看历史 -->
  <task-handle-modal @register="registerHistoryModal"></task-handle-modal>
</template>

<script>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { ref } from 'vue';
  import { columns, searchFormSchema } from './task.cc.data';
  import { list } from './task.cc.api';
  import { getTaskInfoForHistory } from '../myHandleTask/useTaskList';
  import TaskHandleModal from '../myHandleTask/modal/TaskHandleModal.vue';
  import { useModal } from '/@/components/Modal';

  export default {
    name: 'MyCcTaskList',
    components: {
      BasicTable,
      TaskHandleModal,
      TableAction,
    },
    setup() {
      const { tableContext } = useListPage({
        designScope: 'my-apply-task-list',
        pagination: true,
        tableProps: {
          api: list,
          columns: columns,
          showIndexColumn: true,
          showTableSetting: true,
          canResize: false,
          scroll: { x: 1600 },
          actionColumn: { dataIndex: 'action', fixed: 'right' },
          formConfig: {
            schemas: searchFormSchema,
            autoAdvancedCol: 4,
            baseColProps: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
            actionColOptions: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
          },
        },
      });
      const [registerTable, { reload }] = tableContext;
      const [registerHistoryModal, { openModal: openHistoryModal }] = useModal();

      function getTableAction(record) {
        return [
          {
            label: '查看审批',
            onClick: showHistory.bind(null, record),
          },
        ];
      }

      async function showHistory(record) {
        let { formData, formUrl } = await getTaskInfoForHistory(record);
        formData['PROCESS_TAB_TYPE'] = 'history';
        openHistoryModal(true, {
          formData,
          formUrl,
          title: '流程历史',
        });
      }

      return {
        registerTable,
        getTableAction,
        registerHistoryModal,
      };
    },
  };
</script>

<style scoped></style>
