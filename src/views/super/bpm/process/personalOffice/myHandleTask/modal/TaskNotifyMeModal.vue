<template>
  <BasicModal title="催办提醒" @register="registerModal" width="60%">
    <a-tabs defaultActiveKey="1" tabPosition="top">
      <a-tab-pane key="1">
        <template #tab> <alert-outlined /><span>提醒我的</span> </template>
        <BasicTable @register="registerTable" />
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, nextTick } from 'vue';
  import { AlertOutlined } from '@ant-design/icons-vue';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { taskNotifyMeList } from '../task.handle.api';
  import { notifyMeColumns } from '../task.handle.data';

  export default {
    name: 'TaskNotifyMeModal',
    components: {
      BasicModal,
      AlertOutlined,
      BasicTable,
    },
    setup() {
      //useModalInner
      const procInstId = ref('');

      const { tableContext } = useListPage({
        designScope: 'notify-me-list',
        pagination: true,
        tableProps: {
          api: taskNotifyMeList,
          columns: notifyMeColumns,
          immediate: false,
          showIndexColumn: true,
          showTableSetting: false,
          useSearchForm: false,
          canResize: false,
          showActionColumn: false,
          beforeFetch: (params) => {
            return addQueryParams(params);
          },
        },
      });
      const [registerTable, { reload }] = tableContext;

      const [registerModal] = useModalInner((data) => {
        console.log(data);
        procInstId.value = data.procInstId;
        reload();
      });

      function addQueryParams(params) {
        params['procInstId'] = procInstId.value;
        return params;
      }

      return {
        registerModal,
        registerTable,
      };
    },
  };
</script>

<style scoped></style>
