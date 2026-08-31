<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="流程图" :footer="null" :width="800" canFullscreen destroyOnClose>
    <img :src="imageSrc" @load="imgLoad" />
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import qs from 'qs';
  import { ref } from 'vue';

  export default {
    name: 'ProcessGraphModal',
    components: {
      BasicModal,
    },
    setup() {
      const imageSrc = ref('');
      const [registerModal, { redoModalHeight }] = useModalInner((data) => {
        const { deploymentId, diagramResourceName } = data;
        imageSrc.value = getResourceURL(deploymentId, diagramResourceName);
      });

      // 获取静态资源访问地址
      function getResourceURL(id, name) {
        let params = qs.stringify({
          _t: Date.parse(new Date()) / 1000,
          deploymentId: id,
          resourceName: name,
        });
        return `${window._CONFIG['domianURL']}/act/process/resource?${params}`;
      }

      function imgLoad() {
        redoModalHeight();
      }

      return {
        registerModal,
        imageSrc,
        imgLoad,
      };
    },
  };
</script>

<style scoped></style>
