<template>
  <div>
    <div style="margin-bottom: 20px; height: 400px; overflow: hidden; overflow-y: auto; overflow-x: auto">
      <bpm-graphic :instanceId="formData.procInsId" @task="getTaskList"></bpm-graphic>
    </div>
    <a-card title="流程历史跟踪">
      <BasicTable @register="registerTable">
        <template #remarks="{ record }">
          <j-ellipsis :value="getNodeInfo(record)" :length="25" />
        </template>
      </BasicTable>
    </a-card>
  </div>
</template>

<script>
  /**
   * 历史任务跟踪-查看历史节点-流程图
   */
  import BpmGraphic from '/@/views/super/bpm/process/components/BpmGraphic.vue';
  import { BasicTable } from '/@/components/Table';
  import { taskTraceColumns } from '../task.handle.data';
  import { taskTraceList } from '../task.handle.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import { ref } from 'vue';

  export default {
    name: 'TaskTraceContent',
    components: {
      BpmGraphic,
      BasicTable,
      JEllipsis,
    },
    props: {
      formData: {
        type: Object,
        default: () => {},
      },
    },
    setup(props) {
      console.log('进入TaskTraceContent>>');
      const { tableContext } = useListPage({
        designScope: 'task-trace-content',
        pagination: true,
        tableProps: {
          title: '',
          api: taskTraceList,
          columns: taskTraceColumns,
          showIndexColumn: true,
          showTableSetting: false,
          canResize: false,
          showActionColumn: false,
          useSearchForm: false,
          beforeFetch: (params) => {
            return addQueryParams(params);
          },
        },
      });
      const [registerTable] = tableContext;

      function addQueryParams(params) {
        params.processInstanceId = props.formData.procInsId;
        return params;
      }

      const taskList = ref([]);
      function getTaskList(arr) {
        console.log('aaa', arr);
        taskList.value = arr;
      }

      function getNodeInfo(record) {
        let arr = taskList.value;
        if (arr && arr.length > 0) {
          for (let item of arr) {
            if (item.id == record.id) {
              return item.remarks;
            }
          }
        }
        return '';
      }
      return {
        registerTable,
        getTaskList,
        getNodeInfo,
      };
    },
  };
</script>

<style scoped></style>
