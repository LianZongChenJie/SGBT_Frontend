<template>
  <div>
    <BasicTable @register="registerTable">
    <template #tableTitle>
      <a-button type="primary" @click="openKnowledgeModal('add')"
                >新增巡检项知识库</a-button
              >
    </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <DetailModal @register="registerDetailModal" />
    <EditModal @register="registerEditModal" @success="handleEditSuccess" />
  </div>
</template>

<script setup lang="ts">
import { useModal } from "/@/components/Modal";
import { BasicTable, TableAction } from "/@/components/Table";
import { useListPage } from "/@/hooks/system/useListPage";
import { columns, searchFormSchema } from "./inspectionItemKnowledge.data";
import { listInspectionItemKnowledge, deleteInspectionItemKnowledge } from "./inspectionItemKnowledge.api";
import DetailModal from "./DetailModal.vue";
import EditModal from "./EditModal.vue";
import { message } from "ant-design-vue";

const [registerDetailModal, { openModal: openDetailModal }] = useModal();
const [registerEditModal, { openModal: openEditModal }] = useModal();

const { tableContext } = useListPage({
  designScope: "inspection-item-knowledge",
  tableProps: {
    title: "巡检项知识库列表",
    api: listInspectionItemKnowledge,
    columns,
    bordered: true,
    showIndexColumn: true,
    useSearchForm: true,
    formConfig: {
      schemas: searchFormSchema,
    },
    showActionColumn: true,
    actionColumn: {
      title: "操作",
      width: 150,
      fixed: "right",
    },
  },
});
const [registerTable, { reload }] = tableContext;

function getActions(record) {
  return [
    {
      label: "查看",
      onClick: handleView.bind(null, record),
    },
    {
      label: "编辑",
      onClick: handleEdit.bind(null, record),
    },
    {
      label: "删除",
      popConfirm: {
        title: "是否确认删除",
        confirm: handleDelete.bind(null, record),
        placement: "topLeft",
      },
      danger: true,
    },
  ];
}

async function handleDelete(record) {
  try {
    await deleteInspectionItemKnowledge({ id: record.knowledgeItemId });
    reload();
  } catch (error) {
    console.error("删除失败:", error);
    message.error("删除失败");
  }
}

function handleView(record) {
  openDetailModal(true, { record });
}

function handleEdit(record) {
  openEditModal(true, { record });
}

function handleEditSuccess() {
  reload();
}
function openKnowledgeModal(type) {
  openEditModal(true, { type });
}
</script>

<style lang="less" scoped></style>
