<template>
    <div style="padding: 10px">
        <a-card>
            <a-spin :spinning="loading">

                <a-tabs v-model="activeKey" tabPosition="left">
                    <a-tab-pane key="1">
                        <template #tab> <file-text-outlined /><span>附加单据</span> </template>
                        <BpmDynamicForm :path="taskFormUrl" :form-data="taskFormData" />
                    </a-tab-pane>

                    <a-tab-pane key="2">
                        <template #tab> <user-outlined /><span>任务处理</span> </template>
                        <task-handle-inner-content @success="handleSuccess" :form-data="taskFormData" :claim="taskClaimStatus" @claimSuccess="handleClaimSuccess"></task-handle-inner-content>
                    </a-tab-pane>

                    <a-tab-pane key="3">
                        <template #tab> <partition-outlined /><span>流程图</span> </template>
                        <task-trace-content :form-data="taskFormData" />
                    </a-tab-pane>
                </a-tabs>

            </a-spin>
        </a-card>
    </div>
</template>

<script lang="ts">
  import { useRoute } from 'vue-router';
  import { useTaskList, getTaskInfoForHistory } from './myHandleTask/useTaskList';
  import { ref } from 'vue';
  import { UserOutlined, PartitionOutlined, FileTextOutlined } from '@ant-design/icons-vue';
  import TaskHandleInnerContent from './myHandleTask/content/TaskHandleInnerContent.vue';
  import TaskTraceContent from './myHandleTask/content/TaskTraceContent.vue';
  import BpmDynamicForm from '/@/views/super/bpm/process/components/BpmDynamicForm.vue';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { useMessage } from '/@/hooks/web/useMessage';
  
  /**
   * 用于办理跳转页面 独立菜单
   * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
   */
  export default {
    name: "myHandlePage",
    components:{
      BpmDynamicForm,
      TaskHandleInnerContent,
      TaskTraceContent,
      UserOutlined,
      PartitionOutlined,
      FileTextOutlined
    },
    setup(){
      const { createMessage } = useMessage();
      //关闭当前tab
      const { closeCurrent } =  useTabs();
      function handleSuccess(){
        closeCurrent();
      }
      
      const taskFormData = ref({});
      const taskFormUrl = ref('');
      const taskClaimStatus = ref(false)
      const loading = ref(false)
      const activeKey = ref('1')
      
      const route = useRoute();
      let taskId = route.params.id as string;
      let taskType = 'run';
      
      // 加载节点信息
      const { getTaskNodeInfo } = useTaskList('run');
      loadNodeInfo();
      
      async function loadNodeInfo(){
        loading.value = true
        const routeQuery:any = route.query;
        if(routeQuery && routeQuery.history=='1'){
          // 查看历史信息  抄送查看界面
          await loadHistoryInfo(routeQuery)
        }else{
          // 办理界面
          let { formData, formUrl, isSignTask, taskIsHandel } = await getTaskNodeInfo({id: taskId });
          if(taskIsHandel==true){
            //如果已经处理过了
            //createMessage.warning("当前任务已被处理!");
            await closeCurrent();
            return;
          }
          console.log('formData', formData)
          if(routeQuery){
            //  taskId taskDefKey procInsId
            formData['taskId'] = routeQuery.taskId;
            formData['taskDefKey'] = routeQuery.taskDefKey;
            formData['procInsId'] = routeQuery.procInsId;

            if(routeQuery.claim == 1 && isSignTask==false){
              //如果已经签收了
              // NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
              createMessage.warning("当前任务已被他人签收!");
              await closeCurrent();
              return;
            }

            // 需要签收
            if(isSignTask==true){
              taskType = 'group';
              taskClaimStatus.value = true
            }
          }
          formData['PROCESS_TAB_TYPE'] = taskType;
          taskFormData.value = formData
          taskFormUrl.value = formUrl
        }
        loading.value = false
      }
      
      async function loadHistoryInfo(routeQuery){
        let record = {
          id: routeQuery.taskId,
          taskId: routeQuery.taskDefKey,
          processInstanceId: routeQuery.procInsId
        }
        let { formData, formUrl } = await getTaskInfoForHistory(record);
        formData['PROCESS_TAB_TYPE'] = 'history';
        taskClaimStatus.value = false
        taskFormData.value = formData
        taskFormUrl.value = formUrl
      }

      async function handleClaimSuccess(){
        taskFormData.value['PROCESS_TAB_TYPE'] = 'run';
        taskClaimStatus.value = false
      }
      
      return {
        loading,
        activeKey,
        taskFormData,
        taskFormUrl,
        handleSuccess,
        taskClaimStatus,
        handleClaimSuccess
      }
    }
    
  }
</script>

<style scoped>

</style>
