<template>
  <a-modal
    v-model:open="open"
    :title="isView ? '会议详情' : (isEdit ? '编辑会议' : '新增会议')"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-form :model="formState" class="detail-form">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item class="inline-item">
            <template #label>
              <span class="label-text">会议主题：</span>
            </template>
            <a-input v-model:value="formState.meetingTitle" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item class="inline-item">
            <template #label>
              <span class="label-text">会议室：</span>
            </template>
            <a-input v-model:value="formState.roomName" disabled />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item class="inline-item">
            <template #label>
              <span class="label-text">会议日期：</span>
            </template>
            <a-input :value="getDateRangeText(formState.dateList)" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item class="inline-item">
            <template #label>
              <span class="label-text">会议时间：</span>
            </template>
            <a-input :value="getTimeRangeText(formState.dateList)" disabled />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item class="inline-item">
            <template #label>
              <span class="label-text">会议预订人：</span>
            </template>
            <a-input v-model:value="formState.organizerName" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item class="inline-item">
            <template #label>
              <span class="label-text">预订部门：</span>
            </template>
            <a-input v-model:value="formState.departmentName" disabled />
          </a-form-item>
        </a-col>
      </a-row>
      
      <!-- 参会人员 -->
      <div class="participant-section" v-if="formState.participantList && formState.participantList.length > 0">
        <div class="section-header">
          <span class="section-title">参会人员</span>
        </div>
        <div class="participant-tabs">
          <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane key="all" :tab="`全部(${participantStats.all})`" />
            <a-tab-pane key="attended" :tab="`参加(${participantStats.attended})`" />
            <a-tab-pane key="absent" :tab="`请假/指派(${participantStats.absent})`" />
            <a-tab-pane key="pending" :tab="`未反馈(${participantStats.pending})`" />
          </a-tabs>
        </div>
        <a-table
          :columns="participantColumns"
          :data-source="filteredParticipants"
          :pagination="false"
          size="small"
          bordered
        />
      </div>
      <a-form-item class="inline-item" v-else>
        <template #label>
          <span class="label-text">参会人：</span>
        </template>
        <span>无参会人</span>
      </a-form-item>
      
      <a-form-item class="inline-item">
        <template #label>
          <span class="label-text">会议内容：</span>
        </template>
        <a-textarea v-model:value="formState.meetingDesc" :rows="3" disabled />
      </a-form-item>
      <a-form-item class="inline-item">
        <template #label>
          <span class="label-text">备注：</span>
        </template>
        <a-textarea v-model:value="formState.remark" :rows="2" disabled />
      </a-form-item>
      
      <div class="modal-footer">
        <a-button @click="handleCancel">关闭</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { getMeetingByIdApi } from './MeetingList.api';
import dayjs from 'dayjs';

const open = ref(false);
const isView = ref(false);
const isEdit = ref(false);
const activeTab = ref('all');

const formState = reactive<any>({
  id: undefined,
  meetingTitle: '',
  roomName: '',
  meetingType: '',
  meetingType_dictText: '',
  meetingApprovalStatus: '',
  organizerName: '',
  departmentName: '',
  meetingDesc: '',
  remark: '',
  dateList: [],
  participantList: [],
});

const participantColumns = [
  { title: '序号', key: 'index', width: 60, align: 'center', customRender: ({ index }: any) => index + 1 },
  { title: '姓名', dataIndex: 'userName', key: 'userName', align: 'center' },
  { title: '电话', dataIndex: 'contactInfo', key: 'contactInfo', align: 'center', customRender: ({ text }: any) => text || '-' },
  { title: '状态', dataIndex: 'attendStatus', key: 'attendStatus', width: 100, align: 'center', customRender: ({ text }: any) => getAttendStatusText(text) },
  { title: '确认时间', dataIndex: 'signInTime', key: 'signInTime', width: 160, align: 'center', customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '无' },
];

const participantStats = computed(() => {
  const list = formState.participantList || [];
  return {
    all: list.length,
    attended: list.filter((p: any) => p.attendStatus === 'attended').length,
    absent: list.filter((p: any) => p.attendStatus === 'absent').length,
    pending: list.filter((p: any) => p.attendStatus === 'pending').length,
  };
});

const filteredParticipants = computed(() => {
  const list = formState.participantList || [];
  if (activeTab.value === 'all') return list;
  return list.filter((p: any) => p.attendStatus === activeTab.value);
});

const getAttendStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待确认',
    attended: '已确认',
    absent: '缺席',
  };
  return map[status] || status || '-';
};

const getDateRangeText = (dateList: any[]) => {
  if (!dateList || dateList.length === 0) return '-';
  const dates = dateList.map(d => d.meetingDate).filter(Boolean).sort();
  if (dates.length === 0) return '-';
  if (dates.length === 1) return dayjs(dates[0]).format('YYYY-MM-DD');
  return `${dayjs(dates[0]).format('YYYY-MM-DD')} - ${dayjs(dates[dates.length - 1]).format('YYYY-MM-DD')}`;
};

const getTimeRangeText = (dateList: any[]) => {
  if (!dateList || dateList.length === 0) return '-';
  const startTime = dateList[0]?.startTime;
  const endTime = dateList[0]?.endTime;
  if (!startTime || !endTime) return '-';
  return `${startTime} - ${endTime}`;
};

const showModal = async (record?: any, view = false) => {
  open.value = true;
  isView.value = view;
  isEdit.value = !!record?.id && !view;
  activeTab.value = 'all';
  
  if (record?.id) {
    try {
      const res = await getMeetingByIdApi({ id: record.id });
      const data = res.result || res;
      
      Object.assign(formState, {
        id: data.id,
        meetingTitle: data.meetingTitle || '',
        roomName: data.roomName || '',
        meetingType: data.meetingType || '',
        meetingType_dictText: data.meetingType_dictText || '',
        meetingApprovalStatus: data.meetingApprovalStatus || '',
        organizerName: data.organizerName || '',
        departmentName: data.departmentName || '',
        meetingDesc: data.meetingDesc || '',
        remark: data.remark || '',
        dateList: data.dateList || [],
        participantList: data.participantList || [],
      });
    } catch (error) {
      console.error('加载会议详情失败', error);
    }
  }
};

const handleCancel = () => { open.value = false; };

defineExpose({ showModal });
</script>

<style lang="less" scoped>
:deep(.ant-modal-body) {
  padding-right: 40px;
}

.detail-form {
  .inline-item {
    :deep(.ant-form-item-label) {
      width: 100px;
      text-align: right;
      padding-right: 8px;
      
      label {
        color: #333;
        font-weight: normal;
      }
      
      label::after {
        content: '';
      }
    }
    
    :deep(.ant-form-item-control) {
      flex: 1;
    }
  }
  
  .label-text {
    color: #333;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.participant-section {
  margin-bottom: 16px;
  
  .section-header {
    background: #1a3a4a;
    padding: 10px 16px;
    border-radius: 4px 4px 0 0;
    
    .section-title {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
    }
  }
  
  .participant-tabs {
    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
      padding: 0 16px;
      border-bottom: 1px solid #f0f0f0;
    }
  }
}
</style>
