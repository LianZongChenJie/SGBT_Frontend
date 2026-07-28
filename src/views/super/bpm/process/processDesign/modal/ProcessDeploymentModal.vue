<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :footer="null"
    :title="title"
    keyboard
    defaultFullscreen
    :canFullscreen="false"
    destroyOnClose
  >
    <a-spin :spinning="spinningLoading">
      <process-deployment-list ref="deploymentListRef" @loaded="spinningLoading = false"></process-deployment-list>
    </a-spin>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import processDeploymentList from '../processDeployment/ProcessDeploymentList.vue';

  export default {
    name: 'ProcessDeploymentModal',
    emits: ['success', 'register'],
    components: {
      BasicModal,
      processDeploymentList,
    },
    setup() {
      const spinningLoading = ref(false);
      const title = ref('');
      const deploymentListRef = ref();

      //useModalInner
      const [registerModal] = useModalInner((data) => {
        console.log('data', data);
        spinningLoading.value = true;
        title.value = `流程【${data.processName}】版本监控`;
        deploymentListRef.value.init(data.processKey);
      });

      return {
        spinningLoading,
        title,
        registerModal,
        deploymentListRef,
      };
    },
  };
</script>

<style scoped></style>
