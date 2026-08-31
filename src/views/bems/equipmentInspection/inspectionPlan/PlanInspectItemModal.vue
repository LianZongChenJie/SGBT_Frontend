<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="选择巡检设备"
    width="1300px"
    @ok="handleSubmit"
  >
    <div class="form-modal">
      <BasicForm
        ref="formElRef"
        @register="registerBasicForm"
        name="BasicForm"
      ></BasicForm>

      <div class="object-modal-container">
        <!-- 左侧：巡检对象列表 -->
        <div class="left-panel">
          <a-table
            :columns="objectPreviewColumns2"
            :data-source="objectPreviewList"
            :pagination="false"
            size="small"
            :scroll="{ y: 360 }"
            :row-selection="{
              type: 'checkbox',
              selectedRowKeys: selectedKeys,
              onChange: handleSelectionChange,
            }"
            row-key="objectId"
          >
          </a-table>
        </div>

        <!-- 右侧：已选择的巡检对象 -->
        <div class="right-panel">
          <div class="panel-header">
            <h3>已选择 ({{ selectedObjects.length }})</h3>
          </div>
          <a-table
            :columns="selectedColumns"
            :data-source="selectedObjects"
            :pagination="false"
            size="small"
            :scroll="{ y: 320 }"
            row-key="objectId"
          >
            <template #action="{ record }">
              <a-button size="small" type="text" @click="handleRemove(record)">
                删除
              </a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from "vue";
import { BasicModal, useModalInner } from "/@/components/Modal";
import { message } from "ant-design-vue";
import { BasicForm, FormActionType, useForm } from "/@/components/Form";
import { objectPreviewColumns2 } from "./inspectionPlan.data";
import { getInspectionDetails, getMdmSpaceCascadeTree } from "./inspectionPlan.api";

const emit = defineEmits(["success", "register"]);

const selectedKeys = ref<string[]>([]);
const props = defineProps({
  inspectItemData: {
    type: Object,
    default: () => ({}),
  },
  todo: {
    type: Object,
    default: () => ({}),
  },
});
const objectPreviewList = ref<any[]>([]);

// 弹窗内选择的巡检区域值
const currentPositionInfo = ref('');

// 已选择的巡检对象列表（独立存储，不受查询条件影响）
const selectedObjects = ref<any[]>([]);

// 已选择表格的列定义
const selectedColumns = [
  {
    title: "设备名称",
    dataIndex: "objectName",
  },
  {
    title: "编码",
    dataIndex: "objectCode",
  },
  {
    title: "操作",
    width: 60,
    slots: { customRender: "action" },
  },
];
const locationData = ref([]);
const processLocationData = (data) => {
  // 处理非数组情况
  if (!Array.isArray(data)) {
    return data;
  }

  return data.map((item) => {
    // 深拷贝，避免修改原数据
    const processedItem = JSON.parse(JSON.stringify(item));

    // 检查 children 是否存在
    if ("children" in processedItem) {
      // console.log('处理节点:', processedItem.label, 'children:', processedItem.children);

      // 检查 children 是否为有效数组
      if (Array.isArray(processedItem.children) && processedItem.children.length > 0) {
        // 递归处理子节点
        processedItem.children = processLocationData(processedItem.children);
      } else {
        // 删除 children 为 null 或空数组的属性
        delete processedItem.children;
        // console.log('删除了 children 属性:', processedItem.label);
      }
    }

    return processedItem;
  });
};

// 获取巡检区域数据
const fetchLocationData = ({ campus: value }) => {
  return getMdmSpaceCascadeTree({ campus: value })
    .then((response) => {
      const data = response?.data || response;
      const processedData = processLocationData(data);
      locationData.value = processedData;

      return processedData;
    })
    .catch((error) => {
      console.error("获取巡检区域数据失败", error);
      return [];
    });
};
/**
 * 基础信息表单绑定注册
 */
const [
  registerBasicForm,
  {
    setProps: setBasicProps,
    resetFields: resetBasicFields,
    setFieldsValue: setBasicFieldsValue,
    validate: validateBasic,
    scrollToField: scrollBasicToField,
    getFieldsValue: getBasicFieldsValue,
  },
] = useForm({
  labelWidth: 110,
  schemas: [
    {
      label: "对象子类",
      field: "objectSubtypeCode",
      component: "JDictSelectTag",
      colProps: { span: 8 },
      componentProps: {
        dictCode: "inspection_equipment_type",
        type: "select",
        onChange: (value) => {
          handleSearch();
        },
      },
      dynamicDisabled: true,
      defaultValue: props.todo.objectSubtypeCode,
    },
    {
      label: "巡检区域",
      field: "campus",
      component: "Cascader",
      colProps: { span: 8 },
      componentProps: ({ formModel }) => {
        return {
          options: locationData.value,
          maxTagCount: 10,
          placement: "bottomRight",
          showSearch: true,
          multiple: true,
          onChange: (options, values) => {
            // 先清空之前的值
            let executeLocationName = "";
            values.forEach((item, index) => {
              if (item.length > 0 && item[item.length - 1].fullPath) {
                executeLocationName += item[item.length - 1].fullPath + ",";
              }
            });
            // 移除末尾多余的逗号
            if (executeLocationName.endsWith(",")) {
              executeLocationName = executeLocationName.slice(0, -1);
            }
            // 将选择的巡检区域保存到临时变量，供搜索时使用
            currentPositionInfo.value = executeLocationName;
            handleSearch();
          },
        };
      },
      defaultValue: props.todo.executeLocationIds || props.todo.campus,
    },
    {
      label: "设备名称",
      field: "objectName",
      component: "Input",
      colProps: { span: 8 },
      componentProps: {
        placeholder: "请输入设备名称",
        allowClear: true,
        onChange: (e) => {
          handleSearch();
        },
      },
    },
    {
      label: "编码",
      field: "objectCode",
      component: "Input",
      colProps: { span: 8 },
      componentProps: {
        placeholder: "请输入编码",
        allowClear: true,
        onChange: (e) => {
          handleSearch();
        },
      },
    },
  ],
  showActionButtonGroup: false,
  baseColProps: { span: 12 },
});

// 搜索函数
function handleSearch() {
  try {
    const formValues = getBasicFieldsValue() || {};
    const currentData = currentModalData.todo || todoData || {};
    
    // 处理 campus 字段，优先使用弹窗内选择的值
    let positionInfo = '';
    
    // 优先使用弹窗内选择的巡检区域值
    if (currentPositionInfo.value) {
      positionInfo = currentPositionInfo.value;
    } else {
      // 其次从表单获取 campus 值
      const campusValue = formValues.campus;
      
      if (!campusValue || (Array.isArray(campusValue) && campusValue.length === 0)) {
        // 尝试从 currentData 中获取 positionInfo 或 executeLocationName
        if (currentData.positionInfo) {
          positionInfo = currentData.positionInfo;
        } else if (currentData.executeLocationName) {
          positionInfo = currentData.executeLocationName;
        }
      } else if (Array.isArray(campusValue) && campusValue.length > 0) {
          // 处理数组类型（多选模式下的 Cascader 返回数组）
          // 检查第一个元素是否也是数组（表示路径数组）
          if (Array.isArray(campusValue[0])) {
            // 多选模式：[[{value, label, fullPath}], [{value, label, fullPath}]]
            positionInfo = campusValue
              .filter((item) => item && item.length > 0)
              .map((item) => {
                const lastItem = item[item.length - 1];
                return lastItem?.fullPath || lastItem?.label || lastItem?.value || '';
              })
              .filter(Boolean)
              .join(',');
          } else {
            // 单选模式：[{value, label, fullPath}]
            const lastItem = campusValue[campusValue.length - 1];
            positionInfo = lastItem?.fullPath || lastItem?.label || lastItem?.value || '';
          }
        } else if (campusValue && typeof campusValue === 'object') {
          // 处理对象类型
          positionInfo = campusValue.fullPath || campusValue.label || campusValue.value || '';
        } else if (campusValue && typeof campusValue === 'string') {
          // 处理字符串类型
          positionInfo = campusValue;
        }
      }
    
    const params = {
      majorId: currentData.majorId,
      positionInfo: positionInfo,
      objectType: currentData.objectType,
      campus: currentData.campus,
      objectSubtypeCode: formValues.objectSubtypeCode,
      objectName: formValues.objectName,
      objectCode: formValues.objectCode,
    };
    
    getInspectionDetails(params).then((res) => {
      objectPreviewList.value = [];
      if (res && res.details && res.details.length > 0) {
        res.details.forEach((item) => {
          if (item && item.targetObjects && item.targetObjects.length > 0) {
            item.targetObjects.forEach((obj) => {
              objectPreviewList.value.push(obj);
            });
          }
        });
      }

      // 使用 nextTick 确保表格渲染完成后再设置勾选
      nextTick(() => {
        // 如果有已选择的对象ID，自动勾选
        const selectedIds = currentData.selectedIds || [];
        if (selectedIds && selectedIds.length > 0) {
          // 找到匹配的对象并设置选中
          const matchedObjects = objectPreviewList.value.filter((item) => {
            return (
              selectedIds.includes(item.objectId) ||
              selectedIds.includes(item.objectCode)
            );
          });
          
          const matchedobjectIds = matchedObjects.map((item) => item.objectId);

          // 使用 setTimeout 确保表格完全渲染后再设置
          setTimeout(() => {
            selectedKeys.value = [...matchedobjectIds];
            // 将已选择的对象添加到独立列表中
            matchedObjects.forEach((obj) => {
              const exists = selectedObjects.value.some((item) => item.objectId === obj.objectId);
              if (!exists) {
                selectedObjects.value.push(obj);
              }
            });
          }, 100);
        }
      });
    }).catch((error) => {
      console.error('获取巡检对象列表失败', error);
    });
  } catch (error) {
    console.error('搜索函数执行失败', error);
  }
}

// 当前弹窗数据
let currentModalData: Recordable = {};

const [registerModal, { closeModal }] = useModalInner((data) => {
  currentModalData = data || {};
  // 每次弹窗打开时重新加载数据
  handleSearch();
  
});

// 获取传入的 todo 数据
const todoData = props.todo;
console.log("传入的数据:", todoData);

function handleSelectionChange(selectedRowKeys: string[], selectedRows: any[]) {
  selectedKeys.value = selectedRowKeys;
  
  // 将新选中的行添加到独立的已选择列表中
  selectedRows.forEach((row) => {
    const exists = selectedObjects.value.some((item) => item.objectId === row.objectId);
    if (!exists) {
      selectedObjects.value.push(row);
    }
  });
  
  // 移除取消选择的行
  selectedObjects.value = selectedObjects.value.filter((item) => 
    selectedRowKeys.includes(item.objectId)
  );
}

// 删除已选择的巡检对象
function handleRemove(record) {
  const objectId = record.objectId;
  // 从选中的keys中移除
  selectedKeys.value = selectedKeys.value.filter((key) => key !== objectId);
  // 从已选择列表中移除
  selectedObjects.value = selectedObjects.value.filter((item) => item.objectId !== objectId);
}

async function handleSubmit() {
  if (selectedObjects.value.length === 0) {
    message.warning("请至少选择一个巡检对象");
    return;
  }
  try {
    // 直接使用独立存储的已选择对象列表（不受查询条件影响）
    emit("success", { objects: selectedObjects.value });
    closeModal();
  } catch (error) {
    console.error("保存失败", error);
  }
}

onMounted(() => {
  handleSearch();
  fetchLocationData({ campus: todoData.campus });
});
</script>

<style scoped>
.object-modal-container {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding: 4px;
}

.left-panel {
  flex: 1;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  height: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #fff;
  display: flex;
  flex-direction: column;
}

.right-panel {
  width: 480px;
  display: flex;
  flex-direction: column;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  height: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.panel-header {
  padding: 12px 16px;
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #262626;
  }
}

:deep(.left-panel .ant-table-wrapper) {
  flex: 1;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.left-panel .ant-table) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.left-panel .ant-table-container) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.left-panel .ant-table-header) {
  flex-shrink: 0;
}

:deep(.left-panel .ant-table-body) {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

:deep(.left-panel .ant-table-body table) {
  margin: 0;
}

:deep(.right-panel .ant-table-wrapper) {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

:deep(.right-panel .ant-table) {
  border: none;
}

:deep(.right-panel .ant-empty) {
  padding: 16px;
  min-height: 60px;
}

:deep(.right-panel .ant-empty-description) {
  margin: 0;
}

:deep(.right-panel .ant-btn-text-danger) {
  color: #f5222d;
  background: transparent;
  cursor: pointer;
}

:deep(.right-panel .ant-btn-text-danger:hover) {
  color: #f5222d;
  background: transparent;
  cursor: pointer;
}

:deep(.right-panel .ant-table .ant-btn-text) {
  color: #f5222d !important;
  background: transparent !important;
  cursor: pointer !important;
}

:deep(.left-panel .ant-table .ant-table-cell) {
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.right-panel .ant-table .ant-table-cell) {
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.left-panel .ant-table) {
  border: none;
}

:deep(.left-panel .ant-table-thead > tr > th) {
  background: #fafafa;
  color: #595959;
  font-weight: 600;
  padding: 12px 8px;
  border-bottom: 2px solid #e8e8e8;
}

:deep(.right-panel .ant-table-thead > tr > th) {
  background: #fafafa;
  color: #595959;
  font-weight: 600;
  padding: 12px 8px;
  border-bottom: 2px solid #e8e8e8;
}

:deep(.left-panel .ant-table-tbody > tr:hover > td) {
  background: #f0f7ff;
}

:deep(.right-panel .ant-table-tbody > tr:hover > td) {
  background: #f0f7ff;
}

:deep(.left-panel .ant-table-tbody > tr > td) {
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.right-panel .ant-table-tbody > tr > td) {
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.left-panel .ant-table-wrapper .ant-spin-nested-loading) {
  height: 100%;
}

:deep(.right-panel .ant-table-wrapper .ant-spin-nested-loading) {
  height: 100%;
}

:deep(.left-panel .ant-table-container) {
  height: 100%;
}

:deep(.right-panel .ant-table-container) {
  height: 100%;
}
</style>
