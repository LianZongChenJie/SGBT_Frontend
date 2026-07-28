<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="contentViewTitle + ' - 巡检内容'"
    width="960px"
    :ok-button-props="{ style: { display: 'none' } }"
    cancelText="关闭"
  >
    <BasicTable
      ref="tableRef"
      :columns="contentViewColumns"
      :data-source="tableDataSource"
      :pagination="false"
      :bordered="true"
      :row-key="(record) => record.id"
    >
      <template #tableTitle>
        <a-button type="primary" @click="handleAddItem()">新增巡检内容</a-button>
      </template>
      <template #resultType="{ record }">
        <a-tag :color="getResultTypeColor(record.resultType)">{{
          resultTypeText[record.resultType]
        }}</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
  </BasicModal>
  <addContentModal @register="contentModal" @success="handleContentSuccess" ref="contentModalRef" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { BasicModal, useModalInner, useModal } from "/@/components/Modal";
import { BasicTable } from "/@/components/Table";
import TableAction from "@/components/Table/src/components/TableAction.vue";
import addContentModal from "./addContentModal.vue";
import { message } from "ant-design-vue";
import { contentViewColumns } from "./inspectionPlan.data";
import { resultTypeText } from "/@/utils/allData";

const emit = defineEmits(["success", "register"]);

const [contentModal, { openModal: openContentModal }] = useModal();
const contentViewTitle = ref("");
const contentModalRef = ref<any>(null);
const tableRef = ref<any>(null);

const props = defineProps({
  planContentData: {
    type: Object,
    default: () => {},
  },
});

// 使用响应式数据作为表格数据源
const tableDataSource = reactive<Recordable[]>([...(props.planContentData.contentItems || [])]);

// 当前编辑的数据
const currentRecord = ref<any>(null);

// 监听 props.planContentData 的变化，更新表格数据
watch(
  () => props.planContentData,
  (newData) => {
    console.log("props.planContentData changed:", newData);
    if (newData && newData.contentItems && Array.isArray(newData.contentItems)) {
      updateTableDataSource(newData.contentItems);
    }
  },
  { deep: true }
);

function getResultTypeColor(type: string) {
  const colors: Record<string, string> = {
    选项: "green",
    百分比: "orange",
    文本: "blue",
  };
  return colors[type] || "blue";
}

const [registerModal] = useModalInner((data) => {
  console.log("Modal data:", data);
  // 当弹窗打开时更新表格数据
  if (data && data.contentItems && Array.isArray(data.contentItems)) {
    console.log("更新表格数据:", data.contentItems);
    updateTableDataSource(data.contentItems);
  } else if (props.planContentData && props.planContentData.contentItems) {
    // 如果 useModalInner 没有传递数据，使用 props
    console.log("使用 props 初始化表格数据:", props.planContentData.contentItems);
    updateTableDataSource(props.planContentData.contentItems);
  }
});

// 更新表格数据源
function updateTableDataSource(items: any[]) {
  tableDataSource.length = 0;
  items.forEach((item) => tableDataSource.push(item));
}

function handleAddItem() {
  currentRecord.value = null;
  // 先设置数据再打开弹窗
  if (contentModalRef.value) {
    contentModalRef.value.setModalData({ 
      type: "add", 
      record: null,
      planContentData: props.planContentData
    });
  }
  openContentModal();
}

function handleEdit(record: Recordable) {
  currentRecord.value = record;
  // 先设置数据再打开弹窗
  if (contentModalRef.value) {
    contentModalRef.value.setModalData({ 
      type: "edit", 
      record,
      planContentData: props.planContentData
    });
  }
  openContentModal();
}

function handleDelete(index: number) {
  console.log("删除索引:", index);
  console.log("当前表格数据:", tableDataSource);
  
  if (index >= 0 && index < tableDataSource.length) {
    tableDataSource.splice(index, 1);
    message.success("删除成功");
    
    // 触发事件，将更新后的数据传递给父组件（巡检明细）
    emit("success", {
      ...props.planContentData,
      contentItems: [...tableDataSource]
    });
  } else {
    message.warning("无效的索引");
  }
}

function getActions(record) {
  return [
    {
      label: "编辑",
      onClick: handleEdit.bind(null, record),
    },
    {
        label: "删除",
        popConfirm: {
          title: "是否确认删除",
          confirm: () => {
            console.log("========== 删除调试 ==========");
            console.log("要删除的记录:", record);
            console.log("记录的 id:", record.id, "类型:", typeof record.id);
            console.log("当前表格数据:", tableDataSource);
            
            // 使用 findIndex 查找要删除的记录
            // 优先使用 id 匹配，如果 id 不可用则使用 contentName + itemName 组合匹配
            const index = tableDataSource.findIndex((item) => {
              // 如果有 id，优先用 id 匹配（统一转成字符串比较）
              if (record.id != null && item.id != null) {
                const recordIdStr = String(record.id);
                const itemIdStr = String(item.id);
                console.log(`比较 id: ${recordIdStr} vs ${itemIdStr}, 相等: ${recordIdStr === itemIdStr}`);
                if (recordIdStr === itemIdStr) {
                  return true;
                }
              }
              // 如果没有 id 或 id 不匹配，用 contentName 和 itemName 组合匹配
              if (record.contentName != null && record.itemName != null) {
                if (item.contentName === record.contentName && item.itemName === record.itemName) {
                  console.log(`内容匹配: itemName=${item.itemName}, contentName=${item.contentName}`);
                  return true;
                }
              }
              // 作为最后的匹配手段，尝试直接比较对象引用
              if (record === item) {
                console.log("对象引用匹配");
                return true;
              }
              return false;
            });
            
            console.log("找到的索引:", index);
            
            // 检查是否找到要删除的记录
            if (index > -1) {
              // 直接从数组中删除该记录
              tableDataSource.splice(index, 1);
              
              message.success("删除成功");
              
              // 刷新表格
              if (tableRef.value) {
                tableRef.value.reload();
              }
              
              // 触发事件，将更新后的数据传递给父组件（巡检明细）
              emit("success", {
                ...props.planContentData,
                contentItems: [...tableDataSource],
                isUpdate: true
              });
            } else {
              message.warning("未找到要删除的记录");
            }
          },
          placement: "topLeft",
        },
        danger: true,
      },
  ];
}

// 处理新增/编辑巡检内容成功
function handleContentSuccess(data: any) {
  const { formData, type } = data;
  
  if (type === "add") {
    // 将每条巡检内容添加到表格
    formData.items.forEach((item: any) => {
      item.contents.forEach((content: any) => {
        tableDataSource.push({
          id: Date.now() + Math.random(),
          itemName: item.itemName,
          contentName: content.contentName,
          resultType: content.resultType,
          optionValues: content.optionValues,
          source: "计划内新增",
        });
      });
    });
    message.success("新增成功");
  } else if (type === "edit" && formData.items.length > 0) {
    // 编辑逻辑：更新对应行的数据
    const firstItem = formData.items[0];
    if (firstItem.contents.length > 0) {
      const firstContent = firstItem.contents[0];
      const index = tableDataSource.findIndex((item) => item.id === currentRecord.value.id);
      if (index > -1) {
        tableDataSource[index] = {
          ...tableDataSource[index],
          itemName: firstItem.itemName,
          contentName: firstContent.contentName,
          resultType: firstContent.resultType,
          optionValues: firstContent.optionValues,
        };
      }
    }
    message.success("编辑成功");
  }
  
  // 触发事件，将更新后的数据传递给父组件（巡检明细）
  emit("success", {
    ...props.planContentData,
    contentItems: [...tableDataSource],
    isUpdate: true
  });
}

onMounted(() => {
  contentViewTitle.value = props.planContentData.subtypeName || "";
});
</script>

<style scoped>
.table-header {
  margin-bottom: 16px;
}
</style>