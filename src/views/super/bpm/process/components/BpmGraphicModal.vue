<template>
  <BasicModal title="流程图" @register="registerModal" keyboard maskClosable :bodyStyle="bodyStyle" :width="modalWidth" destroyOnClose :footer="null" @close="handleClose">
    <a-spin :spinning="loading">
      <BpmGraphic :instanceId="procInsId" center></BpmGraphic>
    </a-spin>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, nextTick } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import BpmGraphic from './BpmGraphic.vue';

  export default {
    name: 'BpmGraphicModal',
    components: {
      BpmGraphic,
      BasicModal,
    },
    setup() {
      const procInsId = ref('');
      const loading = ref(true);
      //useModalInner
      const [registerModal, { closeModal }] = useModalInner((data) => {
        const { flowCode, dataId } = data;
        loading.value = true;
        preview(flowCode, dataId);
      });
      
      const modalWidth = window.innerWidth * 0.8;
      const bodyStyle = ref({});
      let height = window.innerHeight - 180;
      bodyStyle.value = {
        height: height+'px',
        overflowY: 'auto'
      }
     
      
      function preview(flowCode, dataId) {
        let params = {
          flowCode: flowCode,
          dataId: dataId,
        };
        const url = '/act/process/extActFlowData/getProcessInfo';
        defHttp.get({ url, params }).then((data) => {
          procInsId.value = data.processInstanceId;
          loading.value = false;
        });
      }

      function handleClose() {
        closeModal();
      }

      return {
        registerModal,
        handleClose,
        procInsId,
        loading,
        modalWidth,
        bodyStyle
      };
    },
  };
</script>

<style scoped></style>
