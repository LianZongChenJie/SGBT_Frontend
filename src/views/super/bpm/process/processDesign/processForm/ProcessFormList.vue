<template>
  <BasicTable @register="registerTable">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAddForm"> 新增 </a-button>
    </template>

    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"></TableAction>
    </template>
  </BasicTable>

  <process-form-modal @register="registerFormModal" @success="reload"></process-form-modal>
</template>

<script>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';

  import { columns } from './process.form.data';
  import { list, deleteOne } from './process.form.api';

  import { useModal } from '/@/components/Modal';
  import ProcessFormModal from './ProcessFormModal.vue';

  export default {
    name: 'ProcessFormList',
    components: {
      BasicTable,
      TableAction,
      ProcessFormModal,
    },
    props: {
      processId: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const { tableContext } = useListPage({
        designScope: 'process-form',
        pagination: true,
        tableProps: {
          api: list,
          columns: columns,
          pagination: false,
          useSearchForm: false,
          canResize: false,
          beforeFetch: (params) => {
            return addQueryParams(params);
          },
        },
      });

      const [registerTable, { reload }] = tableContext;

      const [registerFormModal, { openModal: openFormModal }] = useModal();

      function addQueryParams(params) {
        params.processId = props.processId;
        params.column = 'id';
        params.order = 'desc';
        return params;
      }

      /**
       * 新增
       */
      function handleAddForm() {
        openFormModal(true, {
          isUpdate: false,
          processId: props.processId,
          formDealStyle: 'default',
        });
      }

      /**
       * 编辑弹框
       */
      function handleUpdate(record) {
        let data = Object.assign({}, record, { isUpdate: true });
        openFormModal(true, data);
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

      return {
        registerTable,
        getTableAction,
        handleAddForm,
        registerFormModal,
        reload,
      };
    },
  };
</script>

<style scoped></style>
