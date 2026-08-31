<template>
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"></TableAction>
    </template>
  </BasicTable>

  <!-- 流程图 -->
  <process-graph-modal @register="registerGraphModal"></process-graph-modal>

  <!-- 流程节点 -->
  <process-node-list-deployment-modal @register="registerNodeListModal"></process-node-list-deployment-modal>
</template>

<script>
  import { ref, unref, reactive } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { columns } from './process.deployment.data';
  import { list, active, suspend, deleteOne, downProcessXmlUrl } from './process.deployment.api';
  import ProcessGraphModal from './ProcessGraphModal.vue';
  import ProcessNodeListDeploymentModal from './ProcessNodeListDeploymentModal.vue';
  import { useModal } from '/@/components/Modal';
  import { getToken } from '/@/utils/auth';

  export default {
    name: 'ProcessDeploymentList',
    components: {
      BasicTable,
      TableAction,
      ProcessGraphModal,
      ProcessNodeListDeploymentModal,
    },
    emits: ['loaded'],
    setup(_props, { emit }) {
      const processKey = ref('');
      async function init(dataKey) {
        console.log('init', dataKey);
        processKey.value = dataKey;
        await reload();
        emit('loaded');
      }

      const { tableContext } = useListPage({
        designScope: 'process-deployment',
        pagination: false,
        tableProps: {
          api: list,
          immediate: false,
          showIndexColumn: false,
          columns: columns,
          useSearchForm: false,
          canResize: false,
          actionColumn: {
            width: 360,
            dataIndex: 'action',
            slots: { customRender: 'action' },
          },
          beforeFetch: (params) => {
            return addQueryParams(params);
          },
        },
      });
      const [registerTable, { reload }] = tableContext;

      const [registerGraphModal, { openModal: openGraphModal }] = useModal();

      const [registerNodeListModal, { openModal: openNodeListModal }] = useModal();

      function getTableAction(record) {
        let arr = [];
        arr.push({
          label: '流程图',
          onClick: showPic.bind(null, record),
        });
        if (record.suspensionState == 0) {
          arr.push({
            label: '激活',
            popConfirm: {
              title: '确定激活吗?',
              confirm: handleActive.bind(null, record),
            },
          });
        }
        if (record.suspensionState == 1) {
          arr.push({
            label: '挂起',
            popConfirm: {
              title: '确定挂起吗?',
              confirm: handleSuspend.bind(null, record),
            },
          });
        }
        arr.push({
          label: '流程节点',
          onClick: showNodes.bind(null, record),
        });
        return arr;
      }

      function getDropDownAction(record) {
        return [
          {
            label: '删除',
            popConfirm: {
              title: '确定删除吗?',
              confirm: handleDelete.bind(null, record),
            },
          },
          {
            label: '下载',
            onClick: handleDownload.bind(null, record),
          },
        ];
      }

      function showPic(record) {
        openGraphModal(true, record);
      }

      async function handleActive(record) {
        await active(record.id);
        reload();
      }

      async function handleSuspend(record) {
        await suspend(record.id);
        reload();
      }

      function showNodes(record) {
        openNodeListModal(true, record);
      }

      async function handleDelete(record) {
        await deleteOne({ ids: record.deploymentId, processKey: processKey.value });
        reload();
      }

      function handleDownload(record) {
        let deploymentId = record.deploymentId;
        let resourceName = record.resourceName;
        const token = getToken();
        let url =
          window._CONFIG['domianURL'] + downProcessXmlUrl + '?deploymentId=' + deploymentId + '&resourceName=' + resourceName + '&token=' + token;
        window.location.href = url;
      }

      function addQueryParams(params) {
        params.processKey = processKey.value;
        return params;
      }

      return {
        init,
        registerTable,
        getDropDownAction,
        getTableAction,

        registerGraphModal,
        registerNodeListModal,
      };
    },
  };
</script>

<style scoped></style>
