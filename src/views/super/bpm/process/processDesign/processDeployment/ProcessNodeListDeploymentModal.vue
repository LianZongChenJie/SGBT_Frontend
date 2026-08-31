<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :footer="null"
    width="90%"
    title="流程节点"
    keyboard
    useWrapper
    :minHeight="50"
    :canFullscreen="false"
    destroyOnClose
  >
    <a-spin :spinning="spinningLoading">
      <BasicTable @register="registerTable" />
    </a-spin>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { deploymentNodeColumn } from './process.deployment.data';
  import { getNodeList } from './process.deployment.api';

  export default {
    name: 'ProcessNodeListDeploymentModal',
    components: {
      BasicModal,
      BasicTable,
    },
    setup() {
      const spinningLoading = ref('');
      const deploymentId = ref('');

      const { tableContext } = useListPage({
        designScope: 'process-deployment',
        pagination: false,
        tableProps: {
          api: getNodeList,
          immediate: false,
          showIndexColumn: true,
          showTableSetting: false,
          columns: deploymentNodeColumn,
          useSearchForm: false,
          showActionColumn: false,
          // 这属性效果是相反的
          canResize: false,
          beforeFetch: (params) => {
            return addQueryParams(params);
          },
        },
      });
      const [registerTable, { reload }] = tableContext;

      const [registerModal] = useModalInner(async (data) => {
        console.log('data', data);
        spinningLoading.value = true;
        deploymentId.value = data.deploymentId;
        await reload();
        spinningLoading.value = false;
      });

      function addQueryParams(params) {
        params.deploymentId = deploymentId.value;
        params.column = 'id';
        params.order = 'asc';
        return params;
      }

      return {
        registerModal,
        spinningLoading,
        registerTable,
      };
    },
  };
</script>

<style scoped></style>
