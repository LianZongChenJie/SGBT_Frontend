<template>
  <div class="equipment-inspection-content">
    <div class="main-container">
      <!-- 专业列表 -->
      <div class="major-side">
        <div class="section-header">
          <span class="section-title">专业列表</span>
          <a-button type="primary" @click="openMajorModal('add')">新增专业</a-button>
        </div>

        <div class="major-list">
          <div
            v-for="major in majorListData"
            :key="major.name"
            class="major-card"
            :class="{ active: currentMajor === major.name }"
            @click="selectMajor(major.name, major)"
          >
            <div class="major-name">{{ major.name }}</div>
            <div class="meta">巡检内容：{{ major.totalContentCount }}</div>
            <div class="meta">对象类型覆盖：{{ major.objectTypeCoverage }}</div>
            <div class="major-actions">
              <a @click.stop="openMajorModal('edit', major)">编辑</a>
              <a-popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="deleteMajorItem(major.id)"
              >
                <a href="#" class="delete-link">删除</a>
              </a-popconfirm>
            </div>
          </div>
        </div>
      </div>

      <!-- 巡检内容 -->
      <div class="content-side">
        <!-- 表格 -->
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <div class="table-title-row">
              <a-button type="primary" @click="openContentModal('add')"
                >新增巡检内容</a-button
              >
              <div class="info-summary">
                <span
                  >当前专业：<strong>{{ majorObj?.name || "无" }}</strong></span
                >
                <span class="divider">|</span>
                <span
                  >内容总数：<strong>{{
                    majorObj?.totalContentCount ?? "无"
                  }}</strong></span
                >
                <span class="divider">|</span>
                <span
                  >已启用：<strong>{{
                    majorObj?.activeContentCount ?? "无"
                  }}</strong></span
                >
              </div>
            </div>
          </template>

          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
          <!-- <template #action="{ record }">
            <a @click="openContentModal('edit', record.editKey)">编辑</a>
            <a @click="openContentModal('edit', record.editKey)">删除</a>
          </template> -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'resultType'">
              <a-tag :color="getResultTypeColor(record.resultType)">{{
                resultTypeText[record.resultType]
              }}</a-tag>
            </template>
          </template>
        </BasicTable>
      </div>
    </div>

    <!-- 专业编辑模态框 -->
    <BasicModal
      v-bind="$attrs"
      @register="registerMajorModal"
      :title="majorModalTitle"
      @ok="handleMajorSubmit"
      :width="560"
    >
      <div class="form-modal">
        <BasicForm @register="registerMajorForm" />
      </div>
    </BasicModal>

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
              <a-form-item label="巡检对象类型" name="objectType">
                <a-select
                  v-model:value="contentForm.objectType"
                  placeholder="请选择设备类型"
                  @change="objectTypeChange"
                >
                  <a-select-option
                    v-for="(item, index) in objectTypeData"
                    :value="item.typeCode"
                    >{{ item.typeName }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="contentForm.objectType">
              <a-form-item :label="subLabel" name="objectSubtypeCode">
                <JDictSelectTag
                  v-if="
                    contentForm.objectType == 'device' ||
                    contentForm.objectType == 'space'
                  "
                  v-model:value="contentForm.objectSubtypeCode"
                  placeholder="请选择具体设备/空间类型"
                  :dictCode="
                    contentForm.objectType == 'device'
                      ? 'inspection_equipment_type'
                      : 'inspection_space_type'
                  "
                />
                <a-select
                  v-else
                  v-loading="loading"
                  v-model:value="contentForm.objectSubtypeCode"
                  placeholder="请选择具体设备/空间类型"
                  @change="objectSubtypeChange"
                >
                  <a-select-option
                    v-for="(item, index) in objectTypeChildData"
                    :value="item.id"
                    >{{ item.name }}</a-select-option
                  >
                </a-select>
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
            <div class="button-group">
              <a-button
                style="margin-right: 10px"
                type="default"
                size="small"
                class="import-btn"
                @click="openImportModal"
                >引入知识库</a-button
              >
              <a-button
                type="primary"
                size="small"
                class="add-item-btn"
                @click="addInspectItem"
                >+ 新增巡检项</a-button
              >
            </div>
          </div>

          <div v-for="item in contentForm.items" :key="item.id" class="inspect-item">
            <div class="item-header">
              <div class="item-title-row">
                <h4 class="item-title">巡检项</h4>
                <div class="item-actions">
                  <a-button
                    size="small"
                    type="default"
                    class="add-content-btn"
                    @click="addInspectContent(item.id)"
                  >
                    + 新增巡检内容
                  </a-button>
                  <a-button
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
              <div
                v-for="content in item.contents"
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

    <!-- 引入知识库模态框 -->
    <BasicModal
      v-bind="$attrs"
      @register="registerImportModal"
      title="引入巡检知识库"
      :width="1100"
      @ok="handleImportModalOk"
    >
      <BasicTable @register="registerImportTable" :rowSelection="rowSelection">
      </BasicTable>
    </BasicModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import BasicTable from "@/components/Table/src/BasicTable.vue";
import { useListPage } from "@/hooks/system/useListPage";
import { columns, searchFormSchema } from "./inspectionContent.data";
import TableAction from "@/components/Table/src/components/TableAction.vue";
import {
  majorList,
  saveMajor,
  deleteMajor,
  taskList,
  objectTypeList,
  objectTypeListChild,
  createTemplate,
  deleteInspectionContent,
  getDetail,
} from "./inspectionContent.api";
import { BasicModal, useModal } from "/@/components/Modal";
import { BasicForm, useForm } from "/@/components/Form";
import { defHttp } from "/@/utils/http/axios";
import { resultTypeText } from "/@/utils/allData";
import type { Rule } from "ant-design-vue/es/form";
import { JDictSelectTag } from "/@/components/Form";
import {
  listInspectionItemKnowledge,
  queryInspectionItemKnowledgeDetail,
} from "../inspectionItemKnowledge/inspectionItemKnowledge.api";
import {
  columns as knowledgeColumns,
  searchFormSchema as knowledgeSearchSchema,
} from "../inspectionItemKnowledge/inspectionItemKnowledge.data";

// 类型定义
interface Major {
  id: string;
  name: string;
  total: string;
  coverage: string;
  code?: string;
  sort?: number;
}

interface InspectContent {
  id: number;
  contentName: string;
  resultType: string;
  optionValues: string;
}

interface InspectItem {
  id: number;
  itemName: string;
  contents: InspectContent[];
}

interface ContentForm {
  objectType: string;
  objectSubtypeCode: string;
  objectSubtypeName: string;
  templateName: string;
  majorId: string;
  ext1: string;
  ext2: string;
  ext3: string;
  ext4: string;
  templateId: string;
  objectTypeText: string;
  items: InspectItem[];
}

interface MajorData {
  id: string;
  total: string;
  enabled: string;
  rows: any[];
}

// 状态管理
const currentMajor = ref("安保");
const currentMajorId = ref("");
const majorModalTitle = ref("新增专业");
const contentModalTitle = ref("新增巡检内容");
const subLabel = ref("");
const objectTypeData = ref([]);
const objectTypeChildData = ref([]);
const labelCol = { span: 5 };
const wrapperCol = { span: 13 };
const rules: Record<string, Rule[]> = {};
// 专业列表数据
const majorListData = ref<Major[]>([]);
const majorObj = ref();
// 专业数据集
const majorDataset = reactive<Record<string, MajorData>>({});
const handleType = ref("add");
const loading = ref(false);
// 内容模板映射
const contentTemplateMap = reactive({});

// 计算属性
const currentMajorData = computed(
  () => majorDataset[currentMajor.value] || { total: "0 条", enabled: "0 条", rows: [] }
);

// 生成ID
let inspectItemSeed = 1000;
let inspectContentSeed = 5000;

// 包装taskList函数，确保传递最新的majorId
const wrappedTaskList = async (params: any) => {
  // 合并参数，确保包含最新的majorId
  const newParams = {
    ...params,
    majorId: currentMajorId.value,
  };
  return taskList(newParams);
};

// 使用JeecgBoot的useListPage
const { tableContext } = useListPage({
  designScope: "inspection-content-template",
  tableProps: {
    title: "巡检内容列表",
    api: wrappedTaskList,
    columns: columns,
    showTableSetting: true,
    formConfig: {
      schemas: searchFormSchema,
    },
    showActionColumn: true,
    actionColumn: {
      title: "操作",
      width: 100,
      fixed: "right",
    },
    showIndexColumn: true,
    immediate: false, // 不自动加载数据，等待专业列表加载完成后再加载
  },
});

const [registerTable, { reload }] = tableContext;

// 专业表单
const [
  registerMajorForm,
  {
    setFieldsValue: setMajorFieldsValue,
    resetFields: resetMajorFields,
    validate: validateMajorForm,
  },
] = useForm({
  labelWidth: 100,
  schemas: [
    {
      field: "name",
      label: "专业名称",
      component: "Input",
      required: true,
      componentProps: {
        placeholder: "请输入专业名称，例如：安保",
      },
    },
    {
      field: "code",
      label: "专业编码",
      component: "Input",
      required: true,
      dynamicDisabled: true,
      componentProps: {},
    },
    {
      field: "sort",
      label: "排序",
      component: "InputNumber",
      componentProps: {
        placeholder: "请输入排序值",
      },
    },
    {
      field: "id",
      label: "id",
      component: "Input",
      show: false,
    },
  ],
  showActionButtonGroup: false,
});

// 专业模态框
const [
  registerMajorModal,
  {
    setModalProps: setMajorModalProps,
    closeModal: closeMajorModal,
    openModal: openMajorModalInner,
  },
] = useModal();

// 巡检内容模态框
const [
  registerContentModal,
  {
    setModalProps: setContentModalProps,
    closeModal: closeContentModal,
    openModal: openContentModalInner,
  },
] = useModal();

// 引入知识库模态框
const [
  registerImportModal,
  { openModal: openImportModalInner, closeModal: closeImportModal },
] = useModal();
const importSelectedIds = ref<Set<string>>(new Set());

// 打开引入知识库模态框
function openImportModal() {
  importSelectedIds.value.clear();
  openImportModalInner();
}

// 引入知识库表格
const { tableContext: importTableContext } = useListPage({
  designScope: "inspection-knowledge-import",
  tableProps: {
    title: "巡检知识库列表",
    api: listInspectionItemKnowledge,
    columns: [...knowledgeColumns],
    bordered: true,
    showIndexColumn: false,
    pagination: true,
    useSearchForm: true,
    formConfig: {
      schemas: knowledgeSearchSchema,
    },
    rowSelection: { type: "checkbox" },
    rowKey: "id",
    showActionColumn: false,
  },
});

const [
  registerImportTable,
  { reload: reloadImportTable },
  { rowSelection, selectedRows, selectedRowKeys },
] = importTableContext;

// 判断是否选中
function isImportSelected(id: string): boolean {
  return importSelectedIds.value.has(id);
}

// 切换选中状态
function toggleImportSelect(id: string): void {
  if (importSelectedIds.value.has(id)) {
    importSelectedIds.value.delete(id);
  } else {
    importSelectedIds.value.add(id);
  }
}

// 引入知识库模态框确定
async function handleImportModalOk() {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    closeImportModal();
    return;
  }

  // 检查是否需要替换第一个空巡检项
  const firstItemEmpty = 
    contentForm.items.length === 0 || 
    (contentForm.items.length === 1 && !contentForm.items[0].itemName && 
     contentForm.items[0].contents.length === 1 && !contentForm.items[0].contents[0].contentName);

  selectedRows.value.forEach((item, index) => {
    if (item.contents && item.contents.length > 0) {
      // 创建巡检项，使用知识库的巡检项名称
      const newItem: InspectItem = {
        id: ++inspectItemSeed,
        itemName: item.knowledgeItemName || item.itemName || "",
        contents: item.contents.map((content: any) => ({
          id: ++inspectContentSeed,
          contentName: content.contentName || "",
          resultType: content.resultType || "TEXT",
          optionValues: content.optionValues || "",
        })),
      };

      // 如果是第一个引入项且表单为空，替换第一个位置；否则追加
      if (index === 0 && firstItemEmpty) {
        contentForm.items = [newItem];
      } else {
        contentForm.items.push(newItem);
      }
    }
  });

  message.success(`成功引入 ${selectedRows.value.length} 条巡检知识`);
  closeImportModal();
}


// 表单数据
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
  majorId: currentMajorId.value,
  templateId: "",
  items: [],
});
function getMajorList() {
  // 保存当前选中的专业，刷新后保持选中状态
  const previousMajor = currentMajor.value;
  const previousMajorId = currentMajorId.value;

  majorList({}).then((res) => {
    majorListData.value = res.records || [];
    // 默认选中第一个专业
    if (majorListData.value.length > 0) {
      // 尝试找到之前选中的专业，如果存在则保持选中，否则选中第一个
      const selectedMajor =
        majorListData.value.find(
          (major) => major.name === previousMajor || major.id === previousMajorId
        ) || majorListData.value[0];

      currentMajor.value = selectedMajor.name;
      currentMajorId.value = selectedMajor.id || "";
      majorObj.value = selectedMajor;
      setTimeout(() => {
        reload(); // 刷新表格并传递最新的专业ID
      }, 200);
    }
  });
}
// 方法
function openMajorModal(type: string, major: Major | null = null) {
  majorModalTitle.value = type === "edit" ? "编辑专业" : "新增专业";
  majorObj.value = major;
  // 先打开模态框
  openMajorModalInner();
  // 存储当前编辑的专业信息
  setTimeout(() => {
    if (type === "edit" && major) {
      setMajorFieldsValue({
        name: major.name,
        code: major.code || "",
        sort: major.sort || 0,
        id: major.id,
      });
    } else {
      // 新增时清空表单
      resetMajorFields();
      // 调用接口获取专业编码
      defHttp
        .get(
          { url: "/modelInspection/inspectionMajor/getNo" },
          { isTransformResponse: false }
        )
        .then((res) => {
          if (res.success && res.result) {
            setMajorFieldsValue({
              code: res.result || "",
            });
          }
        })
        .catch((error) => {
          console.error("获取专业编码失败:", error);
        });
    }
  }, 100);
}

function openContentModal(type: string, record: any = null) {
  getObjectTypeList();
  const titleMap: Record<string, string> = {
    add: "新增巡检内容",
    edit: "编辑巡检内容",
    copy: "复制巡检内容",
  };
  contentModalTitle.value = titleMap[type] || "巡检内容维护";

  // 重置表单
  contentForm.objectType = "";
  contentForm.objectSubtypeCode = "";
  contentForm.objectSubtypeName = "";
  contentForm.ext1 = "";
  contentForm.ext2 = "";
  contentForm.ext3 = "";
  contentForm.ext4 = "";
  contentForm.objectTypeText = "";
  contentForm.majorId = currentMajorId.value;
  contentForm.items = [];

  if (type === "add") {
    // 新增模式
    contentForm.items = [createInspectItem()];
  } else if (type === "edit" && record) {
    getDetail({ templateId: record.templateId }).then((res) => {
      contentForm.items = res.items || [];
    });
    // 编辑模式，从record中获取数据
    contentForm.objectType = record.objectTypeCode || "";
    contentForm.objectSubtypeCode = record.objectSubtypeCode || "";
    contentForm.objectSubtypeName = record.objectSubtypeName || "";
    contentForm.ext1 = record.ext1 || "";
    contentForm.ext2 = record.ext2 || "";
    contentForm.ext3 = record.ext3 || "";
    contentForm.ext4 = record.ext4 || "";
    contentForm.objectTypeText = record.objectTypeText || "";
    contentForm.templateId = record.templateId || "";
    // 处理巡检项和巡检内容 - 表格数据是扁平结构
    // 确保选项值是字符串格式，不是 JSON
    let optionValues = record.optionValues || "";
    if (typeof optionValues === "object" && optionValues !== null) {
      try {
        optionValues = JSON.stringify(optionValues);
      } catch (e) {
        optionValues = "";
      }
    }
  } else if (type === "copy" && record) {
    // 复制模式，从record中获取数据但生成新的ID
    contentForm.objectType = record.objectType || "";
    contentForm.objectSubtypeCode = record.objectSubtypeCode || "";
    contentForm.objectSubtypeName = record.objectSubtypeName || "";
    contentForm.ext1 = record.ext1 || "";
    contentForm.ext2 = record.ext2 || "";
    contentForm.ext3 = record.ext3 || "";
    contentForm.ext4 = record.ext4 || "";
    contentForm.objectTypeText = record.objectTypeText || "";

    // 处理巡检项和巡检内容，生成新的ID - 表格数据是扁平结构
    // 确保选项值是字符串格式，不是 JSON
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
    // 默认情况
    contentForm.items = [createInspectItem()];
  }
  handleType.value = type;
  openContentModalInner();
}

function getActions(record) {
  return [
    {
      label: "编辑",
      onClick: openContentModal.bind(null, "edit", record),
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

function handleDelete(record) {
  deleteInspectionContent({ id: record.id }, () => {
    // 刷新专业列表，更新巡检内容数量（getMajorList内部会自动刷新表格）
    getMajorList();
  });
}
// 获取巡检类型
function getObjectTypeList() {
  objectTypeList().then((res) => {
    objectTypeData.value = res.result || [];
    if (contentForm.objectType == "system") {
      getObjectTypeChildList(contentForm.objectType);
    }
  });
}
// 获取巡检类型下的内容
function getObjectTypeChildList(type) {
  objectTypeChildData.value = [];
  if (contentForm.objectType == "system") {
    loading.value = true;
    objectTypeListChild({ typeCode: type, campus: "BEIJING_ART_CENTER", specialty: currentMajorId.value || "" }).then((res) => {
      objectTypeChildData.value = res.result.data || [];
      loading.value = false;
    });
  }
}
// 处理对象检类型改变
function objectTypeChange(value: string) {
  contentForm.objectSubtypeCode = "";
  contentForm.objectSubtypeName = "";
  contentForm.objectTypeText =
    objectTypeData.value.find((item) => item.typeCode === value)?.typeName || "";
  subLabel.value = contentForm.objectTypeText + "类型";
  getObjectTypeChildList(value);
}

// 处理具体设备/空间类型改变
function objectSubtypeChange(value: string) {
  let obj = objectTypeChildData.value.find((item) => item.id === value);
  contentForm.objectSubtypeName = obj?.name || "";
  contentForm.ext1 = obj?.ext1 || "";
  contentForm.ext2 = obj?.ext2 || "";
  contentForm.ext3 = obj?.ext3 || "";
  contentForm.ext4 = obj?.ext4 || "";
}
async function handleMajorSubmit() {
  try {
    let values = await validateMajorForm();
    setMajorModalProps({ confirmLoading: true });
    await saveMajor(values, majorModalTitle.value == "编辑专业" ? "edit" : "save");
    // message.success("保存成功");
    getMajorList();
    closeMajorModal();
  } catch (error) {
    console.error("保存专业失败:", error);
  } finally {
    setMajorModalProps({ confirmLoading: false });
  }
}

async function handleContentSubmit() {
  try {
    setContentModalProps({ confirmLoading: true });
    if (contentForm.objectType == "device" || contentForm.objectType == "space") {
      contentForm.objectSubtypeName = contentForm.objectSubtypeCode;
    }
    // 模拟保存
    createTemplate(contentForm, handleType.value);
    // message.success("保存成功");
    closeContentModal();
    setTimeout(() => {
      // 刷新专业列表，更新内容数量（getMajorList内部会自动刷新表格）
      getMajorList();
    }, 200);
  } catch (error) {
    console.error("保存巡检内容失败:", error);
  } finally {
    setContentModalProps({ confirmLoading: false });
  }
}

function deleteMajorItem(major: string) {
  deleteMajor({ id: major }, () => {
    getMajorList();
  });
}

function selectMajor(major: string, obj: Major | null = null) {
  currentMajor.value = major;
  majorObj.value = obj;
  currentMajorId.value = obj?.id || "";
  reload(); // 切换专业后刷新表格并传递最新的专业ID
}

function createInspectItem(data: any = null): InspectItem {
  return {
    id: ++inspectItemSeed,
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
    id: ++inspectContentSeed,
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
  // 触发响应式更新
  content.optionValues = content.optionValues;
}

function getResultTypeColor(type: string) {
  const colors: Record<string, string> = {
    选项: "green",
    百分比: "orange",
    文本: "blue",
  };
  return colors[type] || "blue";
}

// 初始化
onMounted(() => {
  // 初始化数据
  getMajorList();
});
</script>

<style scoped lang="less">
.equipment-inspection-content {
  .main-container {
    display: flex;
    gap: 0px;
    padding: 6px;
    min-height: calc(100vh - 60px);
  }

  .major-side {
    width: 300px;
    padding: 8px;
    padding-top: 0px;
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      margin-top: 14px;
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #111;
      }
    }
    .major-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 16px;
      .major-card {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 10px 12px;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          background-color: #fafcff;
          border-color: #cfe1ff;
        }
        &.active {
          background-color: #f5f9ff;
          border-color: #007aff;
        }
        .major-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .meta {
          color: #666;
          font-size: 12px;
          line-height: 1.6;
        }
        .major-actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
          a {
            color: #007aff;
            font-size: 12px;
            cursor: pointer;
          }
        }
      }
    }
  }

  .content-side {
    flex: 1;

    .table-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .info-summary {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #666;

      .divider {
        color: #ddd;
      }

      strong {
        color: #333;
        font-weight: 600;
      }
    }

    .info-card {
      .info-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;
        width: 100%;
      }
      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        margin-right: 20px;
        flex-shrink: 0;
        .info-label {
          color: #666;
          font-weight: 500;
        }
        .info-value {
          color: #333;
        }
      }
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #111;
      }
      .toolbar {
        display: flex;
        gap: 8px;
      }
    }
    .summary-tip {
      margin-top: 16px;
      padding: 16px;
      border: 1px dashed #d9e4f5;
      border-radius: 8px;
      background-color: #fafcff;
      color: #666;
      line-height: 1.8;
      font-size: 13px;
    }
  }
}
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
}

/* 巡检内容列表样式 - 与巡检项知识库弹框保持一致 */
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
</style>
