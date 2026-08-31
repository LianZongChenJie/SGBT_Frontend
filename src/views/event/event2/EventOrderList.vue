<template>
  <div>
    <BasicTable @register="registerTable">
      <
      <template #action="{ record }">
        <TableAction
            :actions="getActions(record)"
        />
      </template>
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增
        </a-button>
      </template>
    </BasicTable>
    <OrderModal @register="registerModal" @success="reload"/>
    <TransferModel @register="transferModal" @success="reload"/>
  </div>
</template>


<script setup lang="ts">
import BasicTable from "@/components/Table/src/BasicTable.vue";
import {useListPage} from "@/hooks/system/useListPage";
import {getExportUrl, getImportUrl, getEventOrderList, detail} from "./eventOrder.api";
import {columns, searchFormSchema} from "./event.data";
import {useMessage} from "@/hooks/web/useMessage";
import {useModal} from "@/components/Modal";
import OrderModal from './eventModel.vue';
import TableAction from "@/components/Table/src/components/TableAction.vue";
import TransferModel from "@/views/event/event/transferModel.vue";

const {createMessage} = useMessage();
const [registerModal, {openModal}] = useModal();
const [transferModal, {openModal: openTransferModal,setModalProps}] = useModal();
const {prefixCls, onExportXls, onImportXls, tableContext} = useListPage({
  designScope: 'eventOder-template',
  tableProps: {
    title: '事件工单',
    api: getEventOrderList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
    },
    actionColumn: {
      width: 180,
    },
    showIndexColumn: true,
  }
});
const [registerTable, {reload}, {rowSelection, selectedRowKeys}] = tableContext;

/**
 * 新增事件
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
  });
}

// 处理流转操作，打开流转模态框
const handleTransfer = (record: Recordable) => {
  openTransferModal(true, {
    record: record
  });
};

/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  var status = record.status;
  if (status === '待处理') {
    return [
      {
        label: '转工单',
        onClick: handleEdit.bind(null, record)
      }
    ]
  }
  return []
}

function handleEdit(record: Recordable) {
  handleTransfer(record)
}
</script>
