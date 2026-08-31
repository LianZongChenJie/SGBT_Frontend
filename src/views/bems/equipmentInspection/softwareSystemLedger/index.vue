<template>
  <div class="software-system-ledger">
    <!-- 系统台账列表 -->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="openSystemModal('add')">新建系统</a-button>
        <!-- <a-button @click="exportLedger">导出台账</a-button> -->
      </template>
       <template #deployType="{ record }">
        <span>
          {{ record.deployType == 'LOCAL' ? '本地部署' : (record.deployType == 'CLOUD' ? '云部署' : '-') }}
        </span>
      </template>
      <template #status="{ record }">
        <a-tag :color="record.status == 'ACTIVE' ? 'green' : 'orange'">
          {{ record.status == 'ACTIVE' ? '在用' : '未启用' }}
        </a-tag>
      </template>
      <template #needInspection="{ record }">
        <a-tag :color="record.needInspection === '1' ? 'blue' : 'gray'">
          {{ record.needInspection === '1' ? '是' : '否' }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <!-- 详情模态框 -->
    <BasicModal
      v-model:visible="detailModalVisible"
      title="软件系统台账详情"
      width="1120px"
      :ok-button-props="{ style: { display: 'none' } }"
      cancelText="关闭"
      @cancel="closeDetail"
    >
      <div v-if="currentSystem">
        <!-- 基础信息 -->
        <a-card :title="'基础信息'" :bordered="false" style="margin-bottom: 8px">
          <div class="form-grid">
            <div class="form-item">
              <a-form-item label="软件系统名称">
                <div class="field-value">{{ currentSystem.systemName || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="系统编码">
                <div class="field-value">{{ currentSystem.systemCode || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="所属专业">
                <div class="field-value">{{ currentSystem.majorText || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="台账状态">
                <div class="field-value">{{ (currentSystem.status == 'ACTIVE' ? '在用' : '停用') || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="维护公司">
                <div class="field-value">{{ currentSystem.maintenanceCompany || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="上线日期">
                <div class="field-value">{{ currentSystem.launchDate || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="责任部门">
                <div class="field-value">{{ currentSystem.responsibleDeptText || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="系统负责人">
                <div class="field-value">{{ currentSystem.owner || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="部署方式">
                <div class="field-value">{{ currentSystem.deployType == 'LOCAL' ? '本地部署' : (currentSystem.deployType == 'CLOUD' ? '云部署' : '-') || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="运行环境">
                <div class="field-value">{{ currentSystem.environment || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="系统版本">
                <div class="field-value">{{ currentSystem.version || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="是否纳入巡检">
                <div class="field-value">{{ (currentSystem.needInspection == '1' ? '是' : '否') || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="系统访问网址">
                <div class="field-value">{{ currentSystem.accessUrl || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="认证方式">
                <div class="field-value">{{ currentSystem.authMode || "无" }}</div>
              </a-form-item>
            </div>
          </div>
        </a-card>

        <!-- 系统说明与关联 -->
        <a-card :title="'系统说明与关联'" :bordered="false" style="margin-bottom: 16px">
          <div class="form-grid">
            <div class="form-item">
              <a-form-item label="系统描述">
                <div class="field-value">{{ currentSystem.description || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item">
              <a-form-item label="关联系统">
                <div class="field-value">{{ currentSystem.relation || "无" }}</div>
              </a-form-item>
            </div>
            <div class="form-item full-width">
              <a-form-item label="巡检关注点">
                <div class="field-value">{{ currentSystem.checkPoints || "无" }}</div>
              </a-form-item>
            </div>
          </div>
        </a-card>

        <!-- 客户端安装包 / 文档附件 -->
        <a-card :title="'文档附件'" :bordered="false">
       
          <div v-if="currentSystem.files && currentSystem.files.length > 0">
            <div
              v-for="(file, index) in currentSystem.files"
              :key="index"
              class="file-item"
            >
              <div>
                <div style="font-weight: 600; cursor: pointer; color: #1890ff; text-decoration: underline;" @click="previewFile(file)">{{ file.fileName }}</div>
                <!-- <div class="meta">{{ file.filePath }}</div> -->
              </div>
              <div class="file-actions">
                <a-button type="default" size="small" @click="downloadFile(file)">下载</a-button>
              </div>
            </div>
          </div>
          <div v-else class="no-files">
            <div class="summary-text">暂无附件</div>
          </div>
        </a-card>
      </div>
    </BasicModal>

    <!-- 新建/编辑系统模态框 -->
    <BasicModal
      v-model:visible="systemModalVisible"
      :title="systemModalTitle"
      width="900px"
      @ok="handleSystemSubmit"
      @cancel="closeSystemModal"
    >
      <div class="form-modal">
        <BasicForm v-if="showFlag" @register="registerSystemForm" />
      </div>
    </BasicModal>

    <!-- 图片预览模态框 -->
    <BasicModal
      v-model:visible="previewVisible"
      :title="previewTitle"
      width="800px"
      :footer="null"
    >
      <div style="text-align: center;">
        <img :src="previewImage" style="max-width: 100%; max-height: 600px; object-fit: contain;" />
      </div>
    </BasicModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useListPage } from "/@/hooks/system/useListPage";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import BasicModal from "/@/components/Modal/src/BasicModal.vue";
import { BasicForm, useForm } from "/@/components/Form";
import TableAction from "@/components/Table/src/components/TableAction.vue";
import {
  columns,
  searchFormSchema,
  systemFormSchema,
} from "./softwareSystemLedger.data";
import {
  getSoftwareSystemLedgerList,
  saveSoftwareSystemLedger,
  deleteSoftwareSystemLedger,
  exportSoftwareSystemLedger,
} from "./softwareSystemLedger.api";
import { useTable } from "/@/components/Table";
import { useModal } from "/@/components/Modal";
import { useMessage } from "/@/hooks/web/useMessage";
import { clear } from "console";
const showFlag = ref(true);
// 定义系统数据接口
interface SystemData {
  id?: string;
  systemCode: string;
  responsibleDeptText: string;
  systemName: string;
  major: string;
  majorText: string;
  status: string;
  vendor: string;
  launchDate: string;
  dept: string;
  owner: string;
  deployType: string;
  environment: string;
  version: string;
  needInspection: string;
  accessUrl: string;  
  authMode: string;
  description: string;
  relation: string;
  checkPoints: string;
  files?: FileData[];
  majorId?: string;
  responsibleDept?: string;
  maintenanceCompany?: string;
  ownerContact?: string;
}

interface FileData {
  fileName: string;
  filePath: string;
  type: string;
  size: number;
}
const handleType = ref("add");
// 消息提示
const { createMessage } = useMessage();

// 表格和查询表单配置
const { tableContext } = useListPage({
  designScope: "software-system-ledger",
  tableProps: {
    title: "系统台账列表",
    api: getSoftwareSystemLedgerList,
    columns,
    rowKey: "systemCode",
    useSearchForm: true,
    showActionColumn: true,
    actionColumn: {
      title: "操作",
      width: 130,
      fixed: "right",
    },
    formConfig: {
      schemas: searchFormSchema,
    },
  },
});

const [registerTable, { reload, setTableData }] = tableContext;

// 系统表单配置
const [registerSystemForm, { validate: validateSystem, setFieldsValue, resetFields, getFieldsValue }] = useForm({
  schemas: systemFormSchema,
  labelWidth: 100,
  showSubmitButton: false,
  showResetButton: false,
});

// 模态框状态
const detailModalVisible = ref(false);
const systemModalVisible = ref(false);

// 监听模态框关闭事件
watch(systemModalVisible, (newValue) => {
  if (!newValue) {
    // 模态框关闭时重置表单
    resetFields();
  }
});

// 数据状态
const currentSystem = ref<SystemData | null>(null);
const systemModalTitle = ref("新建软件台账");
const totalCount = ref(3); // 模拟数据
// 保存编辑时的原始文件数据，用于提交时恢复
const originalFiles = ref<any[]>([]);

// 模拟系统数据
const systemMap: SystemData[] = [];

// 方法
const openDetail = (record: SystemData) => {
  currentSystem.value = record;
  detailModalVisible.value = true;
};

const closeDetail = () => {
  detailModalVisible.value = false;
  currentSystem.value = null;
};
// 下载文件
const downloadFile = (file: FileData) => {
  if (file.filePath) {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = file.filePath;
    link.download = file.fileName;
    // 移除target属性，避免打开新窗口
    // link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    createMessage.error('文件路径不存在');
  }
};

// 预览文件
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

const previewFile = (file: FileData) => {
  if (file.filePath) {
    // 检查文件类型
    const fileName = file.fileName.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(fileName);
    const isPdf = /\.pdf$/.test(fileName);
    const isText = /\.(txt|md|json|xml|html|css|js)$/.test(fileName);
    
    if (isImage) {
      // 图片文件使用模态框预览
      previewImage.value = file.filePath;
      previewTitle.value = file.fileName;
      previewVisible.value = true;
    } else if (isPdf || isText) {
      // PDF和文本文件在新窗口预览
      window.open(file.filePath, '_blank');
    } else {
      // 其他文件类型提示下载
      createMessage.info('该文件类型不支持预览，请下载查看');
    }
  } else {
    createMessage.error('文件路径不存在');
  }
};

// 打开系统编辑模态框
const openSystemModal = (type: string, record?: SystemData) => {
  showFlag.value = true;
  handleType.value = type;
  systemModalTitle.value = type === "edit" ? "编辑软件系统" : "新建软件系统";
  // 再打开模态框
  systemModalVisible.value = true;
  // 重置原始文件数据
  originalFiles.value = [];
  
  // 编辑模式下保存当前记录到 currentSystem
  if (type === "edit" && record) {
    currentSystem.value = record;
  }
  
  // 延迟设置表单值，确保表单已渲染
  setTimeout(() => {
    if (type === "edit" && record) {
      console.log('编辑数据:', record);
      console.log('原始files:', record.files);
      console.log('files类型:', typeof record.files);
      // 处理文件字段，确保格式正确
      const formData = { ...record };
      console.log('原始formData:', formData);
      
      // 确保 majorText 字段存在并正确赋值
      if (!formData.majorText && record.majorText) {
        formData.majorText = record.majorText;
      }
      console.log('majorText:', formData.majorText);
      
      if (formData.files) {
        // 先保存原始文件数据（未处理前）
        let rawFiles = formData.files;
        if (typeof rawFiles === 'string') {
          try {
            rawFiles = JSON.parse(rawFiles);
          } catch (e) {
            console.error('解析files失败:', e);
            rawFiles = [];
          }
        }
        console.log('解析后的原始文件:', rawFiles);
        
        // 保存原始文件数据（只保留有效文件）
        if (Array.isArray(rawFiles)) {
          originalFiles.value = rawFiles
            .filter((file: any) => file && (file.filePath || file.path))
            .map((file: any) => ({
              filePath: file.filePath || file.path || '',
              fileName: file.fileName || file.name || '',
              fileSize: file.fileSize || file.size || 0,
            }));
        }
        console.log('保存的原始文件:', originalFiles.value);
        
        // 确保 files 是数组格式
        if (typeof formData.files === 'string') {
          try {
            formData.files = JSON.parse(formData.files);
          } catch (e) {
            console.error('解析files失败:', e);
            formData.files = [];
          }
        }
        console.log('解析后的files:', formData.files);
        // 确保每个文件对象包含 filePath 和 fileName
        formData.files = formData.files.map((file: any) => ({
          filePath: file.filePath || file.path || '',
          fileName: file.fileName || file.name || '',
          fileSize: file.fileSize || file.size || 0,
        }));
      }
      console.log('最终设置的表单数据:', formData);
      setFieldsValue(formData);
    }
  }, 100);
};

const closeSystemModal = () => {
  systemModalVisible.value = false;
  showFlag.value = false;
  // 延迟重置表单，确保模态框完全关闭后再重置
  setTimeout(() => {
    resetFields();
  }, 300);
};

const handleSystemSubmit = async () => {
  try {
    // 使用 getFieldsValue 获取所有字段值，包括隐藏字段
    const allFormData = getFieldsValue();
    console.log('所有表单字段:', allFormData);
    
    // 验证表单
    const formData = await validateSystem();
    
    // 确保 majorText 字段被正确包含
    if (handleType.value === 'edit') {
      // 编辑模式下，如果 formData 中没有 majorText，从 allFormData 或原始记录中获取
      if (!formData.majorText) {
        if (allFormData.majorText) {
          formData.majorText = allFormData.majorText;
        } else if (currentSystem.value && currentSystem.value.majorText) {
          formData.majorText = currentSystem.value.majorText;
        }
      }
      // 同样处理 responsibleDeptText
      if (!formData.responsibleDeptText) {
        if (allFormData.responsibleDeptText) {
          formData.responsibleDeptText = allFormData.responsibleDeptText;
        } else if (currentSystem.value && currentSystem.value.responsibleDeptText) {
          formData.responsibleDeptText = currentSystem.value.responsibleDeptText;
        }
      }
    }
    
    // 处理文件字段 - 先解析字符串格式
    let currentFiles = formData.files;
    if (currentFiles) {
      if (typeof currentFiles === 'string') {
        try {
          currentFiles = JSON.parse(currentFiles);
        } catch (e) {
          console.error('文件数据解析失败:', e);
          currentFiles = [];
        }
      }
    } else {
      currentFiles = [];
    }
    
    // 编辑模式下，如果当前文件为空但有原始文件，使用原始文件
    if (handleType.value === 'edit') {
      if (!currentFiles || (Array.isArray(currentFiles) && currentFiles.length === 0)) {
        currentFiles = [...originalFiles.value];
      } else {
        // 检查当前文件是否包含有效文件
        const hasValidFiles = Array.isArray(currentFiles) && currentFiles.some(file => file && file.filePath);
        if (!hasValidFiles && originalFiles.value.length > 0) {
          currentFiles = [...originalFiles.value];
        }
      }
    }
    
    
    // 确保文件数组中的每个对象都有正确的字段
    formData.files = Array.isArray(currentFiles) 
      ? currentFiles.map((file: any) => ({
          filePath: file.filePath || file.path || '',
          fileName: file.fileName || file.name || '',
          fileSize: file.fileSize || file.size || 0,
        })).filter((file: any) => file.filePath)
      : [];
    
    console.log('最终提交数据:', formData);
    await saveSoftwareSystemLedger(formData, handleType.value);
    closeSystemModal();
    reload();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 删除台账
const deleteSystem = (record) => {
  deleteSoftwareSystemLedger({ id: record.id }, handleSuccess)
};
function handleSuccess() {
  reload();
}
const exportLedger = () => {
  // 处理导出逻辑
};
function getActions(record) {
  return [
    {
      label: "详情",
      onClick: openDetail.bind(null, record),
    },
    {
      label: "编辑",
      onClick: openSystemModal.bind(null, "edit", record),
    },
    {
      label: "删除",
      danger: true,
      popConfirm: {
        title: "是否确认删除",
        confirm: deleteSystem.bind(null, record),
        placement: "topLeft",
      },
    },
  ];
}
</script>

<style scoped lang="less">

.search-form {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

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

.action-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  a {
    color: #007aff;
    cursor: pointer;
    font-size: 13px;
    &:hover {
      text-decoration: underline;
    }
  }
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

/* 附件列表样式 */
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e3f2fd;
    border-color: #2196f3;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  }
  
  div:first-child {
    flex: 1;
  }
  
  .meta {
    color: #666;
    font-size: 12px;
    margin-top: 4px;
  }
}

.file-actions {
  display: flex;
  gap: 8px;
  
  .ant-btn {
    border-radius: 6px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

.no-files {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e9ecef;
  
  .summary-text {
    color: #999;
  }
}

/* 标签样式优化 */
:deep(.ant-tag) {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.ant-modal-content) {
    margin: 10px;
  }
  
  :deep(.ant-card-body) {
    padding: 16px;
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    
    .file-actions {
      align-self: flex-end;
    }
  }
}

/* 文件预览样式 */
.file-preview-box {
  min-height: 320px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fafbfc;
  padding: 20px;
  color: #475467;
  .file-preview-title {
    font-size: 16px;
    font-weight: 600;
    color: #111;
    margin-bottom: 10px;
  }
  .file-preview-meta {
    color: #667085;
    font-size: 13px;
    margin-bottom: 16px;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
  color: #111;
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-picker) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
}

:deep(.ant-input:hover),
:deep(.ant-select-selector:hover),
:deep(.ant-picker:hover) {
  border-color: #40a9ff;
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

:deep(.ant-card-head) {
  background: #fafbfc;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-card-head-title) {
  font-weight: 600;
  color: #111;
}

:deep(.ant-modal-body) {
  padding: 24px;
}

:deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.ant-modal-title) {
  font-weight: 600;
  color: #111;
  font-size: 16px;
}

:deep(.ant-modal-footer) {
  border-top: 1px solid #f0f0f0;
  padding: 16px 24px;
}

</style>
