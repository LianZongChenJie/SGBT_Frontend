<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="选择巡检对象模板"
    width="920px"
    @ok="handleSubmit"
  >
    <a-table
      :columns="objectPreviewColumns"
      :data-source="objectPreviewList"
      :pagination="false"
      size="small"
      :row-selection="{
        type: 'checkbox',
        selectedRowKeys: selectedKeys,
        onChange: handleSelectionChange,
      }"
      row-key="templateId"
    >
      <template #objectType="{ record: record }">{{
        record.objectType == "device"
          ? "设备"
          : record.objectType == "system"
          ? "系统"
          : "空间"
      }}</template>
    </a-table>
    <a-alert
      message="提示：保存后，系统会自动匹配当前专业下该对象分类对应的巡检内容。"
      type="info"
      show-icon
      class="mt-4"
    />
  </BasicModal>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { BasicModal, useModalInner } from "/@/components/Modal";
import { message } from "ant-design-vue";
import { objectPreviewColumns } from "./inspectionPlan.data";
import { getInspectionDetails } from "./inspectionPlan.api";

const emit = defineEmits(["success", "register"]);

const selectedKeys = ref<string[]>([]);
const props = defineProps({
  todo: {
    type: Object,
    default: () => ({}),
  },
});
const objectPreviewList = ref([]);

const [registerModal, { closeModal }] = useModalInner((data) => {});
// 弹窗打开时执行
selectedKeys.value = [];

// 获取传入的 todo 数据
const todoData = props.todo;
console.log("传入的数据:", todoData);

// 重新加载数据
if (todoData) {
  const params = {
    majorId: todoData.majorId,
    positionInfo: todoData.positionInfo,
    objectType: todoData.objectType,
    campus: todoData.campus,
  };
  getInspectionDetails(params).then((res) => {
    objectPreviewList.value = res.data || res.details || [];

    // 使用 nextTick 确保表格渲染完成后再设置勾选
    nextTick(() => {
      // 如果有已选择的对象ID，自动勾选
      if (todoData.selectedIds && todoData.selectedIds.length > 0) {
        // 遍历所有数据项，打印完整信息进行调试
        objectPreviewList.value.forEach((item, index) => {});

        // 找到匹配的 templateId 并设置选中
        const matchedTemplateIds = objectPreviewList.value
          .filter((item) => {
            if (!item.targetObjects) return false;
            return item.targetObjects.some((obj) =>
              todoData.selectedIds.includes(obj.objectCode)
            );
          })
          .map((item) => item.templateId);

        console.log("匹配的templateId:", matchedTemplateIds);

        // 使用 setTimeout 确保表格完全渲染后再设置
        setTimeout(() => {
          selectedKeys.value = [...matchedTemplateIds];
          console.log("最终设置的勾选状态:", selectedKeys.value);
        }, 100);
      }
    });
  });
}
function handleSelectionChange(selectedRowKeys: string[], selectedRows: any[]) {
  selectedKeys.value = selectedRowKeys;
}

async function handleSubmit() {
  if (selectedKeys.value.length === 0) {
    message.warning("请至少选择一个巡检对象");
    return;
  }
  try {
    // 使用 templateId 来过滤选择的对象（表格的 row-key 是 templateId）
    const selectedObjects = objectPreviewList.value.filter((item) =>
      selectedKeys.value.includes(item.templateId)
    );
    console.log("选择的巡检对象:", selectedObjects);
    // 发送选择的对象给父组件
    emit("success", { objects: selectedObjects });
    closeModal();
  } catch (error) {
    console.error("保存失败", error);
  }
}
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>
