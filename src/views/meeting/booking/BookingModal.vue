<template>
  <a-modal
    v-model:open="open"
    :title="isView ? '会议详情' : (isEdit ? '编辑会议' : '预约会议')"
    width="800px"
    :footer="null"
    :mask-closable="true"
  >
    <div class="booking-modal-content">
      <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="会议主题" name="meetingTitle">
              <a-input v-model:value="formState.meetingTitle" placeholder="请输入会议主题" :disabled="isView" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="会议室" name="roomId">
              <a-select v-model:value="formState.roomId" placeholder="请选择会议室" :disabled="isView || isEdit">
                <a-select-option v-for="room in roomList" :key="room.id" :value="room.id">
                  {{ room.roomName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="会议类型" name="meetingType">
              <a-select v-model:value="formState.meetingType" placeholder="请选择会议类型" :disabled="isView">
                <a-select-option value="meeting">会议</a-select-option>
                <a-select-option value="training">培训</a-select-option>
                <a-select-option value="reception">接待</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="会议日期" name="meetingDateRange">
              <a-range-picker
                v-model:value="formState.meetingDateRange"
                valueFormat="YYYY-MM-DD"
                :placeholder="['开始日期', '结束日期']"
                style="width: 100%"
                :disabled="isView || (isEdit && !allDatesNotStarted)"
                :disabled-date="disabledDate"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 周一到周日复选框 -->
        <a-form-item label="重复日期" v-if="!isEdit && !isView">
          <div class="weekday-checkbox-group">
            <a-checkbox
              v-for="day in weekDayOptions"
              :key="day.value"
              :checked="formState.weekDays.includes(day.value)"
              :disabled="isWeekDayDisabled(day.value)"
              @change="(checked) => handleWeekDayChange(day.value, checked)"
            >
              {{ day.label }}
            </a-checkbox>
          </div>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间" name="startTime">
              <a-time-picker
                v-model:value="formState.startTime"
                format="HH:mm"
                valueFormat="HH:mm"
                :minute-step="30"
                placeholder="请选择开始时间"
                style="width: 100%"
                :disabled="isView || (isEdit && !allDatesNotStarted)"
                :disabled-time="disabledTime"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间" name="endTime">
              <a-time-picker
                v-model:value="formState.endTime"
                format="HH:mm"
                valueFormat="HH:mm"
                :minute-step="30"
                placeholder="请选择结束时间"
                style="width: 100%"
                :disabled="isView || (isEdit && !allDatesNotStarted)"
                :disabled-time="disabledTime"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="预订部门" name="departmentId">
              <div class="dept-user-display">
                <span class="display-text">{{ formState.departmentName || formState.departmentId || '-' }}</span>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="会议预订人" name="organizerId">
              <div class="dept-user-display">
                <span class="display-text">{{ formState.organizerName || formState.organizerId || '-' }}</span>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="参会人" v-if="!isView">
          <div class="participant-section">
            <a-button type="dashed" @click="showInternalModal" style="margin-right: 8px;">
              <PlusOutlined /> 添加内部参会人
            </a-button>
            <a-button type="dashed" @click="showExternalModal">
              <PlusOutlined /> 添加外部参会人
            </a-button>
          </div>
          <div class="participant-list" v-if="participantList.length > 0">
            <a-tag
              v-for="(p, index) in participantList"
              :key="index"
              closable
              @close="removeParticipant(index)"
              :color="p.participantType === 'internal' ? 'blue' : 'green'"
            >
              {{ p.userName }} {{ p.participantType === 'internal' ? '(内部)' : '(外部)' }}
            </a-tag>
          </div>
        </a-form-item>

        <a-form-item label="会议内容" name="meetingDesc">
          <a-textarea v-model:value="formState.meetingDesc" :rows="3" placeholder="请输入会议内容" :disabled="isView" />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formState.remark" :rows="2" placeholder="请输入备注" :disabled="isView" />
        </a-form-item>

        <div class="modal-footer" v-if="!isView">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
        </div>
        <div class="modal-footer" v-else>
          <a-button @click="handleCancel">关闭</a-button>
          <a-button type="primary" @click="handleEdit" v-if="canEdit">编辑</a-button>
          <a-button danger @click="handleCancelMeeting" v-if="canCancel">取消会议</a-button>
        </div>
      </a-form>
    </div>

    <InternalParticipantModal
      ref="internalModalRef"
      @confirm="addInternalParticipants"
    />
    <ExternalParticipantModal
      ref="externalModalRef"
      @confirm="addExternalParticipant"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { addMeetingApi, editMeetingApi, cancelMeetingApi, checkTimeConflictApi } from './Booking.api';
import { getRoomListApi } from '../room/Room.api';
import { useUserStore } from '/@/store/modules/user';
import { getAuthCache } from '/@/utils/auth';
import { USER_INFO_KEY } from '/@/enums/cacheEnum';
import { queryDepartTreeSync, getTableList } from '/@/api/common/api';
import { departUserList } from '/@/views/system/departUser/depart.user.api';
import { listNoCareTenant } from '/@/views/system/user/user.api';
import InternalParticipantModal from './InternalParticipantModal.vue';
import ExternalParticipantModal from './ExternalParticipantModal.vue';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

const props = defineProps({
  reload: Function,
});

const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);

const open = ref(false);
const isView = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();
const roomList = ref<any[]>([]);
const participantList = ref<any[]>([]);
const internalModalRef = ref();
const externalModalRef = ref();
const deptTreeData = ref<any[]>([]);
const userOptions = ref<any[]>([]);
const isEditingDeptUser = ref(false);

const weekDayOptions = [
  { value: '1', label: '周一' },
  { value: '2', label: '周二' },
  { value: '3', label: '周三' },
  { value: '4', label: '周四' },
  { value: '5', label: '周五' },
  { value: '6', label: '周六' },
  { value: '7', label: '周日' },
];

const formState = reactive<any>({
  id: undefined,
  meetingTitle: '',
  roomId: undefined,
  meetingType: undefined,
  meetingDateRange: undefined,
  weekDays: [],
  startTime: undefined,
  endTime: undefined,
  organizerId: undefined,
  organizerName: '',
  departmentId: undefined,
  departmentName: '',
  meetingDesc: '',
  remark: '',
  meetingApprovalStatus: '',
  dateList: [],
});

const rules = {
  meetingTitle: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
  roomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
  meetingType: [{ required: true, message: '请选择会议类型', trigger: 'change' }],
  meetingDateRange: [
    { required: true, message: '请选择会议日期范围', trigger: 'change' },
    {
      validator: (_rule, value) => {
        if (!value || value.length !== 2 || !value[0] || !value[1]) {
          return Promise.reject('请选择会议日期范围');
        }
        return Promise.resolve();
      },
      trigger: 'change',
    },
  ],
  departmentId: [{ required: true, message: '请选择预订部门', trigger: 'change' }],
  organizerId: [{ required: true, message: '请选择会议预订人', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
};

const canEdit = computed(() => {
  return formState.meetingApprovalStatus === 'pending' || formState.meetingApprovalStatus === 'not_started' || formState.meetingApprovalStatus === 'approved';
});

const canCancel = computed(() => {
  return formState.meetingApprovalStatus === 'pending' || formState.meetingApprovalStatus === 'not_started' || formState.meetingApprovalStatus === 'approved';
});

// 是否所有日期记录都是未开始（用于控制编辑时能否修改日期时间）
const allDatesNotStarted = computed(() => {
  if (!formState.dateList || formState.dateList.length === 0) return true;
  return formState.dateList.every((d: any) => d.meetingExecutionStatus === 'not_started' || d.meetingExecutionStatus === 'pending');
});

// 是否为单日预约
const isSingleDay = computed(() => {
  const range = formState.meetingDateRange;
  return range && range.length === 2 && range[0] && range[0] === range[1];
});

// 获取日期范围内包含的周几（1-7，1=周一，7=周日）
const availableWeekDays = computed(() => {
  const range = formState.meetingDateRange;
  if (!range || range.length !== 2 || !range[0] || !range[1]) return [];
  const start = dayjs(range[0]);
  const end = dayjs(range[1]);
  const days = new Set<string>();
  let current = start.clone();
  while (current.isSameOrBefore(end, 'day')) {
    const day = current.day();
    days.add(day === 0 ? '7' : String(day));
    current = current.add(1, 'day');
  }
  return Array.from(days);
});

// 单日预约时自动计算周几
const singleDayWeekDay = computed(() => {
  if (!isSingleDay.value) return null;
  // dayjs 的 day() 返回 0-6，0 是周日，需要转换为 1-7
  const day = dayjs(formState.meetingDateRange[0]).day();
  return day === 0 ? '7' : String(day);
});

// 是否为今天
const isTodaySelected = computed(() => {
  if (!formState.meetingDateRange?.[0]) return false;
  return dayjs(formState.meetingDateRange[0]).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
});

// 判断周几是否禁用
const isWeekDayDisabled = (dayValue: string) => {
  if (isSingleDay.value) {
    return singleDayWeekDay.value !== dayValue;
  }
  // 多日：如果日期范围已选择，不在范围内的周几禁用
  const range = formState.meetingDateRange;
  if (range && range.length === 2 && range[0] && range[1]) {
    const available = availableWeekDays.value || [];
    console.log('availableWeekDays:', available, 'checking:', dayValue, 'result:', !available.includes(dayValue));
    return !available.includes(dayValue);
  }
  return false;
};

// 处理周几选择变化
const handleWeekDayChange = (dayValue: string, checked: boolean) => {
  if (checked) {
    if (!formState.weekDays.includes(dayValue)) {
      formState.weekDays.push(dayValue);
    }
  } else {
    const index = formState.weekDays.indexOf(dayValue);
    if (index > -1) {
      formState.weekDays.splice(index, 1);
    }
  }
};

// 当前小时（用于过滤时间选择器）
const currentHour = computed(() => {
  return dayjs().hour();
});

// 日期选择器禁用函数（禁止选择今天之前的日期）
const disabledDate = (current: any) => {
  return current && current.isBefore(dayjs().startOf('day'));
};

// 时间选择器禁用函数（仅当天单日期时生效）
const disabledTime = () => {
  const disabledHours = [];
  const disabledMinutes = [];
  const disabledSeconds = [];
  if (isTodaySelected.value && isSingleDay.value) {
    const nowHour = dayjs().hour();
    const nowMinute = dayjs().minute();
    for (let i = 0; i <= nowHour; i++) {
      disabledHours.push(i);
    }
    for (let i = 0; i < nowMinute; i++) {
      disabledMinutes.push(i);
    }
  }
  return {
    disabledHours: () => disabledHours,
    disabledMinutes: () => disabledMinutes,
    disabledSeconds: () => disabledSeconds,
  };
};

// 监听日期范围变化，单日自动勾选周几
watch(
  () => formState.meetingDateRange,
  (newRange) => {
    if (!newRange || newRange.length !== 2 || !newRange[0] || !newRange[1]) {
      formState.weekDays = [];
      return;
    }
    // 单日：自动勾选当天周几
    if (newRange[0] === newRange[1]) {
      const day = dayjs(newRange[0]).day();
      formState.weekDays = [day === 0 ? '7' : String(day)];
      return;
    }
    // 多日：清空已勾选，让用户自己选择范围内的周几
    formState.weekDays = [];
  },
  { deep: false }
);

const loadRooms = async () => {
  try {
    const res = await getRoomListApi({ pageNo: 1, pageSize: 100, status: '1' });
    const list = res.records || res || [];
    roomList.value = list.map((room: any) => ({
      ...room,
      roomName: room.roomName + (room.needApproval === '1' ? '（需审批）' : ''),
    }));
  } catch (error) {
    console.error('加载会议室失败', error);
  }
};

// 转换树数据格式（a-tree-select 需要 value/key 字段）
const transformTreeData = (data: any[]): any[] => {
  return data.map((item) => {
    const node: any = {
      title: item.departName || item.title,
      value: String(item.id),
      key: String(item.id),
      departName: item.departName,
      id: item.id,
      isLeaf: item.isLeaf || item.leaf || false,
    };
    if (item.children && item.children.length > 0) {
      node.children = transformTreeData(item.children);
    }
    return node;
  });
};

// 加载部门树（异步加载子节点）
const loadDeptTree = async () => {
  try {
    const res = await queryDepartTreeSync();
    deptTreeData.value = transformTreeData(res || []);
    return deptTreeData.value;
  } catch (error) {
    console.error('加载部门树失败', error);
    return [];
  }
};

// 异步加载子部门
const loadChildrenTreeData = async (treeNode: any) => {
  try {
    const res = await queryDepartTreeSync({ pid: treeNode.dataRef.id });
    if (res && Array.isArray(res) && res.length > 0) {
      treeNode.dataRef.children = transformTreeData(res);
      deptTreeData.value = [...deptTreeData.value];
    } else {
      treeNode.dataRef.isLeaf = true;
    }
  } catch (error) {
    console.error('加载子部门失败', error);
  }
  return Promise.resolve();
};

// 根据部门加载用户列表
const loadUsersByDept = async (deptId: string) => {
  userOptions.value = [];
  if (!deptId) return;
  try {
    const res = await departUserList({ depId: deptId, pageNo: 1, pageSize: 999 });
    if (res && res.records) {
      userOptions.value = res.records;
    } else if (res && Array.isArray(res)) {
      userOptions.value = res;
    } else {
      userOptions.value = [];
    }
  } catch (error) {
    console.error('加载部门用户失败', error);
  }
};

const handleUserChange = (value) => {
  const user = userOptions.value.find((u) => u.id === value);
  if (user) {
    formState.organizerName = user.realname || user.username;
  }
};

const handleDeptChange = (value) => {
  formState.organizerId = undefined;
  formState.organizerName = '';
  if (value) {
    loadUsersByDept(value);
    // 查找部门名称（转换后的树数据用 value 字段匹配）
    const findDeptName = (list: any[]) => {
      for (const item of list) {
        if (String(item.value) === String(value)) {
          formState.departmentName = item.departName || item.title;
          return true;
        }
        if (item.children && findDeptName(item.children)) {
          return true;
        }
      }
      return false;
    };
    findDeptName(deptTreeData.value);
  }
};

const startEditDeptUser = () => {
  isEditingDeptUser.value = true;
  // 清空部门和预订人
  formState.departmentId = '';
  formState.departmentName = '';
  formState.organizerId = '';
  formState.organizerName = '';
  userOptions.value = [];
  // 加载部门树
  loadDeptTree();
};

const showModal = async (record?: any, view = false) => {
  await loadRooms();
  open.value = true;
  isView.value = view;
  isEdit.value = !!record?.id && !view;
  participantList.value = [];
  isEditingDeptUser.value = false; // 重置为显示模式

  if (record?.id) {
    // 编辑/查看时加载部门树
    await loadDeptTree();
    // 如果传入的是列表页数据（只有 meetingDate 没有 meetingDateRange），需要转换
    // 如果传入的是详情数据（有 dateList），从 dateList 中提取日期范围
    let dateRange = record.meetingDateRange;
    let startTime = record.startTime;
    let endTime = record.endTime;
    
    // 如果有 dateList（详情数据），从中提取日期范围和时间
    if (record.dateList && record.dateList.length > 0) {
      const dates = record.dateList.map((d: any) => d.meetingDate).sort();
      dateRange = [dates[0], dates[dates.length - 1]];
      // 取第一条记录的时间（假设所有日期时间相同）
      startTime = record.dateList[0].startTime;
      endTime = record.dateList[0].endTime;
    } else if (!dateRange && record.meetingDate) {
      dateRange = [record.meetingDate, record.meetingDate];
    }
    
    Object.assign(formState, {
      id: record.id,
      meetingTitle: record.meetingTitle,
      roomId: record.roomId,
      meetingType: record.meetingType,
      meetingDateRange: dateRange,
      weekDays: record.weekDays || [],
      startTime: startTime,
      endTime: endTime,
      organizerId: record.organizerId,
      organizerName: record.organizerName,
      departmentId: record.departmentId,
      departmentName: record.departmentName,
      meetingDesc: record.meetingDesc,
      remark: record.remark,
      meetingApprovalStatus: record.meetingApprovalStatus,
      dateList: record.dateList || [],
    });
    if (record.participantList) {
      participantList.value = [...record.participantList];
    }
    // 编辑/查看时加载部门下的用户
    if (record.departmentId) {
      await loadUsersByDept(record.departmentId);
    }
  } else {
    // 新增预约：从 userStore 读取当前登录人信息（有兜底逻辑）
    let loginUser = userStore.getUserInfo || {};
    console.log('userStore.getUserInfo:', JSON.parse(JSON.stringify(loginUser)));
    
    // 如果 orgCode 为空，尝试调用接口获取完整用户信息
    if (!loginUser?.orgCode) {
      try {
        const res = await listNoCareTenant({ username: loginUser?.username, pageNo: 1, pageSize: 1 });
        console.log('listNoCareTenant res:', res);
        if (res?.records?.length > 0) {
          const fullUserInfo = res.records[0];
          loginUser = { ...loginUser, ...fullUserInfo };
          console.log('merged userInfo:', JSON.parse(JSON.stringify(loginUser)));
        }
      } catch (e) {
        console.error('获取完整用户信息失败', e);
      }
    }
    
    // 如果还是没有部门名称，尝试从 departIds 解析
    if (!loginUser?.orgCode && loginUser?.departIds) {
      try {
        const deptIds = loginUser.departIds.split(',').filter(Boolean);
        if (deptIds.length > 0) {
          const res = await listNoCareTenant({ id: deptIds[0], pageNo: 1, pageSize: 1 });
          console.log('listNoCareTenant by deptId res:', res);
          if (res?.records?.length > 0) {
            const fullUserInfo = res.records[0];
            loginUser = { ...loginUser, ...fullUserInfo };
            console.log('merged userInfo by deptId:', JSON.parse(JSON.stringify(loginUser)));
          }
        }
      } catch (e) {
        console.error('获取部门信息失败', e);
      }
    }
    
    // 如果 orgCode 有值但 orgCodeTxt 为空，尝试调用接口获取部门名称
    if (loginUser?.orgCode && !loginUser?.orgCodeTxt) {
      try {
        const res = await listNoCareTenant({ orgCode: loginUser.orgCode, pageNo: 1, pageSize: 1 });
        console.log('listNoCareTenant by orgCode res:', res);
        if (res?.records?.length > 0) {
          const fullUserInfo = res.records[0];
          loginUser = { ...loginUser, ...fullUserInfo };
          console.log('merged userInfo by orgCode:', JSON.parse(JSON.stringify(loginUser)));
        }
      } catch (e) {
        console.error('获取部门名称失败', e);
      }
    }
    
    // 同时尝试 orgCode 和 deptId
    const defaultDeptId = String(loginUser?.orgCode || loginUser?.deptId || '');
    const defaultUserId = loginUser?.id || loginUser?.userId || '';
    const defaultUserName = loginUser?.realname || loginUser?.username || '';
    // 尝试从 userInfo 中获取部门名称
    let defaultDeptName = loginUser?.orgName || loginUser?.deptName || loginUser?.orgCodeTxt || '';
    
    // 如果部门名称为空但有部门ID，尝试从部门树中查找名称
    if (!defaultDeptName && defaultDeptId) {
      try {
        const deptTree = await queryDepartTreeSync();
        console.log('deptTree:', JSON.parse(JSON.stringify(deptTree)));
        console.log('looking for deptId:', defaultDeptId);
        const findDeptName = (list: any[]): string => {
          for (const item of list) {
            console.log('checking item:', item.id, item.departName);
            if (item.id === defaultDeptId) {
              return item.departName;
            }
            if (item.children) {
              const found = findDeptName(item.children);
              if (found) return found;
            }
          }
          return '';
        };
        defaultDeptName = findDeptName(deptTree || []);
        console.log('found dept name from tree:', defaultDeptName);
      } catch (e) {
        console.error('加载部门树失败', e);
      }
    }
    
    console.log('default values:', { defaultDeptId, defaultUserId, defaultUserName, defaultDeptName });

    // 判断是否从单元格点击传入（有meetingDate表示从日历点击）
    const isFromCell = !!record?.meetingDate;
    
    // 计算默认时间
    let defaultStartStr: string;
    let defaultEndStr: string;
    let defaultDateRange: string[];
    
    if (isFromCell) {
      // 从单元格点击：使用传入的日期和时间
      defaultDateRange = [record.meetingDate, record.meetingDate];
      defaultStartStr = record.startTime;
      defaultEndStr = record.endTime;
    } else {
      // 从预约按钮点击：日期默认当天，时间根据当前时间计算
      defaultDateRange = [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
      const now = dayjs();
      const currentMinute = now.minute();
      let defaultStart = now;
      if (currentMinute > 30) {
        defaultStart = now.add(1, 'hour').startOf('hour');
      } else if (currentMinute > 0) {
        defaultStart = now.startOf('hour').add(30, 'minute');
      } else {
        defaultStart = now.startOf('hour');
      }
      defaultStartStr = defaultStart.format('HH:mm');
      defaultEndStr = defaultStart.add(1, 'hour').format('HH:mm');
    }

    // 手动重置表单
    Object.assign(formState, {
      id: undefined,
      meetingTitle: '',
      roomId: record?.roomId || roomList.value[0]?.id,
      meetingType: undefined,
      meetingDateRange: defaultDateRange,
      weekDays: [],
      startTime: defaultStartStr,
      endTime: defaultEndStr,
      organizerId: defaultUserId,
      organizerName: defaultUserName,
      departmentId: defaultDeptId,
      departmentName: defaultDeptName || defaultDeptId,
      meetingDesc: '',
      remark: '',
    });
  }
};

const handleCancel = () => {
  open.value = false;
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    submitLoading.value = true;

    // 将dayjs对象转换为字符串
    const meetingDateStr = formState.meetingDateRange?.[0]?.format?.('YYYY-MM-DD') || formState.meetingDateRange?.[0];
    const endDateStr = formState.meetingDateRange?.[1]?.format?.('YYYY-MM-DD') || formState.meetingDateRange?.[1];

    // 检查时间冲突
    console.log('检查时间冲突:', {
      roomId: formState.roomId,
      meetingDate: meetingDateStr,
      startTime: formState.startTime,
      endTime: formState.endTime,
      excludeId: formState.id,
    });
    const conflictRes = await checkTimeConflictApi({
      roomId: formState.roomId,
      meetingDate: meetingDateStr,
      startTime: formState.startTime,
      endTime: formState.endTime,
      excludeId: formState.id,
    });
    console.log('时间冲突原始返回:', conflictRes);
    const hasConflict = conflictRes === true || conflictRes.result === true;
    console.log('时间冲突判断结果:', hasConflict);

    if (hasConflict) {
      message.warning('该时间段会议室已被占用，请选择其他时间');
      submitLoading.value = false;
      return;
    }

    // 生成多日会议的日期列表
    const dateList = [];
    if (meetingDateStr && endDateStr) {
      const start = dayjs(meetingDateStr);
      const end = dayjs(endDateStr);
      let current = start;
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        dateList.push({
          meetingDate: current.format('YYYY-MM-DD'),
          roomId: formState.roomId,
          startTime: formState.startTime,
          endTime: formState.endTime,
          weekDay: current.format('ddd'),
        });
        current = current.add(1, 'day');
      }
    }

    const selectedRoom = roomList.value.find((room: any) => room.id === formState.roomId);
    const params = {
      ...formState,
      meetingDate: meetingDateStr,
      endDate: endDateStr,
      dateList,
      participantList: participantList.value,
      needApproval: selectedRoom?.needApproval || '0',
    };
    // 删除不需要的字段
    delete params.meetingDateRange;

    if (isEdit.value) {
      await editMeetingApi(params);
      message.success('编辑成功');
    } else {
      await addMeetingApi(params);
      message.success('预约成功');
    }

    open.value = false;
    props.reload?.();
  } catch (error) {
    console.error('提交失败', error);
  } finally {
    submitLoading.value = false;
  }
};

const handleEdit = () => {
  isView.value = false;
  isEdit.value = true;
};

const handleCancelMeeting = () => {
  Modal.confirm({
    title: '确认取消',
    content: '确定要取消该会议吗？',
    onOk: async () => {
      await cancelMeetingApi({ id: formState.id });
      message.success('取消成功');
      open.value = false;
      props.reload?.();
    },
  });
};

const showInternalModal = () => {
  internalModalRef.value.showModal();
};

const showExternalModal = () => {
  externalModalRef.value.showModal();
};

const addInternalParticipants = (users: any[]) => {
  users.forEach(user => {
    if (!participantList.value.find(p => p.userId === user.id)) {
      participantList.value.push({
        userId: user.id,
        userName: user.realname || user.username,
        deptName: user.orgCodeTxt || '',
        participantType: 'internal',
      });
    }
  });
};

const addExternalParticipant = (data: any) => {
  participantList.value.push({
    userName: data.name,
    contactInfo: data.contact,
    participantType: 'external',
  });
};

const removeParticipant = (index: number) => {
  participantList.value.splice(index, 1);
};

defineExpose({ showModal });
</script>

<style lang="less" scoped>
.booking-modal-content {
  padding: 0 16px;
}

.participant-section {
  margin-bottom: 8px;
}

.participant-list {
  margin-top: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.dept-user-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background-color: #fafafa;
  min-height: 32px;
  
  .display-text {
    flex: 1;
    color: rgba(0, 0, 0, 0.85);
  }
}
</style>
