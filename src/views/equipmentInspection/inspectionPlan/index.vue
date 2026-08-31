<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="handleCreate">新建计划</a-button>
      </template>
      <template #status="{ record }">
        <a-tag :color="planStatusObj[record.status]">
          {{ record.status }}
        </a-tag>
      </template>
      <template #timeRange="{ record }">
        <span v-if="record.validityType == 'UNLIMITED'"> 无期限 </span>
        <span v-if="record.validityType == 'FIXED'">
          {{ record.startAt }} 至 {{ record.endAt }}
        </span>
        <span v-if="record.validityType == 'PERMANENT'">
          {{ record.startAt }} 开始
        </span>
      </template>
      <template #cycleType="{ record }">
        {{
          record.cycleType == "MONTHLY"
            ? "每月"
            : record.cycleType == "WEEKLY"
            ? "每周"
            : "日"
        }}
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" two-row />
      </template>
    </BasicTable>

    <PlanFormModal
      v-if="showPlanFormModal"
      @register="registerPlanFormModal"
      @success="handleSuccess"
    />
    <PlanLogModal
      v-if="planId"
      :planId="planId"
      @register="registerPlanLogModal"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import BasicTable from "@/components/Table/src/BasicTable.vue";
import { useListPage } from "@/hooks/system/useListPage";
import TableAction from "@/components/Table/src/components/TableAction.vue";
import { useModal } from "/@/components/Modal";
import { message } from "ant-design-vue";
import PlanFormModal from "./PlanFormModal.vue";
import { planStatusObj } from "@/utils/allData";
import PlanLogModal from "./PlanLogModal.vue";
import { columns, searchFormSchema } from "./inspectionPlan.data";
import {
  copyPlan,
  disablePlan,
  savePlan,
  getPlanList,
  enablePlan,
  deletePlan,
} from "./inspectionPlan.api";

const currentRecord = ref<Recordable | null>(null);
const searchInfo = reactive<Recordable>({});
const planId = ref(null);
const [registerDetailModal, { openModal: openDetailModal }] = useModal();
const [registerPlanFormModal, { openModal: openPlanFormModal }] = useModal();
const [registerPlanObjectModal, { openModal: openPlanObjectModal }] = useModal();
const [registerPlanTemplateModal, { openModal: openPlanTemplateModal }] = useModal();
const [
  registerPlanInspectItemModal,
  { openModal: openPlanInspectItemModal },
] = useModal();
const [
  registerPlanContentViewModal,
  { openModal: openPlanContentViewModal },
] = useModal();
const [registerPlanLogModal, { openModal: openPlanLogModal }] = useModal();
const showPlanFormModal = ref(false);

const { prefixCls, onExportXls, onImportXls, tableContext } = useListPage({
  tableProps: {
    title: "巡检计划列表",
    api: getPlanList,
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
      width: 220,
      fixed: "right",
    },
  },
});
const [registerTable, { reload }] = tableContext;
function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    生效中: "green",
    待生效: "blue",
    未启用: "orange",
    已停用: "orange",
    已结束: "default",
  };
  return colorMap[status] || "default";
}

function handleCreate() {
  currentRecord.value = null;
  showPlanFormModal.value = true;
  setTimeout(() => {
    openPlanFormModal(true, {
      isUpdate: false,
    });
  }, 20);
}

function handleDetail(record: Recordable) {
  showPlanFormModal.value = true;
  currentRecord.value = record;

  setTimeout(() => {
    openPlanFormModal(true, {
      record,
      isUpdate: false,
      isView: true,
    });
  }, 20);
}

function handleEdit(record: Recordable) {
  showPlanFormModal.value = true;
  currentRecord.value = record;

  setTimeout(() => {
    openPlanFormModal(true, {
      record,
      isUpdate: true,
    });
  }, 20);
}

async function handleCopy(record: Recordable) {
  try {
    message.success("复制计划成功");
    reload();
  } catch (error) {
    message.error("复制失败");
  }
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: "详情",
      onClick: handleDetail.bind(null, record),
    },
    {
      label: "编辑",
      onClick: handleEdit.bind(null, record),
    },
    {
      label: "查看日志",
      onClick: handleLog.bind(null, record),
    },
    // {
    //   label: "复制",
    //   onClick: handleCopy.bind(null, record),
    // },
    {
      label:
        record.status === "未启用" ||
        record.status === "待生效" ||
        record.status === "已停用"
          ? "启用"
          : "停用",
      popConfirm: {
        title:
          record.status === "未启用" ||
          record.status === "待生效" ||
          record.status === "已停用"
            ? "是否确认启用"
            : "是否确认停用",
        confirm:
          record.status === "未启用" ||
          record.status === "待生效" ||
          record.status === "已停用"
            ? handleEnable.bind(null, record)
            : handleDisable.bind(null, record),
        placement: "topLeft",
      },
      danger: record.status === "生效中" ? true : false,
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
async function handleEnable(record: Recordable) {
  try {
    await enablePlan({ planId: record.id });
    reload();
  } catch (error) {
    // message.error("启用失败");
  }
}
async function handleDisable(record: Recordable) {
  try {
    await disablePlan({ planId: record.id });
    reload();
  } catch (error) {
    // message.error("停用失败");
  }
}
async function handleDelete(record: Recordable) {
  try {
    await deletePlan({ id: record.id });
    reload();
  } catch (error) {
    // message.error("删除失败");
  }
}
function handleSuccess() {
  reload();
}

function handleLog(record: Recordable) {
  planId.value = record.id;
  setTimeout(() => {
    openPlanLogModal(true, record);
  }, 20);
}
</script>
