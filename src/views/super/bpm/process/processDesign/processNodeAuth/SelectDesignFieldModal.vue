<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="权限列表" @ok="handleSubmit" :width="1200" destroyOnClose>
    <a-row :gutter="24">
      <a-col :span="16">
        <a-card title="选择表单权限字段" :bordered="true">
          <div>
            <BasicTable @register="registerLeftTable" :rowSelection="rowSelection" />
          </div>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="权限选择" :bordered="true">
          <div>
            <BasicTable @register="registerRightTable">
              <!--操作栏-->
              <template #action="{ record }">
                <a-button type="primary" size="small" @click="handleDelete(record)" preIcon="ant-design:delete-outlined">删除</a-button>
              </template>
            </BasicTable>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </BasicModal>
</template>

<script>
  import { BasicModal } from '/@/components/Modal';
  import { BasicTable, TableAction } from '/@/components/Table';
  import useSelectAuthField from './useSelectAuthField';

  export default {
    name: 'SelectDesignFieldModal',
    components: {
      BasicModal,
      BasicTable,
      TableAction,
    },
    emits: ['register', 'selected'],
    setup(_props, { emit }) {
      const { registerModal, registerLeftTable, registerRightTable, handleSubmit, rowSelection, handleDelete } = useSelectAuthField(false, emit);

      return {
        registerModal,
        registerLeftTable,
        registerRightTable,
        handleSubmit,
        rowSelection,
        handleDelete,
      };
    },
  };
</script>

<style scoped></style>
