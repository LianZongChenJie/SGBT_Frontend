<template>
  <a-card :class="'jeecg-my-handle-task-info'">
    <a-tabs :activeKey="activeKey" tabPosition="left" @tabClick="handleChangePanel">
      <a-tab-pane tab="我的任务" key="run">
        <task-running-list ref="taskRef" v-if="activeKey==='run'"></task-running-list>
      </a-tab-pane>

      <a-tab-pane tab="组任务" key="group">
        <task-group-list v-if="activeKey==='group'"></task-group-list>
      </a-tab-pane>

      <a-tab-pane tab="历史任务" key="history">
        <task-history-list v-if="activeKey==='history'"></task-history-list>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
  /**
   * 我处理的任务信息
   * - 正在处理的任务
   * - 组任务
   * - 历史任务
   */
  import { ref, onMounted, nextTick } from 'vue';
  import TaskRunningList from './TaskRunningList.vue';
  import TaskGroupList from './TaskGroupList.vue';
  import TaskHistoryList from './TaskHistoryList.vue';
  import { useRouter } from 'vue-router';
  import { useAppStore } from '/@/store/modules/app';

  export default {
    name: 'MyHandleTaskInfo',
    components: {
      TaskRunningList,
      TaskGroupList,
      TaskHistoryList,
    },
    setup() {
      const bodyStyle = {
        padding: '10px',
      };
      const activeKey = ref('run');
      function handleChangePanel(key) {
        activeKey.value = key;
      }

      // 消息跳转处理页面参数
      const taskRef = ref()
      const appStore = useAppStore();
      
      onMounted(()=>{
        activeKey.value = 'run';
        let params = appStore.getMessageHrefParams;
        if(params) {
          let taskId = params.detailId;
          if(taskId){
            nextTick(()=>{
              taskRef.value.openHrefModal(taskId);
              appStore.setMessageHrefParams('');
            })
          }
        }
      });

      return {
        bodyStyle,
        activeKey,
        handleChangePanel,
        taskRef
      };
    },
  };
</script>

<style scoped>
  .jeecg-my-handle-task-info {
    margin: 10px;
  }
</style>
