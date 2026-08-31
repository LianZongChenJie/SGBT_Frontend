<template>
  <BasicTable @register="registerTable">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAddNode"> 新增 </a-button>
    </template>

    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"></TableAction>
    </template>
  </BasicTable>

  <process-node-modal @register="registerNodeModal" @success="reload"></process-node-modal>

  <process-node-auth-drawer @register="registerDrawer"></process-node-auth-drawer>

  <!-- 节点权限新配置 -->
  <node-auth-easy-modal @register="registerNodeAuthModal" @success="reload"></node-auth-easy-modal>
</template>

<script>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';

  import { columns } from './process.node.data';
  import { list, deleteOne } from './process.node.api';

  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import ProcessNodeModal from './ProcessNodeModal.vue';
  import ProcessNodeAuthDrawer from './ProcessNodeAuthDrawer.vue';
  import NodeAuthEasyModal from '../processNodeAuth/NodeAuthEasyModal.vue'

  export default {
    name: 'ProcessNodeList',
    components: {
      BasicTable,
      TableAction,
      ProcessNodeModal,
      ProcessNodeAuthDrawer,
      NodeAuthEasyModal
    },
    props: {
      processId: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const { tableContext } = useListPage({
        designScope: 'process-node',
        tableProps: {
          api: list,
          columns: columns,
          useSearchForm: false,
          canResize: false,
          beforeFetch: (params) => {
            return addQueryParams(params);
          },
        },
      });

      const [registerTable, { reload }, { selectedRowKeys }] = tableContext;

      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerNodeModal, { openModal: openNodeModal }] = useModal();

      const [registerNodeAuthModal, { openModal: openNodeAuthModal }] = useModal();
      

      function addQueryParams(params) {
        params.processId = props.processId;
        return params;
      }

      /**
       * 新增
       */
      function handleAddNode() {
        openNodeModal(true, {
          isUpdate: false,
          processId: props.processId,
        });
      }

      /**
       * 编辑弹框
       */
      function handleUpdate(record) {
        let data = Object.assign({}, record, { isUpdate: true });
        openNodeModal(true, data);
      }

      /**
       * 删除
       */
      async function handleDelete(record) {
        await deleteOne({ id: record.id });
        reload();
      }

      /**
       * 权限设置
       * 1.获取业务表单
       * 2.如果是单个业务表单且表单是 online表单或者设计器表单 跳转新的权限设置页面
       * 3.如果是多个业务表单或自定义开发表单， 只支持旧的权限设置页面
       */
      function handleAuthConfig(record) {
        openDrawer(true, record);
      }

      /**
       * 权限设置简洁版
       */
      function easyAuthConfig(record) {
        openNodeAuthModal(true, record);
      }

      function getDropDownAction(record) {
        return [
     /*     {
            label: '权限设置',
            onClick: handleAuthConfig.bind(null, record),
          },*/
          {
            label: '自定义',
            onClick: handleUpdate.bind(null, record),
          },
          {
            label: '删除',
            popConfirm: {
              title: '是否确认删除',
              confirm: handleDelete.bind(null, record),
            },
          },
        ];
      }

      function getTableAction(record) {
        return [
          {
            label: '节点规则',
            onClick: easyAuthConfig.bind(null, record),
          },
        ];
      }
      
      function openAuthModal(isNewAuthModal, row) {
        if(isNewAuthModal===true){
          openNodeAuthModal(true, row);
        }else{
          openDrawer(true, row);
        }
      }

      return {
        registerTable,
        getDropDownAction,
        getTableAction,
        handleAddNode,
        registerNodeModal,
        registerDrawer,
        registerNodeAuthModal,
        reload,
        openAuthModal
      };
    },
  };
</script>

<style scoped></style>
