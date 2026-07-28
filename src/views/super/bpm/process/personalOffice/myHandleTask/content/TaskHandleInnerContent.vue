<template>
  <div class="jeecg-task-handle-content">
    <!-- 横向步骤条，显示节点 -->
    <task-node-step-list :taskStepList="taskStepList" :stepCount="bpmLogList.length" :currentNode="currentNode"></task-node-step-list>

    <!-- 意见信息 -->
    <task-comment-list :bpmLogList="bpmLogList"></task-comment-list>

    <!-- 填写处理意见并提交 -->
    <my-handle-content
      v-if="isRunningTask"
      @success="handleSuccess"
      :taskId="taskId"
      :historyList="historyList"
      :turnbackTaskId="turnbackTaskId"
      :branchList="branchList"
      :selnextUserStatus="selnextUserStatus"
      :ccStatus="ccStatus"
      :allowAddSign="allowAddSign"
      :allowCounterSignAddUser="allowCounterSignAddUser"
      :currentTaskName="currentNode.taskName">
    </my-handle-content>
    
    <!-- 签收 -->
    <div v-if="claim" style="width: 100%;text-align: center; padding-top: 10px">
      <a-button type="primary" @click="handleClaim" :loading="loading"><AuditOutlined/>确认签收</a-button>
    </div>
  </div>
</template>

<script lang="ts">
  import { taskTransInfo, taskComplete, taskClaim } from '../task.handle.api';
  import { ref, watch } from 'vue';
  import TaskNodeStepList from './TaskNodeStepList.vue';
  import TaskCommentList from './TaskCommentList.vue';
  import MyHandleContent from './MyHandleContent.vue';
  import { pick } from 'lodash-es';
  import { AuditOutlined } from '@ant-design/icons-vue';

  export default {
    name: 'TaskHandleInnerContent',
    components: {
      TaskNodeStepList,
      TaskCommentList,
      MyHandleContent,
      AuditOutlined
    },
    props: {
      formData: {
        type: Object,
        default: () => {},
      },
      //签收状态
      claim:{
        type: Boolean,
        default: false
      }
    },
    emits: ['success', 'claimSuccess'],
    setup(props, { emit }) {
      console.log('进入tab panel-content');
      const taskId = ref('');
      // 任务步骤条
      const taskStepList = ref([]);
      // 当前任务节点
      const currentNode = ref({});
      // 审批记录/意见信息
      const bpmLogList = ref([]);
      // 历史节点
      const historyList = ref([]);
      // 获取上一步的节点
      const turnbackTaskId = ref('');
      // 任务分支
      const branchList = ref([]);
      const isRunningTask = ref(true);
      const allowAddSign = ref(false);
      const allowCounterSignAddUser = ref(false);
      const loading = ref(false);
      // 选择下一步处理人
      const selnextUserStatus = ref(true);
      // 选择抄送人
      const ccStatus = ref(true);

      getTaskTransInfo();

      async function getTaskTransInfo(type?) {
        let taskType = props.formData['PROCESS_TAB_TYPE'];
        console.log('taskType>>', taskType)
        if(type){
          taskType = type;
        }
        isRunningTask.value = taskType == 'run';
        //查询条件-run只需要taskId， history只需要procInstId
        let params = { taskId: props.formData.taskId, procInstId: props.formData.procInsId };
        let data = await taskTransInfo(params, taskType);
        console.log('获取流程流转信息', data);
        
        //update-begin-author:taoyan date:2022-7-5 for: 
        //选择下一步操作人
        if(!data.selnextUserStatus || data.selnextUserStatus=='1'){
          //如果没有该值 或是该值为1
          selnextUserStatus.value = true;
        }else{
          selnextUserStatus.value = false;
        }

        // 选择抄送人
        if(!data.ccStatus || data.ccStatus=='1'){
          //如果没有该值 或是该值为1
          ccStatus.value = true;
        }else{
          ccStatus.value = false;
        }
        //是否允许加签
        allowAddSign.value=data.allowAddSign;
        //是否多实例- 会签加签 是否允许会签节点加人0否、1允许
        allowCounterSignAddUser.value = (data?.allowCounterSignAddUser && data.allowCounterSignAddUser =='1');
        taskStepList.value = data.bpmLogStepList;
        bpmLogList.value = data.bpmLogList;

        let nodeObject = pick(data, 'taskName', 'taskNameStartTime', 'taskAssigneeName');
        if (isRunningTask.value === false) {
          // 'taskName', 'taskNameStartTime', 'taskAssigneeName' 是正在运行流程的当前节点信息
          //  'currTaskName', 'currTaskNameAssignee', 'currTaskNameStartTime'这三个是历史查看中的节点信息
          nodeObject['taskName'] = data['currTaskName'];
          nodeObject['taskNameStartTime'] = data['currTaskNameStartTime'];
          nodeObject['taskAssigneeName'] = data['currTaskNameAssignee'];
        }
        currentNode.value = nodeObject;

        historyList.value = data.histListNode;
        branchList.value = data.transitionList;

        turnbackTaskId.value = data.turnbackTaskId;

        taskId.value = props.formData.taskId;
      }

      function handleSuccess() {
        emit('success');
      }

      /**
       * 签收调用
       */
      async function handleClaim(){
        loading.value = true;
        let params = { taskId: taskId.value };
        await taskClaim(params);
        await getTaskTransInfo('run');
        emit('claimSuccess')
        setTimeout(()=>{
          loading.value = false;
        }, 200)
      }

      watch(()=>props.claim, (val)=>{
        if(val===true){
          // 如果是签收状态 则定义isRunningTask为false
          isRunningTask.value = false
        }else{
          let taskType = props.formData['PROCESS_TAB_TYPE'];
          isRunningTask.value = taskType == 'run';
        }
      }, {immediate: true})
      
      return {
        taskId,
        bpmLogList,
        taskStepList,
        currentNode,
        historyList,
        branchList,
        handleSuccess,
        isRunningTask,
        handleClaim,
        loading,
        ccStatus,
        allowAddSign,
        allowCounterSignAddUser,
        selnextUserStatus,
        turnbackTaskId
      };
    },
  };
</script>

<style lang="less">
  .jeecg-task-handle-content {

    .task-info {
      margin: 20px 0;
    }

    .task-title {
      font-weight: bold;
    }

    .task-date {
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .task-date span {
      /* color: #ff6d75;*/
    }

    .ant-steps-item-description {
      max-width: 200px !important;
    }

    /** Button按钮间距 */

    .ant-btn {
      margin-left: 3px;
    }

    /** 标题和描述对齐 */

    .ant-steps-item-content {
      text-align: left;
      margin-left: 50px;
    }

    /** 描述的样式 */

    .descriptionDiv {
      display: flex;
      justify-content: left;
      align-items: center;
      margin-top: 5px;
    }

    .jee-cust-selector .ant-select-selection__choice {
      padding-right: 10px !important;
    }
  }
</style>
