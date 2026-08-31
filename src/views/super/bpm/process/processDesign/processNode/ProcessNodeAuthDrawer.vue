<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" title="节点页面权限" :width="drawerWidth">
    <process-node-auth-list ref="nodeAuthRef"></process-node-auth-list>
  </BasicDrawer>
</template>

<script>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import ProcessNodeAuthList from '../processNodeAuth/ProcessNodeAuthList.vue';

  export default {
    name: 'ProcessNodeAuthDrawer',
    components: {
      BasicDrawer,
      ProcessNodeAuthList,
    },
    emits: ['register'],
    setup(_props, { emit }) {
      const processId = ref('');
      const processNodeCode = ref('');
      const drawerWidth = ref(900);
      const nodeAuthRef = ref();

      // 注册
      const [registerModal, { closeDrawer }] = useDrawerInner(async (data) => {
        console.log('data1111', data);
        // this.queryParam.processId = record.processId;
        // this.queryParam.processNodeCode = record.processNodeCode;
        const { processId, processNodeCode } = data;
        nodeAuthRef.value.init(processId, processNodeCode);
        resetScreenSize();
      });

      function resetScreenSize() {
        let screenWidth = document.body.clientWidth;
        if (screenWidth < 500) {
          drawerWidth.value = screenWidth;
        } else {
          drawerWidth.value = 900;
        }
      }

      return {
        registerModal,
        nodeAuthRef,
        drawerWidth,
      };
    },
  };
</script>

<style scoped>
  :deep(.ant-modal-body) {
    padding-bottom: 5px !important;
    padding-top: 5px !important;
  }
</style>
