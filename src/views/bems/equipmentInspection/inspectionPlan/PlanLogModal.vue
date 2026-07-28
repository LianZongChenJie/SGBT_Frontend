<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="巡检日志"
    width="700px"
    okText="保存"
    cancelText="关闭"
    @ok="handleSave"
  >
    <div class="form-modal" style="padding-bottom: 0px">
      <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical" style="margin-bottom: 16px">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="日期" name="logDate">
              <a-date-picker
                v-model:value="formData.logDate"
                format="YYYY-MM-DD"
                placeholder="选择日期"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="内容" name="content">
              <a-textarea
                v-model:value="formData.content"
                placeholder="请输入日志内容"
                :rows="1"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <a-button type="link" danger size="small" @click="handleDelete(record)">
          删除
        </a-button>
      </template>
    </BasicTable>
  </BasicModal>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import BasicTable from "@/components/Table/src/BasicTable.vue";
import { BasicModal, useModalInner } from "/@/components/Modal";
import { useListPage } from "@/hooks/system/useListPage";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { getPlanLogList, savePlanLog } from "./inspectionPlan.api";

const emit = defineEmits(["success", "register"]);

const formRef = ref();
const props = defineProps({
  planId: {
    type: String,
    default: null,
  },
});
console.log(props.planId)
const columns = [
  { title: "日期", dataIndex: "logDate", key: "logDate", width: 150 },
  { title: "内容", dataIndex: "content", key: "content" },
];

const formData = reactive({
  logDate: dayjs() as any,
  content: "",
  planId: null as any,
});

const rules = {
  logDate: [{ required: true, message: "请选择日期", trigger: "change" }],
  content: [{ required: true, message: "请输入内容", trigger: "blur" }],
};

const [registerModal] = useModalInner((data) => {
  formData.planId = data.id;
});

const { tableContext } = useListPage({
  tableProps: {
    title: "巡检日志列表",
    api: getPlanLogList,
    columns,
    bordered: true,
    showIndexColumn: false,
    pagination: true,
    searchInfo: {
      planId: props.planId,
    },
    rowKey: "id",
    showActionColumn: false,
    actionColumn: {
      title: "操作",
      width: 80,
    },
  },
});

const [registerTable, { reload }] = tableContext;

async function handleSave() {
  try {
    await formRef.value.validate();
    
    const dateStr = formData.logDate.format
      ? formData.logDate.format("YYYY-MM-DD")
      : formData.logDate;

    await savePlanLog({
      planId: formData.planId,
      logDate: dateStr,
      content: formData.content,
    });

    formData.logDate = dayjs();
    formData.content = "";
    formRef.value.clearValidate();
    reload();
    return true;
  } catch (error) {
    return false;
  }
}

function handleDelete(record: any) {
  message.success("删除成功");
  reload();
}
</script>
