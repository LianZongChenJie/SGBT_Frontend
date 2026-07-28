<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="isView ? '查看巡检计划' : isUpdate ? '编辑巡检计划' : '新建巡检计划'"
    width="1220px"
    :ok-button-props="{ style: { display: isView ? 'none' : '' } }"
    :cancel-text="isView ? '关闭' : '取消'"
    @ok="handleSubmit"
    :defaultFullscreen="true"
  >
    <!-- 基础信息 -->
    <a-card :title="'基础信息'" :bordered="false" style="margin-bottom: 8px">
      <!-- 计划基本信息 -->
      <BasicForm
        ref="formElRef"
        @register="registerBasicForm"
        name="BasicForm"
        :disabled="isView"
      >
        <template #assigneeIds="{ model, field }">
          <a-row :gutter="10">
            <a-col :span="19">
              <a-select
                v-model:value="model[field]"
                mode="multiple"
                :options="executorOpt"
                :open="false"
              ></a-select>
            </a-col>
            <a-col :span="3">
              <a-button
                type="primary"
                @click="openUserModal('', 'checkbox', 'executorOpt')"
                >选择</a-button
              >
            </a-col>
          </a-row>
        </template>
      </BasicForm>

      <!-- 执行时间 -->
      <a-divider style="margin: 16px 0; font-weight: bold; color: #1890ff">
        <span style="font-size: 14px">执行时间</span>
      </a-divider>
      <BasicForm
        ref="formElRef2"
        @register="registerTimeForm"
        name="TimeForm"
        :disabled="isView"
      />

      <!-- 执行区域 -->
      <a-divider style="margin: 16px 0; font-weight: bold; color: #1890ff">
        <span style="font-size: 14px">执行区域</span>
      </a-divider>
      <BasicForm
        ref="formElRef3"
        @register="registerLocationForm"
        name="LocationForm"
        :disabled="isView"
      />
    </a-card>
    <a-card :title="'巡检明细'" :bordered="false" style="margin-bottom: 8px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <div style="display: flex; gap: 8px">
          <!-- <a-tag
            :color="activeDetailTab === 'equipment' ? 'blue' : ''"
            style="padding: 4px 12px; font-size: 13px; cursor: pointer"
            @click="handleTabClick('equipment')"
            >设备</a-tag
          >
          <a-tag
            :color="activeDetailTab === 'space' ? 'blue' : ''"
            style="padding: 4px 12px; font-size: 13px; cursor: pointer"
            @click="handleTabClick('space')"
            >空间</a-tag
          >
          <a-tag
            :color="activeDetailTab === 'system' ? 'blue' : ''"
            style="padding: 4px 12px; font-size: 13px; cursor: pointer"
            @click="handleTabClick('system')"
            >系统</a-tag
          > -->
          <a-radio-group v-model:value="resourceType" button-style="solid" @change="handleTabClick">
            <a-radio-button value="equipment">设备</a-radio-button>
            <a-radio-button value="space">空间</a-radio-button>
            <a-radio-button value="system">系统</a-radio-button>
          </a-radio-group>
        </div>
        <div v-if="!isView">
          
          <a-button
            type="primary"
            style="margin-left: 8px"
            @click="handleSelectEquipment('device')"
            >选择设备</a-button
          >
          <a-button
            type="primary"
            style="margin-left: 8px"
            @click="handleSelectEquipment('space')"
            >选择空间</a-button
          >
          <a-button
            type="primary"
            style="margin-left: 8px"
            @click="handleSelectEquipment('system')"
            >选择系统</a-button
          >
        </div>
      </div>

      <a-table
        :columns="[
          {
            title: '巡检类型',
            dataIndex: 'objectType',
            width: 110,
            align: 'center',
            slots: { customRender: 'objectType' },
          },
          { title: '对象子类', dataIndex: 'subtypeName', width: 100, align: 'center' },
          { title: '巡检内容', dataIndex: 'contentSummary', align: 'center' },
          { title: '具体对象数', dataIndex: 'objectCount', width: 120, align: 'center' },
          {
            title: '操作',
            dataIndex: 'action',
            width: 180,
            align: 'center',
            slots: { customRender: 'action' },
          },
        ]"
        :data-source="
          activeDetailTab === 'equipment'
            ? equipmentList
            : activeDetailTab === 'space'
            ? spaceList
            : systemList
        "
        :pagination="false"
        :bordered="true"
        :expandable="{
          expandedRowKeys: expandedRowKeys.value,
          onExpand: handleExpand,
        }"
      >
        <template #objectType="{ record }">
          {{
            record.objectType === "system"
              ? "系统"
              : record.objectType === "device"
              ? "设备"
              : "空间"
          }}
        </template>
        <template #action="{ record }">
          <a-button type="link" size="small" @click="handleInspectItem(record)"
            >编辑对象</a-button
          >
          <a-button type="link" size="small" @click="handleContentPreview(record)"
            >巡检内容</a-button
          >
          <a-popconfirm
            title="是否确认删除"
            ok-text="是"
            cancel-text="否"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger size="small">删除</a-button>
          </a-popconfirm>
        </template>
        <template #expandedRowRender="{ record }">
          <div style="padding: 16px">
            <div
              style="font-size: 13px; font-weight: 500; margin-bottom: 12px; color: #666"
            >
              具体{{
                record.objectType === "system"
                  ? "系统"
                  : record.objectType === "device"
                  ? "设备"
                  : "空间"
              }}列表
            </div>
            <a-table
              :columns="[
                {
                  title:
                    record.objectType === 'system'
                      ? '系统名称'
                      : record.objectType === 'device'
                      ? '设备名称'
                      : '空间名称',
                  dataIndex: 'objectName',
                  width: 210,
                },
                { title: '编码', dataIndex: 'objectCode', width: 150 },
                {
                  title:
                    record.objectType === 'system'
                      ? '维护公司'
                      : record.objectType === 'device'
                      ? '对象子类'
                      : '空间类型',
                  dataIndex: 'objectSubtypeName',
                  width: 150,
                },
                {
                  title:
                    record.objectType === 'system'
                      ? '系统网址'
                      : record.objectType === 'device'
                      ? '所在位置'
                      : '位置描述',
                  dataIndex: 'locationPath',
                },
              ]"
              :data-source="record.targetObjects || []"
              :pagination="false"
              :bordered="true"
              :size="'small'"
            />
          </div>
        </template>
      </a-table>
    </a-card>

    <!-- 巡检路线维护 -->
    <a-card :title="'巡检路线维护'" :bordered="false" style="margin-bottom: 8px">
      <p style="font-size: 12px; color: #999; margin: 0 0 16px">
        系统自动汇总所有巡检明细中的所在位置，按房间号去重后生成路线点。可手动调整房间顺序，从而确定各房间与房间内设备的巡检先后顺序。
      </p>

      <a-list :data-source="routeList">
        <template #renderItem="{ item, index }">
          <a-list-item
            :key="item.key"
            style="display: flex; align-items: center; padding: 8px 0"
          >
            <div class="circle-input-wrapper">
              <input
                type="number"
                :value="item.orderNo"
                :min="1"
                :max="10"
                :disabled="isView"
                class="circle-input"
                @input="(e) => (item.orderNo = e.target.value)"
              />
            </div>
            <div style="flex: 1; overflow: hidden">
              <div style="font-weight: 500; font-size: 13px">
                {{ item.parentLocationPath }}
              </div>
              <div style="font-size: 12px; color: #999">
                {{ item.roomName }} 关联对象: {{ item.relatedObjectSummary }}
              </div>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
    <selectUserModal
      v-if="showFlag"
      @register="register"
      :userObj="userObj"
      @update:data="handleDataUpdate"
    ></selectUserModal>
  </BasicModal>
  <PlanObjectModal
    @register="registerPlanObjectModal"
    :todo="todo"
    v-if="showPlanObjectModal"
    @success="handleObjectSelect"
  />
  <PlanContentViewModal
    v-if="planContentFlag"
    :planContentData="planContentData"
    @register="registerPlanContentPreview"
    @success="handleContentPreview"
  />
  <PlanInspectItemModal
    v-if="inspectItemFlag"
    :todo="todo"
    :inspectItemData="inspectItemData"
    @register="registerPlanInspectItem"
    @success="handleInspectItemSuccess"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { BasicModal, useModalInner, useModal } from "/@/components/Modal";
import { BasicForm, FormActionType, useForm } from "/@/components/Form";
import { message } from "ant-design-vue";
import PlanObjectModal from "./PlanObjectModal.vue";
import PlanContentViewModal from "./PlanContentViewModal.vue";
import PlanInspectItemModal from "./PlanInspectItemModal.vue";
import {
  basicFormSchema,
  timeFormSchema,
  locationFormSchema,
  fetchLocationData,
} from "./inspectionPlan.data";
import selectUserModal from "/@/views/system/user/userModal.vue";
import {
  savePlan,
  updatePlan,
  getMdmSpaceCascadeTree,
  getRouteMaintenanceList,
  getFullDetail,
} from "./inspectionPlan.api";
import { FunnelChart } from "echarts/charts";
const [register, { openModal }] = useModal();
const [registerPlanObjectModal, { openModal: openPlanObjectModal }] = useModal();
const [registerPlanContentPreview, { openModal: openPlanContentPreview }] = useModal();
const [registerPlanInspectItem, { openModal: openPlanInspectItem }] = useModal();
const emit = defineEmits(["success", "register"]);
const showPlanObjectModal = ref(false);
const isUpdate = ref(false);
const isView = ref(false);
const recordId = ref<string | null>(null);
const formElRef = ref<FormActionType | null>(null);
const formElRef2 = ref<FormActionType | null>(null);
const formElRef3 = ref<FormActionType | null>(null);
const executorOpt = ref([]);
const showFlag = ref(false);
const planContentFlag = ref(false);
const planContentData = ref({});
const inspectItemFlag = ref(false);
const inspectItemData = ref({});
const resourceType = ref("equipment");
const userObj = ref({
  userType: "",
  radioType: "",
  type: "",
  campus: "",
  assigneeIds: [],
});
const todo = ref({
  majorId: "",
  objectType: "device",
  positionInfo: "",
  campus: "",
  executeLocationIds: [],
  objectSubtypeCode: "",
});

const routeList = ref([]);

const activeDetailTab = ref("equipment");
const expandedRowKeys = ref<string[]>([]);

const equipmentList = ref([]);
const spaceList = ref([]);
const systemList = ref([]);

function handleTabClick(tab) {
  activeDetailTab.value = resourceType.value;
  todo.value.objectType = resourceType.value;
}

function toggleExpand(key) {
  const index = expandedRowKeys.value.indexOf(key);
  if (index > -1) {
    expandedRowKeys.value.splice(index, 1);
  } else {
    expandedRowKeys.value.push(key);
  }
}

function handleExpand(expanded, record) {
  toggleExpand(record.key);
}

// 提取所有巡检明细表格中的 targetObjects
function extractAllTargetObjects() {
  const allTargetObjects: any[] = [];
  [equipmentList.value, spaceList.value, systemList.value].forEach((list) => {
    list.forEach((item) => {
      if (item.targetObjects && Array.isArray(item.targetObjects)) {
        allTargetObjects.push(...item.targetObjects);
      }
    });
  });
  return allTargetObjects;
}

function handleDataUpdate(data, type) {
  if (data.length) {
    let arr = [];
    data.forEach((item) => {
      if (type == "executorOpt") {
        executorOpt.value.push({
          label: item.userName,
          value: item.id,
        });
        arr.push(item.id);
      }
    });
    setFieldsValue({ assigneeIds: arr });
  }
}

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
  schemas: basicFormSchema,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
});

/**
 * 执行时间表单绑定注册
 */
const [
  registerTimeForm,
  {
    setProps: setTimeProps,
    resetFields: resetTimeFields,
    setFieldsValue: setTimeFieldsValue,
    validate: validateTime,
    scrollToField: scrollTimeToField,
    getFieldsValue: getTimeFieldsValue,
  },
] = useForm({
  labelWidth: 110,
  schemas: timeFormSchema,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
});

/**
 * 执行区域表单绑定注册
 */
const [
  registerLocationForm,
  {
    setProps: setLocationProps,
    resetFields: resetLocationFields,
    setFieldsValue: setLocationFieldsValue,
    validate: validateLocation,
    scrollToField: scrollLocationToField,
    getFieldsValue: getLocationFieldsValue,
  },
] = useForm({
  labelWidth: 110,
  schemas: locationFormSchema,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
});

// 统一方法
const resetFields = () => {
  resetBasicFields();
  resetTimeFields();
  resetLocationFields();
};

const setFieldsValue = (values) => {
  setBasicFieldsValue(values);
  setTimeFieldsValue(values);
  setLocationFieldsValue(values);
};

const getFieldsValue = () => {
  return {
    ...getBasicFieldsValue(),
    ...getTimeFieldsValue(),
    ...getLocationFieldsValue(),
  };
};

const validate = async () => {
  const basicValid = await validateBasic();
  const timeValid = await validateTime();
  const locationValid = await validateLocation();
  return basicValid && timeValid && locationValid;
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  // 处理不同格式的日期：YYYY-MM-DD 或其他格式
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const [registerModal, { closeModal, setModalProps }] = useModalInner((data) => {
  resetFields();
  routeList.value = [];
  equipmentList.value = [];
  if (data.record) {
    isUpdate.value = data.isUpdate;
    isView.value = data.isView || false;
    recordId.value = data.record.planCode;
    // 查询巡检计划详情
    getFullDetail({ planId: data.record.id }).then((res) => {
      if (res.routeItems && res.routeItems.length > 0) {
        routeList.value = res.routeItems;
      }
      if (res.details && res.details.length > 0) {
        equipmentList.value = [];
        spaceList.value = [];
        systemList.value = [];

        res.details.forEach((item, index) => {
          const newItem = {
            ...item,
            key: `detail-${Date.now()}-${index}`,
          };

          if (item.objectType === "设备" || item.objectType === "device") {
            equipmentList.value.push(newItem);
          } else if (item.objectType === "空间" || item.objectType === "space") {
            spaceList.value.push(newItem);
          } else if (item.objectType === "系统" || item.objectType === "system") {
            systemList.value.push(newItem);
          } else {
            // 默认放到设备列表
            equipmentList.value.push(newItem);
          }
        });
      }
    });
    if (data.record.assigneeIds && data.record.assigneeType === "USER") {
      data.record.assigneeIds.split(",").forEach((item, index) => {
        executorOpt.value.push({
          value: item,
          label: data.record.assigneeNames.split(",")[index],
        });
      });
    }

    // 将开始日期和结束日期组合成日期范围（逗号分隔的字符串）
    const startAtFormatted = formatDate(data.record.startAt);
    const endAtFormatted = formatDate(data.record.endAt);
    const dateRange =
      startAtFormatted && endAtFormatted ? `${startAtFormatted},${endAtFormatted}` : null;
    // 处理 assigneeIds（可能是字符串或数组）
    const assigneeIdsValue = data.record.assigneeIds
      ? Array.isArray(data.record.assigneeIds)
        ? data.record.assigneeIds
        : data.record.assigneeIds.split(",")
      : [];

    // 处理 executeLocationIds（Cascader需要数组格式，转换为数字类型）
    // const executeLocationIdsValue = data.record.executeLocationIds
    //   ? Array.isArray(data.record.executeLocationIds)
    //     ? data.record.executeLocationIds.map((id) => Number(id))
    //     : data.record.executeLocationIds.split(",").map((id) => Number(id))
    //   : [];

    // 解析 cycleRule 获取 dayCycle 和 timeCycle
    let dayCycleValue = [];
    let timeCycleValue = "";
    if (data.record.cycleRule) {
      try {
        const cycleRule =
          typeof data.record.cycleRule === "string"
            ? JSON.parse(data.record.cycleRule)
            : data.record.cycleRule;
        if (cycleRule.daysOfMonth) {
          dayCycleValue = Array.isArray(cycleRule.daysOfMonth)
            ? cycleRule.daysOfMonth
            : [cycleRule.daysOfMonth];
        } else if (cycleRule.daysOfWeek) {
          dayCycleValue = Array.isArray(cycleRule.daysOfWeek)
            ? cycleRule.daysOfWeek
            : [cycleRule.daysOfWeek];
        }
        if (cycleRule.times && cycleRule.times.length > 0) {
          timeCycleValue = cycleRule.times[0];
        }
      } catch (e) {
        console.error("解析 cycleRule 失败", e);
      }
    }

    // 如果直接有 dayCycle 和 timeCycle 字段，使用它们（兼容旧数据）
    if (data.record.dayCycle) {
      dayCycleValue = Array.isArray(data.record.dayCycle)
        ? data.record.dayCycle
        : data.record.dayCycle.split(",");
    }
    if (data.record.timeCycle) {
      timeCycleValue = data.record.timeCycle;
    }
    setFieldsValue({
      id: data.record.id,
      name: data.record.name,
      majorId: data.record.majorId,
      campus: data.record.campus,
      validityType: data.record.validityType,
      dateRange: dateRange,
      cycleType: data.record.cycleType,
      dayCycle: dayCycleValue,
      timeCycle: timeCycleValue,
      startAt: data.record.startAt,
      assigneeType: data.record.assigneeType || "USER",
      assigneeIds: assigneeIdsValue,
      taskCompletionDeadline: data.record.taskCompletionDeadline,
      assigneeNames: data.record.assigneeNames || "",
      executeLocationIds: data.record.executeLocationIds
        ? JSON.parse(data.record.executeLocationIds || [])
        : [],
      executeLocationName: data.record.executeLocationName || "",
    });

    // 手动触发院区 onChange 事件，加载对应的巡检区域数据
    if (data.record.campus) {
      nextTick(() => {
        fetchLocationData({ campus: data.record.campus });
      });
    }
  } else {
    isUpdate.value = false;
    isView.value = false;
    recordId.value = null;
  }
});

async function handleSubmit() {
  try {
    const values = await formElRef.value?.validate();
    const values2 = await formElRef2.value?.validate();
    const values3 = await formElRef3.value?.validate();
    if (!values || !values2 || !values3) return;

    // 设置提交按钮为 loading 状态
    setModalProps({ confirmLoading: true });

    // 处理日期范围，拆分为开始日期和结束日期
    const submitData = { ...values, ...values2, ...values3 };
    if (values2.dateRange && values2.dateRange.split(",").length > 0) {
      submitData.startAt = values2.dateRange.split(",")[0];
      submitData.endAt = values2.dateRange.split(",")[1];
      delete submitData.dateRange;
      delete submitData.dayCycle;
    }
    if (values.assigneeIds?.length && values.assigneeType == "USER") {
      let assigneeNames = [];
      values.assigneeIds.forEach((item) => {
        let name = executorOpt.value.find((item2) => item2.value == item).label;
        assigneeNames.push(name);
      });
      submitData.assigneeIds = values.assigneeIds.join();
      submitData.assigneeNames = assigneeNames.join();
    } else {
      submitData.assigneeIds = values.assigneeIds.join();
    }
    if (values2.cycleType == "MONTHLY") {
      submitData.cycleRule = JSON.stringify({
        daysOfMonth: values2.dayCycle || [],
        times: [values2.timeCycle] || [],
      });
    } else if (values2.cycleType == "WEEKLY") {
      submitData.cycleRule = JSON.stringify({
        daysOfWeek: values2.dayCycle || [],
        times: [values2.timeCycle] || [],
      });
    } else {
      submitData.cycleRule = JSON.stringify({ times: [values2.timeCycle] || [] });
    }
    submitData.majorId = Array.isArray(values.majorId)
      ? values.majorId[0]
      : values.majorId;

    // 合并巡检明细中所有表格的 targetObjects
    submitData.targetObjects = extractAllTargetObjects();
    submitData.routeItems = routeList.value;
    submitData.executeLocationIds = JSON.stringify(values3.executeLocationIds);
    submitData.details = [
      ...equipmentList.value,
      ...spaceList.value,
      ...systemList.value,
    ];
    if (isUpdate.value) {
      await updatePlan({ ...submitData, planCode: recordId.value });
    } else {
      await savePlan(submitData);
    }
    emit("success");
    closeModal();
  } catch (error) {
    console.error("验证失败", error);
  } finally {
    // 无论成功还是失败，都关闭 loading 状态
    setModalProps({ confirmLoading: false });
  }
}
// 选择巡检对象
async function handleSelectEquipment(type) {
  const values = await formElRef.value?.validate();
  const values2 = await formElRef2.value?.validate();
  const values3 = await formElRef3.value?.validate();
  if (!values && !values2 && !values3) return;

  todo.value.objectType = type;
  todo.value.majorId = Array.isArray(values.majorId) ? values.majorId[0] : values.majorId;
  todo.value.positionInfo = values3.executeLocationName;
  todo.value.campus = values3.campus;

  // 获取已选择的对象ID列表
  let selectedIds: string[] = [];
  if (type === "device") {
    equipmentList.value.forEach((item) => selectedIds.push(item.templateId));
  } else if (type === "space") {
    spaceList.value.forEach((item) => selectedIds.push(item.templateId));
  } else if (type === "system") {
    systemList.value.forEach((item) => selectedIds.push(item.templateId));
  }
  todo.value.selectedIds = selectedIds;
  showPlanObjectModal.value = false;
  setTimeout(() => {
    showPlanObjectModal.value = true;
    setTimeout(() => {
      // 传递 todo 对象给弹窗
      openPlanObjectModal({ todo: todo.value });
    }, 10);
  }, 10);
}

// 处理选择的巡检对象，添加到巡检明细
function handleObjectSelect(data) {
  console.log("选择的巡检对象:", data);
  if (!data || !data.objects || data.objects.length === 0) {
    return;
  }

  const selectedObjects = data.objects;
  const objectType = todo.value.objectType;

  // 根据选择类型添加到对应的列表
  if (objectType === "device") {
    selectedObjects.forEach((obj, index) => {
      const subtypeName = obj.subtypeName || obj.deviceTypeName || "未知设备";
      // 检查是否已存在
      const exists = equipmentList.value.some((item) => item.subtypeName === subtypeName);
      if (exists) {
        console.warn(`对象子类 "${subtypeName}" 已存在于巡检明细中，跳过添加`);
        return;
      }
      const newItem = {
        key: `eq-${Date.now()}-${index}`,
        objectType: obj.objectType,
        subtypeName: subtypeName,
        contentSummary: obj.contentSummary || "已引用巡检内容",
        objectCount: `${obj.objectCount || 0}`,
        targetObjects: obj.targetObjects || [],
        contentItems: obj.contentItems || [],
      };
      equipmentList.value.push(newItem);
    });
  } else if (objectType === "space") {
    selectedObjects.forEach((obj, index) => {
      const subtypeName = obj.subtypeName || obj.deviceTypeName || "未知空间";
      // 检查是否已存在
      const exists = spaceList.value.some((item) => item.subtypeName === subtypeName);
      if (exists) {
        console.warn(`空间类型 "${subtypeName}" 已存在于巡检明细中，跳过添加`);
        return;
      }
      const newItem = {
        key: `sp-${Date.now()}-${index}`,
        objectType: obj.objectType,
        subtypeName: subtypeName,
        contentSummary: obj.contentSummary || "已引用巡检内容",
        objectCount: `${obj.objectCount || 0}`,
        targetObjects: obj.targetObjects || [],
        contentItems: obj.contentItems || [],
      };
      spaceList.value.push(newItem);
    });
  } else if (objectType === "system") {
    selectedObjects.forEach((obj, index) => {
      const subtypeName = obj.subtypeName || obj.deviceTypeName || "未知系统";
      // 检查是否已存在
      const exists = systemList.value.some((item) => item.subtypeName === subtypeName);
      if (exists) {
        console.warn(`系统类型 "${subtypeName}" 已存在于巡检明细中，跳过添加`);
        return;
      }
      const newItem = {
        key: `sys-${Date.now()}-${index}`,
        objectType: obj.objectType,
        subtypeName: subtypeName,
        contentSummary: obj.contentSummary || "已引用巡检内容",
        objectCount: `${obj.objectCount || 0}`,
        targetObjects: obj.targetObjects || [],
        contentItems: obj.contentItems || [],
      };
      systemList.value.push(newItem);
    });
  }
  getRoutes();

  showPlanObjectModal.value = false;
}

function getRoutes() {
  // 提取列表中所有 targetObjects 的 ObjectId
  function extractObjectIds(list: any[]): string[] {
    const codes: string[] = [];
    list.forEach((item) => {
      if (item.targetObjects && Array.isArray(item.targetObjects)) {
        item.targetObjects.forEach((obj) => {
          if (obj.objectId) {
            codes.push(obj.objectId);
          }
        });
      }
    });
    return codes;
  }
  // 合并所有列表的 ObjectId
  const allObjectIds = [
    ...extractObjectIds(equipmentList.value),
    ...extractObjectIds(spaceList.value),
    ...extractObjectIds(systemList.value),
  ];

  // 拼接成逗号分隔的字符串
  const objectSubtypeCodesStr = allObjectIds.join(",");
  console.log("拼接的 objectSubtypeCodes:", objectSubtypeCodesStr);
  if (objectSubtypeCodesStr) {
    const params = {
      majorId: todo.value.majorId,
      positionInfo: todo.value.positionInfo,
      objectSubtypeCodes: objectSubtypeCodesStr,
      campus: todo.value.campus,
    };
    getRouteMaintenanceList(params).then((res) => {
      console.log("巡检维护路线列表:", res);
      routeList.value = res || [];
    });
  } else {
    routeList.value = [];
  }
}
async function openUserModal(userType, radioType, type) {
  const values = await formElRef.value?.getFieldsValue();
  showFlag.value = false;
  setTimeout(() => {
    showFlag.value = true;
    userObj.value = {
      userType: userType,
      radioType: radioType,
      type: type,
      assigneeIds: values.assigneeIds,
      campus: values.campus,
    };
    setTimeout(() => {
      openModal(true);
    }, 20);
  }, 10);
}

function handleContentPreview(data) {
  console.log("handleContentPreview data:", data);

  // 如果数据包含 isUpdate 标志且有 contentItems，说明是从 PlanContentViewModal 返回的更新数据
  if (data.isUpdate && data.contentItems && Array.isArray(data.contentItems)) {
    // 更新对应的巡检明细记录
    updateDetailContentItems(data);
    // 不需要再次打开弹窗，只更新数据即可
    return;
  }

  // 如果是首次打开查看/编辑巡检内容
  planContentFlag.value = false;
  planContentData.value = {};

  setTimeout(() => {
    planContentData.value = data;
    planContentFlag.value = true;
    setTimeout(() => {
      // 确保数据已更新后再打开弹窗
      openPlanContentPreview({ ...data });
    }, 10);
  }, 10);
}

// 更新巡检明细中的 contentItems
function updateDetailContentItems(data: any) {
  console.log("更新巡检明细数据:", data);

  const objectType = data.objectType || data.objectTypeText;
  const subtypeName = data.subtypeName;

  console.log("objectType:", objectType, "subtypeName:", subtypeName);

  let targetList = equipmentList.value;
  if (objectType === "空间" || objectType === "space") {
    targetList = spaceList.value;
  } else if (objectType === "系统" || objectType === "system") {
    targetList = systemList.value;
  }

  console.log("目标列表:", targetList);

  // 找到对应的记录并更新
  const index = targetList.findIndex((item: any) => item.subtypeName === subtypeName);

  console.log("找到的索引:", index);

  if (index > -1) {
    targetList[index] = {
      ...targetList[index],
      contentItems: data.contentItems,
      // 更新巡检内容摘要
      contentSummary:
        data.contentItems.length > 0
          ? data.contentItems.map((item: any) => item.contentName).join("；")
          : "未设置巡检内容",
    };
    console.log("更新后的记录:", targetList[index]);
  } else {
    console.warn("未找到匹配的巡检明细记录");
  }
}
// 删除巡检明细
function handleDelete(record: Recordable) {
  const index = equipmentList.value.findIndex((item) => item.id === record.id);
  if (index > -1) {
    equipmentList.value.splice(index, 1);
    getRoutes();
    return;
  }

  const spaceIndex = spaceList.value.findIndex((item) => item.id === record.id);
  if (spaceIndex > -1) {
    spaceList.value.splice(spaceIndex, 1);
    getRoutes();
    return;
  }

  const systemIndex = systemList.value.findIndex((item) => item.id === record.id);
  if (systemIndex > -1) {
    systemList.value.splice(systemIndex, 1);
    getRoutes();
  }
}

async function handleInspectItem(record: Recordable) {
  inspectItemFlag.value = false;
  const values = await formElRef.value?.validate();
  const values2 = await formElRef2.value?.validate();
  const values3 = await formElRef3.value?.validate();

  // 先设置数据，再打开弹窗
  if (values || values2 || values3) {
    todo.value.objectType = todo.value.objectType;
    todo.value.majorId = Array.isArray(values?.majorId)
      ? values.majorId[0]
      : values?.majorId;
    todo.value.positionInfo = values3?.executeLocationName;
    todo.value.executeLocationIds = values3?.executeLocationIds;
    todo.value.campus = values3?.campus;
    todo.value.objectSubtypeCode = record.subtypeName;
  }

  setTimeout(() => {
    inspectItemFlag.value = true;
    inspectItemData.value = record;

    // 提取当前记录中已有的设备ID，用于在弹窗中自动勾选
    if (record.targetObjects && Array.isArray(record.targetObjects)) {
      todo.value.selectedIds = record.targetObjects.map(
        (obj) => obj.objectId || obj.objectCode
      );
    } else {
      todo.value.selectedIds = [];
    }

    console.log("todo.value:", todo.value);
    setTimeout(() => {
      openPlanInspectItem({ todo: todo.value });
    }, 10);
  }, 10);
}

// 处理编辑设备弹窗返回的数据
function handleInspectItemSuccess(data: any) {
  console.log("handleInspectItemSuccess data:", data);
  if (!data || !data.objects || !Array.isArray(data.objects)) {
    return;
  }

  const selectedObjects = data.objects;
  const currentRecord = inspectItemData.value;

  if (!currentRecord) {
    console.warn("没有找到当前编辑的记录");
    return;
  }

  // 更新对应巡检明细记录的设备列表
  // 查找对应的列表
  let targetList: any[] | null = null;
  if (currentRecord.objectType === "device") {
    targetList = equipmentList.value;
  } else if (currentRecord.objectType === "space") {
    targetList = spaceList.value;
  } else if (currentRecord.objectType === "system") {
    targetList = systemList.value;
  }

  if (targetList) {
    const index = targetList.findIndex((item) => item.id === currentRecord.id);
    if (index > -1) {
      // 更新 targetObjects
      targetList[index].targetObjects = selectedObjects.map((obj: any) => ({
        objectId: obj.objectId,
        objectCode: obj.objectCode,
        objectName: obj.objectName,
        objectSubtypeName: obj.objectSubtypeName,
        locationPath: obj.locationPath,
      }));
      // 更新对象数量
      targetList[index].objectCount = String(selectedObjects.length);
      message.success("设备列表已更新");

      // 更新巡检路线维护列表
      getRoutes();
    }
  }
}
</script>
<style scoped lang="scss">
.ant-divider {
  margin-top: 0 !important;
}

.circle-input-wrapper {
  width: 36px;
  height: 36px;
  margin-right: 12px;
}

.circle-input {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #1890ff;
  font-weight: bold;
  color: #1890ff;
  text-align: center;
  line-height: 36px;
  padding: 0;
  outline: none;
  background: transparent;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &:hover {
    border-color: #40a9ff;
  }
  
  &:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
