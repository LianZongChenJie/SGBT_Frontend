<template>
  <BasicTable @register="registerTable" />
</template>

<script>
  /**
   * 展示指定任务的催办列表
   */
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { taskNotifyList } from '../task.apply.api';
  import { notifyColumns } from '../task.apply.data';

  export default {
    name: 'NotifyList',
    components: {
      BasicTable,
    },
    props: {
      procInstId: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const { tableContext } = useListPage({
        designScope: 'notify-list',
        pagination: true,
        tableProps: {
          api: taskNotifyList,
          columns: notifyColumns,
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
      const [registerTable] = tableContext;

      function addQueryParams(params) {
        params['procInstId'] = props.procInstId;
        return params;
      }

      return {
        registerTable,
      };
    },
  };
</script>

<style scoped></style>
