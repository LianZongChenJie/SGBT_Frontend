<template>
  <div class="meeting-list-main-box">
    <div class="table-box">
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <div class="table-title-area">
            <a-radio-group v-model:value="viewType" @change="handleViewChange" class="view-switch">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="myBooking">我预订的</a-radio-button>
              <a-radio-button value="pendingApproval">待我审批的</a-radio-button>
            </a-radio-group>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'meetingApprovalStatus'">
            <a-tag :color="getStatusColor(record.meetingApprovalStatus)">
              {{ getStatusText(record.meetingApprovalStatus) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'needApproval'">
            {{ record.needApproval === '1' ? '是' : '否' }}
          </template>
        </template>
        <template #action="{ record }">
          <div class="action-btns">
            <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
            <a-button type="link" size="small" @click="handleEdit(record)" v-if="canEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handleApprove(record)" v-if="canApprove(record)">审批</a-button>
            <a-button type="link" size="small" danger @click="handleCancel(record)" v-if="canCancel(record)">取消</a-button>
          </div>
        </template>
        <template #expandedRowRender="{ record }">
          <MeetingDateList
            :meeting-id="record.id"
            :meeting-approval-status="record.meetingApprovalStatus"
            :organizer-id="record.organizerId"
            :meeting-title="record.meetingTitle"
            :refresh-key="refreshKey"
            @adjust="handleDateAdjust"
            @cancel="handleDateCancel"
          />
        </template>
      </BasicTable>
    </div>

    <BookingModal ref="bookingRef" :reload="reload" />
    <MeetingApproveModal ref="approveRef" :reload="reload" />
    <MeetingAdjustModal ref="adjustRef" :reload="reload" />
    <DateAdjustModal ref="dateAdjustRef" @reload="handleDateAdjustReload" />
    <MeetingDetail ref="detailRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
const refreshKey = ref(0);
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { message, Modal } from 'ant-design-vue';
import MeetingApproveModal from './MeetingApproveModal.vue';
import MeetingAdjustModal from './MeetingAdjustModal.vue';
import DateAdjustModal from './DateAdjustModal.vue';
import { getMeetingListApi, cancelMeetingApi, getMeetingByIdApi, cancelDateRecordApi, getMeetingDateListApi } from './MeetingList.api';
import BookingModal from '../booking/BookingModal.vue';
import { useUserStore } from '/@/store/modules/user';
import dayjs from 'dayjs';
import MeetingDateList from './components/MeetingDateList.vue';
import MeetingDetail from './MeetingDetail.vue';

const userStore = useUserStore();
const currentUserId = computed(() => userStore.getUserInfo?.id || '');

// ==================== 轮询刷新逻辑 ====================
let pollTimer: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL = 30000; // 30秒轮询一次

const startPolling = () => {
  stopPolling();
  pollTimer = setInterval(() => {
    reload();
  }, POLL_INTERVAL);
};

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
// ==================== 轮询刷新逻辑结束 ====================

const columns: BasicColumn[] = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 50, customRender: ({ index }) => index + 1 },
  { title: '会议主题', dataIndex: 'meetingTitle', key: 'meetingTitle', width: 170, ellipsis: true },
  { title: '会议室', dataIndex: 'roomName', key: 'roomName', width: 110, ellipsis: true },
  { title: '会议类型', dataIndex: 'meetingType', key: 'meetingType', width: 80, customRender: ({ text }) => {
    const map: Record<string, string> = { meeting: '会议', training: '培训', reception: '接待' };
    return map[text] || text;
  } },
  { title: '预订时间', dataIndex: 'createTime', key: 'createTime', width: 140, customRender: ({ text }) => {
    return text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-';
  } },
  { title: '预订人', dataIndex: 'organizerName', key: 'organizerName', width: 80, ellipsis: true },
  { title: '预订部门', dataIndex: 'departmentName', key: 'departmentName', width: 110, ellipsis: true },
  { title: '审批状态', dataIndex: 'meetingApprovalStatus', key: 'meetingApprovalStatus', width: 90, customRender: ({ text }) => {
    const map: Record<string, string> = { pending: '待审批', approved: '已通过', rejected: '未通过', cancelled: '已取消' };
    return map[text] || text;
  } },
  { title: '操作', key: 'action', width: 120, slots: { customRender: 'action' } },
];

const searchFormSchema: FormSchema[] = [
  { label: '会议主题', field: 'meetingTitle', component: 'JInput' },
  { label: '会议室', field: 'roomName', component: 'JInput' },
  { label: '审批状态', field: 'meetingApprovalStatus', component: 'JDictSelectTag', componentProps: { dictCode: 'meeting_approval_status', placeholder: '请选择' } },
  { label: '预订人', field: 'organizerName', component: 'JInput' },
];

const viewType = ref<'all' | 'myBooking' | 'pendingApproval'>('myBooking');

const handleViewChange = () => {
  reload();
};

const getMeetingList = async (pageParams: any) => {
  const { pageNo, pageSize } = pageParams;
  let searchData = {};
  try {
    const form = getForm();
    if (form && form.getFieldsValue) {
      searchData = form.getFieldsValue();
    }
  } catch (e) {
    // form not ready yet
  }
  let params: any = { pageNo, pageSize, ...searchData, viewType: viewType.value };
  if (viewType.value === 'myBooking') {
    params.organizerId = currentUserId.value;
  } else if (viewType.value === 'pendingApproval') {
    params.approverId = currentUserId.value;
  }
  let res = await getMeetingListApi(params);
  let records = res.records || res;
  return { records: records, total: res.total || (records ? records.length : res.length) };
};

const { tableContext } = useListPage({
  designScope: 'meeting-list-table',
  tableProps: {
    api: getMeetingList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    rowKey: 'id',
    pagination: { pageSize: 10, showSizeChanger: true },
    showTableSetting: false,
    formConfig: {
      schemas: searchFormSchema,
      showAdvancedButton: false,
      submitOnReset: true,
      rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      baseColProps: { span: 6 },
      baseRowStyle: { width: '100%' },
      labelCol: { style: { width: 'auto' } },
    },
  },
});

const [registerTable, { reload, getForm }] = tableContext;

const bookingRef = ref();
const approveRef = ref();
const adjustRef = ref();
const detailRef = ref();

const handleView = (record: any) => {
  detailRef.value.showModal(record, true);
};

const handleEdit = (record: any) => {
  bookingRef.value.showModal(record);
};

const handleApprove = (record: any) => {
  approveRef.value.showModal(record);
};

const handleAdjust = (record: any) => {
  adjustRef.value.showModal(record);
};

const dateAdjustRef = ref();

const handleDateAdjust = (record: any) => {
  dateAdjustRef.value.showModal(record);
};

const handleDateAdjustReload = () => {
  refreshKey.value++; // 触发子组件刷新
  reload();
};

const handleDateCancel = (record: any) => {
  Modal.confirm({
    title: '确认取消',
    content: `确定要取消 ${dayjs(record.meetingDate).format('YYYY-MM-DD')} 的会议吗？`,
    onOk: async () => {
      await cancelDateRecordApi({ id: record.id });
      message.success('取消成功');
      refreshKey.value++; // 触发子组件刷新
      reload();
    },
  });
};

const handleCancel = async (record: any) => {
  // 后端已检查子表状态，前端直接执行取消
  Modal.confirm({
    title: '确认取消',
    content: `确定要取消会议 "${record.meetingTitle}" 吗？`,
    onOk: async () => {
      await cancelMeetingApi({ id: record.id });
      message.success('取消成功');
      reload();
    },
  });
};

const canEdit = (record: any) => {
  return record.meetingApprovalStatus === 'pending' && record.organizerId === currentUserId.value;
};

const canApprove = (record: any) => {
  return record.meetingApprovalStatus === 'pending' && record.needApproval === '1' && record.approverId === currentUserId.value;
};

const canCancel = (record: any) => {
  const isOrganizer = record.organizerId === currentUserId.value;
  // 使用后端返回的 canCancel 字段判断是否可取消
  // 后端已检查所有子表状态，只有全部为 not_started 或 pending 时才返回 true
  return isOrganizer && record.canCancel === true;
};

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    cancelled: 'gray',
    not_started: 'blue',
    ongoing: 'cyan',
    completed: 'purple',
  };
  return map[status] || 'default';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '未通过',
    cancelled: '已取消',
    not_started: '未开始',
    ongoing: '进行中',
    completed: '已结束',
  };
  return map[status] || status;
};
</script>

<style lang="less" scoped>
.meeting-list-main-box {
  height: 100%;
  width: 100%;
  .table-box {
    height: 100%;
    width: 100%;
    padding: 10px 10px;
    background-color: #fff;
  }
  .action-btns {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;
    :deep(.ant-btn) {
      padding: 0 4px;
      font-size: 13px;
    }
  }
  .table-title-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .view-switch {
      margin-right: 16px;
    }
  }
}
</style>
