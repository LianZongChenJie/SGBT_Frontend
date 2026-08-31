<template>
  <div>
    <process-online-form :table-name="tableName" :task-id="taskId" :data-id="dataId" :disabled="false" />
  </div>
</template>

<script>
  import ProcessOnlineForm from '/@/views/super/online/cgform/auto/comp/ProcessOnlineForm.vue';
  import { ref } from 'vue';
  export default {
    name: 'OnlineFormOpt',
    components: {
      ProcessOnlineForm,
    },
    props: {
      formData: {
        type: Object,
        default: () => {},
      },
    },
    setup(props) {
      const tableName = ref('');
      const dataId = ref('');
      const taskId = ref('');
      //update--begin--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
      //节点配置表单URL，VUE组件类型对应的拓展参数
      let extendUrlParams = props.formData.extendUrlParams;
      if (extendUrlParams && extendUrlParams.view) {
        tableName.value = extendUrlParams.view;
      } else {
        tableName.value = props.formData.tableName;
      }
      //update--end--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
      dataId.value = props.formData.dataId;
      taskId.value = props.formData.taskDefKey;

      return {
        tableName,
        dataId,
        taskId,
      };
    },
  };
</script>

<style scoped></style>
