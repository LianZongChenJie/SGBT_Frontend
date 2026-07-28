<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    width="900px"
    @ok="handleSubmit"
  >
    <div class="form-modal">
      <!-- 巡检项 -->
      <div class="inspect-item">
        <div class="item-header">
          <div class="item-title-row">
            <h4 class="item-title">巡检项</h4>
          </div>
          <div class="item-name-section">
            <label class="item-label">巡检项名称</label>
            <a-input
              v-model:value="formData.name"
              placeholder="请输入巡检项，例如：外观检查、运行状态"
              style="width: 100%"
              :class="'inspect-item-input'"
            />
          </div>
          <div class="item-name-section" style="margin-top: 10px">
            <label class="item-label">说明</label>
            <a-textarea
              v-model:value="formData.description"
              :auto-size="{ minRows: 2, maxRows: 5 }"
              placeholder="请输入巡检项，例如：外观检查、运行状态"
              style="width: 100%"
              :class="'inspect-item-input'"
            />
          </div>
        </div>

        <!-- 巡检内容列表 -->
        <div class="content-list">
          <div class="level-title">
            <div class="title-section">
              <span class="title-text">巡检内容</span>
            </div>
            <a-button
              type="primary"
              size="small"
              class="add-content-btn"
              @click="addInspectContent"
            >
              + 新增巡检内容
            </a-button>
          </div>

          <div
            v-for="content in formData.contents"
            :key="content.id"
            class="content-card"
          >
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
                danger
                size="small"
                class="content-delete-btn"
                @click="removeInspectContent(content.id)"
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
  </BasicModal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { BasicModal, useModalInner } from "/@/components/Modal";
import {
  queryInspectionItemKnowledgeDetail,
  addInspectionItemKnowledge,
  editInspectionItemKnowledge,
} from "./inspectionItemKnowledge.api";
import { message } from "ant-design-vue";

const emit = defineEmits(["success", "register"]);

const modalTitle = ref("新增");
const formRef = ref<any>(null);

const formData = reactive({
  name: "",
  description: "",
  contents: [{ id: 1, contentName: "", resultType: "OPTION", optionValues: "" }],
});

const recordId = ref<string | null>(null);

const [registerModal, { closeModal }] = useModalInner((data) => {
  if (data?.record?.id) {
    recordId.value = data.record.knowledgeItemId;
    modalTitle.value = "编辑";
    loadData(data.record.knowledgeItemId);
  } else {
    recordId.value = null;
    modalTitle.value = "新增";
    resetForm();
  }
});

async function loadData(id) {
  try {
    const res = await queryInspectionItemKnowledgeDetail({ id: id });
    if (res) {
      formData.name = res.name || "";
      formData.description = res.description || "";
      if (res.contents && Array.isArray(res.contents)) {
        formData.contents = res.contents.map((content, index) => ({
          id: content.id,
          contentName: content.contentName || "",
          resultType: content.resultType || "OPTION",
          optionValues: content.optionValues || "",
        }));
      } else if (res.contentName) {
        formData.contents = [
          { id: 1, contentName: res.contentName, resultType: "OPTION", optionValues: "" },
        ];
      }
    }
  } catch (error) {
    console.error("加载数据失败:", error);
  }
}

function resetForm() {
  formData.name = "";
  formData.contents = [
    { id: 1, contentName: "", resultType: "OPTION", optionValues: "" },
  ];
}

function addInspectContent() {
  const newId =
    formData.contents.length > 0
      ? Math.max(...formData.contents.map((c) => c.id)) + 1
      : 1;
  formData.contents.push({
    id: newId,
    contentName: "",
    resultType: "OPTION",
    optionValues: "",
  });
}

function removeInspectContent(contentId) {
  if (formData.contents.length > 1) {
    formData.contents = formData.contents.filter((c) => c.id !== contentId);
  } else {
    formData.contents[0].contentName = "";
    formData.contents[0].resultType = "OPTION";
    formData.contents[0].optionValues = "";
  }
}

function toggleOptionBox(content) {
  content.optionValues = "";
}

async function handleSubmit() {
  try {
    const submitData = {
      name: formData.name,
      description: formData.description,
      contents: formData.contents.map((content) => ({
        contentName: content.contentName,
        resultType: content.resultType,
        optionValues: content.optionValues,
      })),
    };

    if (recordId.value) {
      await editInspectionItemKnowledge({
        id: recordId.value,
        ...submitData,
      });
    } else {
      await addInspectionItemKnowledge(submitData);
    }

    emit("success");
    closeModal();
    resetForm();
  } catch (error) {
    console.error("提交失败:", error);
  }
}

</script>

<style lang="less" scoped>
.form-modal {
  padding: 16px;
}

.level-container {
  margin-top: 16px;
}

.level-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .title-section {
    .title-text {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }

  .add-item-btn {
    margin-left: auto;
  }
}

.inspect-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-header {
  margin-bottom: 16px;
}

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

.content-list {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
}

.content-card {
  background: #fafbfc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
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
</style>
