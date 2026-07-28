<template>
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
    </template>
  </BasicTable>
  <!-- 查看历史 -->
  <TaskHandleModal @register="registerHistoryModal"></TaskHandleModal>

  <!-- 催办 -->
  <task-notify-modal @register="registerNotifyModal"></task-notify-modal>
</template>

<script>
  import { invalidProcess, backProcess, list } from './task.apply.api';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { columns, searchFormSchema } from './task.apply.data';
  import TaskHandleModal from '../myHandleTask/modal/TaskHandleModal.vue';
  import { useModal } from '/@/components/Modal';
  import { getTaskInfoForHistory } from '../myHandleTask/useTaskList';
  import TaskNotifyModal from './notify/TaskNotifyModal.vue';
  import { ref } from 'vue';

  export default {
    name: 'MyApplyTaskList',
    components: {
      BasicTable,
      TableAction,
      TaskHandleModal,
      TaskNotifyModal,
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

      const [registerNotifyModal, { openModal: openNotifyModal }] = useModal();

      function getTableAction(record) {
        if (record.endTime && record.endTime != '') {
          return [
            {
              label: '历史',
              onClick: showHistory.bind(null, record),
            },
          ];
        } else {
          return [];
        }
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

      function getDropDownAction(record) {
        if (!record.endTime || record.endTime == '') {
          let arr = [];
          if(record.urgeStatus!=='0'){
            arr.push({
              label: '催办',
              onClick: handleTaskNotify.bind(null, record),
            })
          }
          arr.push({
            label: '作废流程',
            popConfirm: {
              title: '确定要作废流程吗？',
              placement: 'left',
              confirm: handleInvalidTask.bind(null, record),
            },
          });

          if(record.backStatus!=='0'){
            arr.push({
              label: '取回流程',
              popConfirm: {
                title: '确定要取回流程吗？',
                placement: 'left',
                confirm: handleBackTask.bind(null, record),
              },
            })
          }
          
          arr.push({
            label: '历史',
            onClick: showHistory.bind(null, record)
          });
          
          return arr;
        } else {
          return [];
        }
      }

      // 流程作废
      async function handleInvalidTask(record) {
        let params = {
          processInstanceId: record.processInstanceId,
        };
        await invalidProcess(params);
        reload();
      }

      // 流程取回
      async function handleBackTask(record) {
        let params = {
          processInstanceId: record.processInstanceId,
        };
        await backProcess(params);
        reload();
      }

      //催办
      function handleTaskNotify(record) {
        openNotifyModal(true, {
          title: '催办提醒',
          procInstId: record.processInstanceId,
        });
      }

      return {
        registerTable,
        registerHistoryModal,
        registerNotifyModal,
        getTableAction,
        getDropDownAction,
        reload,
      };
    },
  };
</script>

<style scoped></style>
