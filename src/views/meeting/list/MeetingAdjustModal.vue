<template>
  <a-modal
    v-model:open="open"
    title="会议调整"
    width="500px"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
      <a-form-item label="会议室名称" name="roomId">
        <a-select v-model:value="formState.roomId" placeholder="请选择会议室">
          <a-select-option v-for="room in roomList" :key="room.id" :value="room.id">
            {{ room.roomName }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="会议日期" name="meetingDate">
        <a-date-picker
          v-model:value="formState.meetingDate"
          valueFormat="YYYY-MM-DD"
          placeholder="请选择会议日期"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="会议时间" name="timeRange" :rules="[{ required: true, message: '请选择会议时间' }]">
        <a-row :gutter="8">
          <a-col :span="12">
            <a-time-picker
              v-model:value="formState.startTime"
              format="HH:mm"
              valueFormat="HH:mm"
              :minute-step="30"
              placeholder="开始时间"
              style="width: 100%"
            />
          </a-col>
          <a-col :span="12">
            <a-time-picker
              v-model:value="formState.endTime"
              format="HH:mm"
              valueFormat="HH:mm"
              :minute-step="30"
              placeholder="结束时间"
              style="width: 100%"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <div class="modal-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { adjustMeetingApi } from './MeetingList.api';
import { getRoomListApi } from '../room/Room.api';

const open = ref(false);
const formRef = ref();
const submitLoading = ref(false);
const roomList = ref<any[]>([]);
const emit = defineEmits(['reload']);

const formState = reactive<any>({
  meetingId: '',
  roomId: undefined,
  meetingDate: undefined,
  startTime: undefined,
  endTime: undefined,
});

const rules = {
  roomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
  meetingDate: [{ required: true, message: '请选择会议日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
};

const loadRooms = async () => {
  try {
    const res = await getRoomListApi({ pageNo: 1, pageSize: 100, status: '1' });
    roomList.value = res.records || res || [];
  } catch (error) {
    console.error('加载会议室失败', error);
  }
};

const showModal = async (record: any) => {
  await loadRooms();
  open.value = true;
  formState.meetingId = record.id;
  formState.roomId = record.roomId;
  formState.meetingDate = record.meetingDate;
  formState.startTime = record.startTime;
  formState.endTime = record.endTime;
};

const handleCancel = () => {
  open.value = false;
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    await adjustMeetingApi({
      meetingId: formState.meetingId,
      roomId: formState.roomId,
      meetingDate: formState.meetingDate,
      startTime: formState.startTime,
      endTime: formState.endTime,
    });
    message.success('调整成功');
    open.value = false;
    emit('reload');
  } catch (error) {
    console.error('调整失败', error);
  } finally {
    submitLoading.value = false;
  }
};

defineExpose({ showModal });
</script>

<style lang="less" scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
