<template>
  <!-- 巡检内容编辑模态框 -->
  <BasicModal
    v-bind="$attrs"
    @register="registerContentModal"
    :title="contentModalTitle"
    @ok="handleContentSubmit"
    :width="900"
  >
    <div class="form-modal">
      <!-- 巡检项和巡检内容 -->
      <a-form
        ref="formRef"
        :model="contentForm"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row>
          <a-col :span="12">
            <a-form-item label="巡检对象类型" name="objectTypeText">
              <a-input v-model:value="contentForm.objectTypeText" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12" >
            <a-form-item :label="contentForm.objectTypeText == '设备' ? '设备类型' : (contentForm.objectTypeText == '空间' ? '空间类型' : '系统类型')" name="subtypeName">
              <a-input v-model:value="contentForm.objectSubtypeName" disabled />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <!-- 巡检项和巡检内容 -->
      <div class="level-container" v-if="contentForm.items.length > 0">
        <div class="level-title">
          <div class="title-section">
            <span class="title-text">巡检项列表</span>
          </div>
          <a-button
            v-if="handleType.value === 'add'"
            type="primary"
            size="small"
            class="add-item-btn"
            @click="addInspectItem"
            >+ 新增巡检项</a-button
          >
        </div>

        <div v-for="item in contentForm.items" :key="item.id" class="inspect-item">
          <div class="item-header">
            <div class="item-title-row">
              <h4 class="item-title">巡检项</h4>
              <div class="item-actions">
                <a-button
                  v-if="handleType.value === 'add'"
                  size="small"
                  type="default"
                  class="add-content-btn"
                  @click="addInspectContent(item.id)"
                >
                  + 新增巡检内容
                </a-button>
                <a-button
                  v-if="handleType.value === 'add'"
                  danger
                  size="small"
                  class="delete-btn"
                  @click="removeInspectItem(item.id)"
                >
                  删除巡检项
                </a-button>
              </div>
            </div>
            <div class="item-name-section">
              <label class="item-label">巡检项名称</label>
              <a-input
                v-model:value="item.itemName"
                placeholder="请输入巡检项，例如：外观检查、运行状态"
                style="width: 100%"
                :class="'inspect-item-input'"
              />
            </div>
          </div>

          <div class="content-list">
            <div v-for="content in item.contents" :key="content.id" class="content-card">
              <div class="content-input-row">
                <div class="input-with-label">
                  <label class="input-label">巡检内容</label>
                  <a-input
                    v-model:value="content.contentName"
                    placeholder="请输入巡检内容"
                    :class="'content-input'"
                  />
                </div>
                <div class="input-with-label">
                  <label class="input-label">结果类型</label>
                  <a-select
                    v-model:value="content.resultType"
                    placeholder="请选择"
                    :class="'result-type-select'"
                    @change="toggleOptionBox(content)"
                  >
                    <a-select-option value="OPTION">选项</a-select-option>
                    <a-select-option value="PERCENTAGE">百分比</a-select-option>
                    <a-select-option value="TEXT">文本</a-select-option>
                  </a-select>
                </div>
                <a-button
                  v-if="handleType.value === 'add'"
                  danger
                  size="small"
                  class="content-delete-btn"
                  @click="removeInspectContent(item.id, content.id)"
                >
                  删除
                </a-button>
              </div>
              <div class="content-options-row">
                <a-input
                  v-if="content.resultType != 'PERCENTAGE'"
                  v-model:value="content.optionValues"
                  :placeholder="
                    content.resultType === 'OPTION'
                      ? '请输入选项值，例如：完好/轻微损坏/严重损坏'
                      : '请输入文本'
                  "
                  style="width: 100%; margin-top: 12px"
                  :class="'options-input'"
                />
                <a-input-number
                  v-else
                  v-model:value="content.optionValues"
                  :min="0"
                  :max="100"
                  placeholder="请输入数值范围，例如：0-100"
                  style="width: 100%; margin-top: 12px"
                  :class="'options-input'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { BasicModal, useModalInner } from "/@/components/Modal";
// import { JDictSelectTag } from '/@/components/Jeecg/JDictSelectTag';
import { message } from "ant-design-vue";
// import { objectTypeList, objectTypeListChild } from './inspectionPlan.api';

const emit = defineEmits(["success", 'register']);
// 状态管理
const contentModalTitle = ref("新增巡检内容");
const subLabel = ref("");
const objectTypeData = ref([]);
const objectTypeChildData = ref([]);
const labelCol = { span: 5 };
const wrapperCol = { span: 13 };
const rules: Record<string, any[]> = {};
const loading = ref(false);
const handleType = ref("add");
// 当前记录
const currentRecord = ref<any>(null);

// 生成ID
let inspectItemSeed = 1000;
let inspectContentSeed = 5000;

// 表单数据
interface InspectContent {
  id: number;
  contentName: string;
  resultType: string;
  optionValues: string | number;
}

interface InspectItem {
  id: number;
  itemName: string;
  contents: InspectContent[];
}

interface ContentForm {
  objectType: string;
  templateName: string;
  objectSubtypeCode: string;
  objectSubtypeName: string;
  ext1: string;
  ext2: string;
  ext3: string;
  ext4: string;
  objectTypeText: string;
  majorId: string;
  templateId: string;
  items: InspectItem[];
}

const contentForm = reactive<ContentForm>({
  objectType: "",
  templateName: "123",
  objectSubtypeCode: "",
  objectSubtypeName: "",
  ext1: "",
  ext2: "",
  ext3: "",
  ext4: "",
  objectTypeText: "",
  majorId: "",
  templateId: "",
  items: [],
});

// 巡检内容模态框
const [
  registerContentModal,
  { setModalProps: setContentModalProps, closeModal: closeContentModal },
] = useModalInner();

// 通过事件监听接收数据
defineExpose({
  setModalData: (data: any) => {
    if (data) {
      init(data.type || "add", data.record || null, data.planContentData || null);
    }
  }
});
function init(type: string = "add", record: any = null, planContentData: any = null) {

  const titleMap: Record<string, string> = {
    add: "新增巡检内容",
    edit: "编辑巡检内容",
    copy: "复制巡检内容",
  };
  contentModalTitle.value = titleMap[type] || "巡检内容维护";

  // 保存当前记录
  currentRecord.value = record;

  // 完全重置表单
  contentForm.objectType = "";
  contentForm.templateName = "123";
  contentForm.objectSubtypeCode = "";
  contentForm.objectSubtypeName = "";
  contentForm.ext1 = "";
  contentForm.ext2 = "";
  contentForm.ext3 = "";
  contentForm.ext4 = "";
  contentForm.objectTypeText = "";
  contentForm.majorId = "";
  contentForm.templateId = "";
  contentForm.items = [];

  // 设置巡检对象类型信息
  if (planContentData) {
    contentForm.objectTypeText = planContentData.objectTypeText || "";
    contentForm.objectSubtypeName = planContentData.subtypeName || "";
  }

  if (type === "add") {
    // 新增模式：创建空表单
    contentForm.items = [createInspectItem()];
  } else if (type === "edit" && record) {
    // 编辑模式：回显数据
    // 使用表格数据中的字段名
    let optionValues = record.optionValues || "";
    if (typeof optionValues === "object" && optionValues !== null) {
      try {
        optionValues = JSON.stringify(optionValues);
      } catch (e) {
        optionValues = "";
      }
    }

    contentForm.items = [
      {
        id: ++inspectItemSeed,
        itemName: record.itemName || "",
        contents: [
          {
            id: ++inspectContentSeed,
            contentName: record.contentName || "",
            resultType: record.resultType || "",
            optionValues: optionValues,
          },
        ],
      },
    ];
  } else if (type === "copy" && record) {
    // 复制模式
    let optionValues = record.optionValues || "";
    if (typeof optionValues === "object" && optionValues !== null) {
      try {
        optionValues = JSON.stringify(optionValues);
      } catch (e) {
        optionValues = "";
      }
    }
    contentForm.items = [
      {
        id: ++inspectItemSeed,
        itemName: record.itemName || "",
        contents: [
          {
            id: ++inspectContentSeed,
            contentName: record.contentName || "",
            resultType: record.resultType || "",
            optionValues: optionValues,
          },
        ],
      },
    ];
  } else {
    contentForm.items = [createInspectItem()];
  }
  handleType.value = type;
}
async function handleContentSubmit() {
  try {
    setContentModalProps({ confirmLoading: true });
    if (contentForm.objectType == "device" || contentForm.objectType == "space") {
      contentForm.objectSubtypeName = contentForm.objectSubtypeCode;
    }
    // 创建要传递的数据对象
    const resultData = { 
      formData: { ...contentForm }, 
      type: handleType.value, 
      record: currentRecord.value 
    };
    // 触发事件传递数据到父组件
    emit("success", resultData);
    // 关闭弹窗
    closeContentModal();
  } catch (error) {
    console.error("保存巡检内容失败:", error);
    message.error("保存失败");
  } finally {
    setContentModalProps({ confirmLoading: false });
  }
}

function createInspectItem(data: any = null): InspectItem {
  return {
    itemName: data?.itemName || "",
    contents: data?.contents?.map((content: any) => ({
      id: ++inspectContentSeed,
      contentName: content.contentName || "",
      resultType: content.resultType,
      optionValues: content.optionValues,
    })) || [createInspectContent()],
  };
}

function createInspectContent(data: any = null): InspectContent {
  return {
    contentName: data?.contentName || "",
    resultType: data?.resultType || "",
    optionValues: data?.optionValues || "",
  };
}

function addInspectItem() {
  contentForm.items.push(createInspectItem());
}

function removeInspectItem(itemId: number) {
  if (contentForm.items.length <= 1) {
    message.warning("至少保留 1 条巡检项");
    return;
  }
  const index = contentForm.items.findIndex((item) => item.id === itemId);
  if (index > -1) {
    contentForm.items.splice(index, 1);
  }
}

function addInspectContent(itemId: number) {
  const item = contentForm.items.find((item) => item.id === itemId);
  if (item) {
    item.contents.push(createInspectContent());
  }
}

function removeInspectContent(itemId: number, contentId: number) {
  const item = contentForm.items.find((item) => item.id === itemId);
  if (item && item.contents.length <= 1) {
    message.warning("每条巡检项下至少保留 1 条巡检内容");
    return;
  }
  if (item) {
    const index = item.contents.findIndex((content) => content.id === contentId);
    if (index > -1) {
      item.contents.splice(index, 1);
    }
  }
}

function toggleOptionBox(content: InspectContent) {
  content.optionValues = content.optionValues;
}
onMounted(() => {
  init();
});
</script>

<style scoped lang="less">
/* ====================== 🔥 巡检项 + 巡检内容 终极优化 ====================== */
.level-container {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  .level-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;

    .title-text {
      font-size: 16px;
      font-weight: 500;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: "📋";
        font-size: 18px;
      }
    }

    .add-item-btn {
      border-radius: 6px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s ease;
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      color: #4b5563;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: #e5e7eb;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
    }
  }
}

/* 巡检项样式 - 与巡检项知识库弹框保持一致 */
.inspect-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;

  &:last-child {
    margin-bottom: 0;
  }

  .item-header {
    margin-bottom: 16px;

    .item-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .item-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .item-actions {
        display: flex;
        gap: 8px;
      }
    }

    .item-name-section {
      .item-label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .inspect-item-input {
        width: 100%;
      }
    }
  }

  .content-list {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #e8e8e8;

    .content-card {
      background: #fafbfc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .content-input-row {
        display: flex;
        align-items: flex-start;
        gap: 16px;

        .input-with-label {
          flex: 1;

          .input-label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }

          .content-input {
            width: 100%;
          }

          .result-type-select {
            width: 100%;
          }
        }

        .content-delete-btn {
          margin-top: 24px;
        }
      }

      .content-options-row {
        .options-input {
          width: 100%;
          margin-top: 12px;
        }
      }
    }
  }
}
</style>
