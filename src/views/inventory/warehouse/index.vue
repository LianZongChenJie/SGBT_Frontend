<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)"></TableAction>
      </template>
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增
        </a-button>
      </template>
    </BasicTable>
    <DetailModal @register="registerModal" @success="reload"/>
  </div>
</template>
<script setup lang="ts">
import TableAction from "@/components/Table/src/components/TableAction.vue";
import {useListPage} from "@/hooks/system/useListPage";
import {deleteApi, listApi} from "@/views/inventory/warehouse/api";
import BasicTable from "@/components/Table/src/BasicTable.vue";
import {useModal} from "@/components/Modal";
import DetailModal from "@/views/inventory/warehouse/detailModal.vue";

const [registerModal, {openModal: openModal}] = useModal();
const {tableContext} = useListPage({
  designScope: 'material-type-template',
  tableProps: {
    title: '仓库',
    api: listApi,
    columns: [
      {
        title: '编号',
        dataIndex: 'code',
        align: "center",
      },
      {
        title: '名称',
        dataIndex: 'name',
        align: "center",
      },
      {
        title: '位置分类',
        dataIndex: 'locationClassification',
        align: "center",

      },
      {
        title: '关联组织',
        dataIndex: 'orgName',
        align: "center",
      },
      {
        title: '备注',
        dataIndex: 'description',
        align: "center",
      }],
    formConfig: {
      schemas: [{
        field: 'name',
        label: '名称',
        component: 'Input',
        colProps: {span: 8},
      },],
    },
    actionColumn: {
      width: 180,
    },
    showIndexColumn: true,
  }
});
const [registerTable, {reload}] = tableContext;
const getActions = (record) => {
  return [
    {
      label: '编辑',
      onClick: doAction.bind(null, record, '编辑')
    },
    {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: doAction.bind(null, record,'删除'),
      },
    }
  ]
}
const handleAdd = () => {
  openModal(true, {
    isUpdate: false,
  });
}

function doAction(record: any, name: any) {
  if (name == '编辑'){
    openModal(true, {
      isUpdate: true,
      record
    });
  }
  if (name == '删除'){
    deleteApi({id:record.id},reload);
  }
}
</script>
