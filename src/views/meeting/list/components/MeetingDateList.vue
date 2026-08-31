<template>
  <div class="meeting-date-list">
    <a-table
      :columns="dateColumns"
      :data-source="dateList"
      :pagination="false"
      size="small"
      bordered
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'meetingDate'">
          {{ formatDate(record.meetingDate) }}
        </template>
        <template v-if="column.key === 'weekDay'">
          {{ getWeekDayText(record.weekDay) }}
        </template>
        <template v-if="column.key === 'timeRange'">
          {{ record.startTime }} - {{ record.endTime }}
        </template>
        <template v-if="column.key === 'roomName'">
          {{ getRoomName(record.roomId) }}
        </template>
        <template v-if="column.key === 'meetingExecutionStatus'">
          <a-tag :color="getStatusColor(record.meetingExecutionStatus)">
            {{ getStatusText(record.meetingExecutionStatus) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'attachment'">
          <a-button
            v-if="record.minutesFileName"
            type="link"
            size="small"
            @click="handleDownload(record)"
          >
            {{ record.minutesFileName }}
          </a-button>
          <span v-else>-</span>
        </template>
        <template v-if="column.key === 'action'">
          <a-button
            type="link"
            size="small"
            @click="handleAdjust(record)"
            v-if="canAdjust(record)"
          >
            调整
          </a-button>
          <a-button
            type="link"
            size="small"
            danger
            @click="handleCancel(record)"
            v-if="canCancel(record)"
          >
            取消
          </a-button>
          <a-button
            type="link"
            size="small"
            @click="handleUploadMinutes(record)"
            v-if="canUploadMinutes(record)"
          >
            {{ record.minutesFileName ? '更新纪要' : '上传纪要' }}
          </a-button>
        </template>
      </template>

      <template #emptyText>
        <span class="empty-text">暂无日期记录</span>
      </template>
    </a-table>

    <!-- 会议纪要上传弹窗 -->
    <a-modal
      v-model:open="minutesModalOpen"
      :title="minutesModalTitle"
      @ok="handleMinutesSubmit"
      @cancel="minutesModalOpen = false"
      width="500px"
    >
      <a-form layout="vertical" style="padding: 0 20px;">
        <a-form-item>
          <template #label>
            <span>选择文件</span>
          </template>
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            @remove="handleRemove"
          >
            <a-button type="primary"> <upload-outlined /> 选择文件 </a-button>
          </a-upload>
          <div class="upload-tips">
            <p class="tip-text">支持格式：PDF、Word（.doc/.docx）、Excel（.xls/.xlsx）、PPT（.ppt/.pptx）、TXT、ZIP、RAR</p>
            <p class="tip-text warning">文件大小限制：最大 10MB</p>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { getMeetingDateListApi, saveMinutesApi } from '../MeetingList.api';
import { getRoomListApi } from '../../room/Room.api';
import { useUserStore } from '/@/store/modules/user';
import { uploadImg } from '/@/api/sys/upload';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { getDictItemsByCode } from '/@/utils/dict/index';
import dayjs from 'dayjs';

const props = defineProps({
  meetingId: { type: String, required: true },
  meetingApprovalStatus: { type: String, default: '' },
  organizerId: { type: String, default: '' },
  meetingTitle: { type: String, default: '' },
  refreshKey: { type: Number, default: 0 },
});

const emit = defineEmits(['adjust', 'cancel']);

const dateList = ref<any[]>([]);
const loading = ref(false);
const roomList = ref<any[]>([]);

// 会议纪要弹窗
const minutesModalOpen = ref(false);
const minutesModalTitle = ref('上传会议纪要');
const currentRecord = ref<any>(null);
const fileList = ref<any[]>([]);

const dateColumns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, align: 'center', customRender: ({ index }: any) => index + 1 },
  { title: '会议日期', dataIndex: 'meetingDate', key: 'meetingDate', width: 120, align: 'center' },
  { title: '星期', dataIndex: 'weekDay', key: 'weekDay', width: 80, align: 'center' },
  { title: '时间段', key: 'timeRange', width: 150, align: 'center' },
  { title: '会议室', dataIndex: 'roomName', key: 'roomName', width: 150, align: 'center' },
  { title: '会议状态', key: 'meetingExecutionStatus', width: 100, align: 'center' },
  { title: '附件', key: 'attachment', width: 200, align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 100, align: 'center' },
];

const loadRooms = async () => {
  try {
    const res = await getRoomListApi({ pageNo: 1, pageSize: 100, status: '1' });
    roomList.value = res.records || res || [];
  } catch (error) {
    console.error('加载会议室列表失败', error);
  }
};

const getRoomName = (roomId: string) => {
  const room = roomList.value.find((r: any) => r.id === roomId);
  return room?.roomName || roomId || '-';
};

const getStatusColor = (status: string) => {
  const dictItems = getDictItemsByCode('meeting_execution_status');
  console.log('字典数据:', dictItems); // 调试日志
  if (dictItems && dictItems.length > 0) {
    const item = dictItems.find((d: any) => d.value === status);
    console.log('找到字典项:', item); // 调试日志
    if (item) {
      // 尝试不同的颜色字段名
      const color = item.itemColor || item.description || item.color || item.item_color;
      if (color) {
        console.log('使用颜色:', color); // 调试日志
        return color;
      }
    }
  }
  // 兜底颜色
  const map: Record<string, string> = { pending: 'orange', not_started: 'cyan', ongoing: 'green', completed: 'blue', cancelled: 'default', rejected: 'red' };
  return map[status] || 'default';
};

const getStatusText = (status: string) => {
  const dictItems = getDictItemsByCode('meeting_execution_status');
  if (dictItems && dictItems.length > 0) {
    const item = dictItems.find((d: any) => d.value === status);
    if (item && item.text) {
      return item.text;
    }
  }
  // 兜底文本
  const map: Record<string, string> = { pending: '待审批', not_started: '未开始', ongoing: '进行中', completed: '已结束', cancelled: '已取消', rejected: '已拒绝' };
  return map[status] || status || '-';
};

const formatDate = (date: any) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD');
};

const getWeekDayText = (weekDay: string) => {
  const map: Record<string, string> = { '1': '周日', '2': '周一', '3': '周二', '4': '周三', '5': '周四', '6': '周五', '7': '周六' };
  return map[weekDay] || weekDay || '-';
};

const loadDateList = async () => {
  if (!props.meetingId) return;
  loading.value = true;
  try {
    const res = await getMeetingDateListApi({ meetingId: props.meetingId });
    dateList.value = res.records || res || [];
  } catch (error) {
    console.error('加载日期列表失败', error);
  } finally {
    loading.value = false;
  }
};

const canAdjust = (record: any) => {
  const userStore = useUserStore();
  const currentUserId = userStore.getUserInfo?.id || '';
  const isOrganizer = props.organizerId === currentUserId;
  const isNotStarted = record.meetingExecutionStatus === 'not_started';
  if (!isOrganizer || !isNotStarted) return false;
  const now = dayjs();
  const meetingStart = dayjs(`${record.meetingDate} ${record.startTime}`);
  return now.isBefore(meetingStart);
};

const canCancel = (record: any) => {
  const userStore = useUserStore();
  const currentUserId = userStore.getUserInfo?.id || '';
  const isOrganizer = props.organizerId === currentUserId;
  const isNotStarted = record.meetingExecutionStatus === 'not_started';
  return isOrganizer && isNotStarted;
};

const canUploadMinutes = (record: any) => {
  const userStore = useUserStore();
  const currentUserId = userStore.getUserInfo?.id || '';
  const isOrganizer = props.organizerId === currentUserId;
  // 只有已结束的日期记录可以上传纪要
  return isOrganizer && record.meetingExecutionStatus === 'completed';
};

const handleAdjust = (record: any) => {
  emit('adjust', { ...record, meetingTitle: props.meetingTitle });
};

const handleCancel = (record: any) => {
  emit('cancel', record);
};

const handleUploadMinutes = (record: any) => {
  currentRecord.value = record;
  minutesModalTitle.value = record.minutesFileName ? '更新会议纪要' : '上传会议纪要';
  minutesModalOpen.value = true;
  fileList.value = [];
  // 如果已有纪要，显示现有文件
  if (record.minutesFileName) {
    fileList.value = [{
      uid: '-1',
      name: record.minutesFileName,
      status: 'done',
      url: record.minutesFileUrl,
      size: record.minutesFileSize || 0,
    }];
  }
};

const beforeUpload = (file: any) => {
  fileList.value = [file];
  return false;
};

const handleRemove = () => {
  fileList.value = [];
};

const handleMinutesSubmit = async () => {
  if (fileList.value.length === 0) {
    message.warning('请选择文件');
    return;
  }
  const file = fileList.value[0];
  let fileUrl = file.url || '';
  
  // 如果文件没有url，先上传到服务器
  const uploadFile = file.originFileObj || file;
  console.log('准备上传文件:', uploadFile, 'file对象:', file);
  if (!fileUrl && uploadFile) {
    try {
      const uploadRes = await uploadImg(
        { name: 'file', file: uploadFile, filename: file.name, data: { biz: 'meeting-minutes' } },
        () => {}
      );
      console.log('上传返回结果:', uploadRes);
      let relativePath = '';
      if (uploadRes && uploadRes.message) {
        relativePath = uploadRes.message;
      } else if (uploadRes && uploadRes.result) {
        relativePath = uploadRes.result;
      } else if (uploadRes && uploadRes.url) {
        relativePath = uploadRes.url;
      }
      // 转换为完整的文件访问URL
      if (relativePath) {
        fileUrl = getFileAccessHttpUrl(relativePath);
        console.log('转换后的文件URL:', fileUrl, '原始路径:', relativePath);
      }
    } catch (error) {
      console.error('文件上传失败', error);
      message.error('文件上传失败');
      return;
    }
  }
  
  const params = {
    id: currentRecord.value.id,
    minutesFileName: file.name,
    minutesFileUrl: fileUrl,
    minutesFileSize: file.size || 0,
    minutesUploadBy: '',
  };
  try {
    await saveMinutesApi(params);
    message.success(minutesModalTitle.value === '更新会议纪要' ? '更新成功' : '上传成功');
    minutesModalOpen.value = false;
    // 刷新列表
    loadDateList();
  } catch (error) {
    message.error('保存失败');
  }
};

const handleDownload = (record: any) => {
  if (record.minutesFileUrl) {
    const downloadUrl = getFileAccessHttpUrl(record.minutesFileUrl);
    window.open(downloadUrl, '_blank');
  } else {
    message.warning('文件路径不存在');
  }
};

watch(() => props.meetingId, (newVal) => {
  if (newVal) {
    loadDateList();
    loadRooms();
  }
}, { immediate: true });

watch(() => props.refreshKey, () => {
  loadDateList();
});
</script>

<style lang="less" scoped>
.meeting-date-list {
  padding: 10px;
  background-color: #fafafa;
}
.empty-text {
  color: #999;
}
.upload-tips {
  margin-top: 12px;
  padding: 10px 12px;
  background-color: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
  
  .tip-text {
    margin: 0;
    font-size: 13px;
    color: #666;
    line-height: 1.8;
    
    &.warning {
      color: #ff4d4f;
      font-weight: 500;
    }
  }
}
</style>
