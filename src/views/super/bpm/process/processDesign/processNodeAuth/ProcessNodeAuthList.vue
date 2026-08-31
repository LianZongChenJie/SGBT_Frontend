<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd"> 新增 </a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="handleBatchDelete">
              <Icon icon="ant-design:delete-outlined"></Icon>
              删除
            </a-menu-item>
          </a-menu>
        </template>
        <a-button
          >批量操作
          <Icon icon="mdi:chevron-down"></Icon>
        </a-button>
      </a-dropdown>
    </template>

    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"></TableAction>
    </template>
  </BasicTable>

  <node-auth-modal @register="registerModal" @success="reload"></node-auth-modal>
</template>

<script>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { columns, searchFormSchema } from './node.auth.data';
  import { list, deleteOne, deleteBatch } from './node.auth.api';
  import { useModal } from '/@/components/Modal';
  import NodeAuthModal from './NodeAuthModal.vue';
  import { ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default {
    name: 'ProcessNodeAuthList',
    components: {
      BasicTable,
      TableAction,
      NodeAuthModal,
    },
    setup(props) {
      const { createMessage } = useMessage();
      const processId = ref('');
      const processNodeCode = ref('');

      const { tableContext } = useListPage({
        designScope: 'process-node-auth',
        pagination: false,
        tableProps: {
          api: list,
          immediate: false,
          columns: columns,
          actionColumn: {
            fixed: 'right',
          },
          formConfig: {
            schemas: searchFormSchema,
            autoSubmitOnEnter: true,
            showAdvancedButton: false,
            actionColOptions: {
              style: {
                maxWidth: '200px',
              },
            },
            baseColProps: {
              style: {
                flex: '0 0 33%',
                maxWidth: '33%',
              },
            },
          },
          beforeFetch: (params) => {
            return addQueryParams(params);
          },
        },
      });

      const [registerTable, { reload, getDataSource, clearSelectedRowKeys }, { selectedRowKeys, rowSelection }] = tableContext;

      const [registerModal, { openModal }] = useModal();

      function addQueryParams(params) {
        params.processId = processId.value;
        params.processNodeCode = processNodeCode.value;
        return params;
      }

      /**
       * 新增
       */
      function handleAdd() {
        let dataSource = getDataSource();
        let formData = {
          processId: processId.value,
          processNodeCode: processNodeCode.value,
        };
        openModal(true, {
          isUpdate: false,
          dataSource: dataSource,
          formData: formData,
        });
      }

      /**
       * 编辑弹框
       */
      function handleUpdate(record) {
        let dataSource = getDataSource();
        openModal(true, {
          isUpdate: true,
          dataSource: dataSource,
          formData: record,
        });
      }

      /**
       * 批量删除
       */
      async function handleBatchDelete() {
        let arr = selectedRowKeys.value;
        if (arr <= 0) {
          createMessage.warning('请选择一条记录！');
          return;
        }
        await deleteBatch({ ids: arr.join(',') });
        clearSelectedRowKeys();
        reload();
      }

      /**
       * 删除
       */
      async function handleDelete(record) {
        await deleteOne({ id: record.id });
        reload();
      }

      function getTableAction(record) {
        return [
          {
            label: '编辑',
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

      function init(paramProcessId, paramProcessNodeCode) {
        console.log('init', { paramProcessId, paramProcessNodeCode });
        processId.value = paramProcessId;
        processNodeCode.value = paramProcessNodeCode;
        reload();
      }

      return {
        registerTable,
        getTableAction,
        handleAdd,
        handleBatchDelete,
        registerModal,
        init,
        reload,
        selectedRowKeys,
        rowSelection,
      };
    },
  };
</script>

<style scoped></style>
