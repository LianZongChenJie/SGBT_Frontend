<template>
  <div class="inspection-task">
    <!-- 摘要信息
    <div class="summary-box">
      <div class="summary-text">
        共检索到
        {{ totalCount }}
        条巡检任务记录。当前页面采用列表形式展示，点击操作列中的“查看详情”后，以弹窗方式查看任务明细和结果。
      </div>
    </div> -->

    <!-- 任务列表 -->
    <BasicTable @register="registerTable">
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{
          getStatusText(record.status)
        }}</a-tag>
      </template>
      <template #executeStartTime="{ record }">
        {{ record.executeStartTime || "-" }}
      </template>
      <template #deadline="{ record }">
        {{ record.deadline || "-" }}
      </template>
      <template #repairCount="{ record }">
        <a-tag color="blue">{{ record.repairCount }} 条</a-tag>
      </template>
      <template #actualCompletionTime="{ record }">
        {{ record.actualCompletionTime || "-" }}
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <!-- 详情模态框 -->
    <BasicModal
      v-model:visible="detailModalVisible"
      title="巡检任务详情"
      width="1200px"
      :ok-button-props="{ style: { display: 'none' } }"
      cancel-text="关闭"
      @cancel="closeDetail"
    >
      <div v-if="currentDetail">
        <!-- 基础信息 -->
        <a-card :title="'任务摘要'" :bordered="false" style="margin-bottom: 16px">
          <div class="form-grid">
            <div class="form-item">
              <a-form-item label="任务编号">
                <div class="field-value">{{ currentDetail.taskNo || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="计划名称">
                <div class="field-value">{{ currentDetail.planName || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="所属专业">
                <div class="field-value">{{ currentDetail.majorName || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="计划执行对象">
                <div class="field-value">{{ currentDetail.assigneeNames || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="实际执行人">
                <div class="field-value">
                  {{ currentDetail.actualExecutorNames || "无" }}
                </div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="执行开始时间">
                <div class="field-value">
                  {{ currentDetail.executeWindowStart || "无" }}
                </div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="截止时间">
                <div class="field-value">
                  {{ currentDetail.executeWindowEnd || "无" }}
                </div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="执行进度">
                <div class="field-value">
                  {{ currentDetail.executionProgress || "无" }}
                </div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="状态">
                <div class="field-value">
                  <a-tag :color="getStatusColor(currentDetail.status)">{{
                    getStatusText(currentDetail.status)
                  }}</a-tag>
                </div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="报修数">
                <div class="field-value">{{ currentDetail.repairCount || 0 }} 条</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="实际完成时间">
                <div class="field-value">{{ currentDetail.submittedAt || "无" }}</div>
              </a-form-item>
            </div>
          </div>
        </a-card>

        <!-- 结果汇总 -->
        <a-card :title="'结果汇总'" :bordered="false" style="margin-bottom: 16px">
          <div class="form-grid">
            <div class="form-item">
              <a-form-item label="巡检内容总数">
                <div class="field-value">{{ resultSummary.totalCount || 0 }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="已完成填写">
                <div class="field-value">{{ resultSummary.completedCount || 0 }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="报修数量">
                <div class="field-value">{{ resultSummary?.repairCount || 0 }}</div>
              </a-form-item>
            </div>
          </div>
        </a-card>

        <!-- 执行内容及结果反馈 -->
        <a-card
          :title="'执行内容及结果反馈'"
          :bordered="false"
          style="margin-bottom: 16px"
        >
          <BasicTable
            :columns="resultColumns"
            :data-source="feedbackResults"
            :pagination="false"
            :scroll="{ x: 1000, y: 300 }"
          >
            <template #status="{ record }">
              <a-tag :color="record.objectStatusText === '正常' ? 'green' : 'red'">
                {{ record.objectStatusText }}
              </a-tag>
            </template>
          </BasicTable>
        </a-card>

        <!-- 异常与报修关联 -->
        <a-card :title="'异常与报修关联'" :bordered="false">
          <BasicTable
            :columns="issueColumns"
            :data-source="issuesData"
            :pagination="false"
            :scroll="{ x: 1000 }"
          >
          </BasicTable>
        </a-card>
        <a-card :title="'操作记录'" :bordered="false">
          <a-timeline mode="alternate">
            <a-timeline-item v-for="item in handlingData" :key="item.id">
              <template #dot>
                <span class="timeline-dot"></span>
              </template>
              <div class="operation-record">
                <span class="record-content">{{ item.content }}</span>
                <span class="record-time">{{ item.operationTime }}</span>
                <span class="record-person">{{ item.createBy }}</span>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </div>
    </BasicModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useListPage } from "/@/hooks/system/useListPage";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import BasicModal from "/@/components/Modal/src/BasicModal.vue";
import TableAction from "@/components/Table/src/components/TableAction.vue";
import { columns, searchFormSchema } from "./inspectionTask.data";
import {
  getInspectionTaskList,
  executionFeedbackInspectionTask,
  resultSummaryInspectionTask,
  issueRepairRelationsInspectionTask,
  deleteInspectionTask,
  listByTaskIdInspectionTask
} from "./inspectionTask.api";

// 表格和查询表单配置
const { tableContext } = useListPage({
  designScope: "inspection-task",
  tableProps: {
    title: "巡检任务列表",
    api: getInspectionTaskList,
    columns,
    rowKey: "id",
    showIndexColumn: true,
    useSearchForm: true,
    showActionColumn: true,
    actionColumn: {
      title: "操作",
      width: 110,
      fixed: "right",
    },
    formConfig: {
      schemas: searchFormSchema,
    },
  },
});

const [registerTable, { reload, setTableData }] = tableContext;

// 详情数据
const detailModalVisible = ref(false);
const currentDetail = ref(null);
const feedbackResults = ref([]);
const resultSummary = ref({
  totalCount: 0,
  completedCount: 0,
  issueCount: 0,
  repairCount: 0,
});
// 异常与报修关联数据
const issuesData = ref([]);
const totalCount = ref(3); // 模拟数据
const handlingData = ref([]);
// 结果表格列定义（使用 dataIndex 渲染对象数据）
const resultColumns = [
  { title: "对象", key: "objectName", dataIndex: "objectName" },
  { title: "巡检项", key: "itemName", dataIndex: "itemName" },
  { title: "巡检内容", key: "contentName", dataIndex: "contentName" },
  {
    title: "状态",
    key: "objectStatusText",
    dataIndex: "objectStatusText",
    slots: { customRender: "status" },
  },
  { title: "结果反馈", key: "feedbackText", dataIndex: "feedbackText" },
];

// 异常表格列定义（使用 dataIndex 渲染对象数据）
const issueColumns = [
  { title: "异常对象", key: "issueObjectText", dataIndex: "issueObjectText" },
  { title: "异常说明", key: "description", dataIndex: "description" },
  { title: "处理方式", key: "handlingTypeText", dataIndex: "handlingTypeText" },
  { title: "关联报修", key: "repairOrderStatusText", dataIndex: "repairOrderStatusText" },
];

// 模拟详情数据（字段名称与基础信息显示一致）
const detailMap = {};

// 方法
const exportResult = () => {
  // 导出结果逻辑
  console.log("导出结果");
};

const openDetail = (record) => {
  console.log("=== 打开详情调试 ===");
  console.log("record:", record);
  console.log("record.taskNo:", record.taskNo);

  // 根据 taskNo 获取详情数据
  const detail = detailMap[record.taskNo] || record;
  console.log("detail:", detail);
  console.log("detail.results:", detail.results);

  // 将数组格式的数据转换为对象格式，便于表格渲染
  const results = detail.results || [];
  const formattedResults = results.map((item, index) => ({
    key: index,
    objectName: item[0] || "",
    itemName: item[1] || "",
    contentName: item[2] || "",
    objectStatusText: item[3] || "",
    feedbackText: item[4] || "",
  }));

  // 同样转换 issues 数据
  const issues = detail.issues || [];
  const formattedIssues = issues.map((item, index) => ({
    key: index,
    object: item[0] || "",
    description: item[1] || "",
    handling: item[2] || "",
    repair: item[3] || "-",
  }));

  // 更新详情数据，包含格式化后的 issues
  currentDetail.value = {
    ...detail,
    issues: formattedIssues,
  };

  feedbackResults.value = formattedResults;
  console.log("feedbackResults:", feedbackResults.value);
  console.log("feedbackResults.length:", feedbackResults.value.length);

  // 如果有真实的 API 数据，使用 API 数据
  if (record.id) {
    executionFeedbackInspectionTask({ taskId: record.id })
      .then((res) => {
        if (res && res.length > 0) {
          feedbackResults.value = res;
        }
      })
      .catch((err) => {
        console.error("API 请求失败:", err);
      });
    resultSummaryInspectionTask({ taskId: record.id })
      .then((res) => {
        resultSummary.value = res;
      })
      .catch((err) => {
        console.error("API 请求失败:", err);
      });
    issueRepairRelationsInspectionTask({ taskId: record.id })
      .then((res) => {
        if (res && res.length > 0) {
          issuesData.value = res;
        }
      })
      .catch((err) => {
        console.error("API 请求失败:", err);
      });

      listByTaskIdInspectionTask({ taskId: record.id })
        .then((res) => {
          if (res && res.length > 0) {
            handlingData.value = res;
          }
        })
        .catch((err) => {
          console.error("API 请求失败:", err);
        });
  }

  detailModalVisible.value = true;
};

const closeDetail = () => {
  detailModalVisible.value = false;
  currentDetail.value = null;
};

const getStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "待执行";
    case "IN_PROGRESS":
      return "执行中";
    case "COMPLETED":
      return "已完成";
    case "OVERDUE":
      return "已逾期";
    case "CANCELLED":
      return "已取消";
    default:
      return status;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "blue";
    case "IN_PROGRESS":
      return "orange";
    case "COMPLETED":
      return "green";
    case "OVERDUE":
      return "red";
    case "CANCELLED":
      return "default";
    default:
      return "blue";
  }
};

function getActions(record) {
  return [
    {
      label: "详情",
      onClick: openDetail.bind(null, record),
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
    // {
    //   label: "查看报修",
    //   onClick: () => console.log("查看报修", record),
    //   ifShow: () => record.repairCount > 0,
    // },
  ];
}
function handleDelete(record) {
  deleteInspectionTask({ id: record.id }, handleSuccess);
}
function handleSuccess() {
  reload();
}
</script>

<style scoped lang="less">
.summary-box {
  background: #fafbfc;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.summary-text {
  color: #666;
  font-size: 13px;
  line-height: 1.8;
}

.field-value {
  color: #111;
  font-size: 14px;
  line-height: 20px;
  display: inline-block;
  width: 100%;
}

/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .form-item {
    width: 100%;

    &.full-width {
      grid-column: 1 / -1;
    }

    :deep(.ant-form-item) {
      margin-bottom: 0;
      display: flex;
      align-items: center;

      .ant-form-item-label {
        flex-shrink: 0;
        width: 100px !important;
        text-align: right;
        padding: 0 8px 0 0;
        line-height: 18px;
        font-size: 13px;
      }

      .ant-form-item-control {
        flex: 1;
        min-width: 0;
        padding: 0;
      }
    }
  }
}

/* 卡片样式 - 无圆角无阴影 */
:deep(.ant-card) {
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;

  .ant-card-head {
    background: #ffffff;
    border-radius: 0;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0;

    .ant-card-head-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      padding: 10px 16px;
    }
  }

  .ant-card-body {
    background: #ffffff;
    border-radius: 0;
    padding: 10px 16px;
  }
}

/* 表格样式 - 无圆角无阴影 */
:deep(.ant-table) {
  border-radius: 0 !important;
  box-shadow: none !important;
}

:deep(.ant-table-thead) {
  > tr {
    > th {
      border-radius: 0 !important;
      background: #fafafa;
    }
  }
}

:deep(.ant-table-tbody) {
  > tr {
    > td {
      border-radius: 0 !important;
    }
  }
}

:deep(.ant-table-wrapper) {
  .ant-table-container {
    border-radius: 0 !important;
  }
}

/* 操作记录样式 */
.operation-record {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-content {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
}

.record-time {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.record-person {
  color: #1890ff;
  font-size: 12px;
  font-weight: 500;
}

.timeline-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

/* 详情弹框中的表单字段样式 - 水平排列 */
:deep(.ant-modal-body) {
  :deep(.ant-form-item) {
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .ant-form-item-label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      text-align: right;
      width: 120px !important;
      flex-shrink: 0;
      padding-top: 10px;
    }

    .ant-form-item-control {
      line-height: 1.5;
      flex: 1;
    }

    .ant-form-item-control-input {
      width: 100%;
    }

    .ant-form-item-label > label {
      display: block;
    }
  }
}

/* 标签样式优化 */
:deep(.ant-tag) {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

/* 模态框样式 */
:deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

:deep(.ant-modal-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;

  .ant-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: white;
  }

  .ant-modal-close {
    color: white;

    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

:deep(.ant-modal-body) {
  padding: 24px;
  background: #fafbfc;
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.ant-modal-content) {
    margin: 10px;
  }

  :deep(.ant-card-body) {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* 输入框、选择器和日期选择器样式 */
:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-picker) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
}

:deep(.ant-input:focus),
:deep(.ant-select-focused .ant-select-selector),
:deep(.ant-picker-focused) {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:deep(.ant-form-item-required::before) {
  color: #ff4d4f;
}

/* 表格样式 */
:deep(.ant-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .ant-table-thead > tr > th {
    background: #fafbfc;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f8f9fa;
  }
}

/* 搜索表单样式 */
:deep(.ant-form) {
  .ant-form-item {
    margin-bottom: 16px;
  }
}
</style>
