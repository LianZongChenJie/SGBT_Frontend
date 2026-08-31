<template>
  <div class="booking-main-box">
    <div class="booking-header">
      <div class="header-left">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="week">周</a-radio-button>
          <a-radio-button value="day">日</a-radio-button>
        </a-radio-group>
      </div>
      <div class="header-center">
        <a-button @click="handlePrev">
          <LeftOutlined />
        </a-button>
        <span class="current-date">{{ currentDateText }}</span>
        <a-button @click="handleNext">
          <RightOutlined />
        </a-button>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleAdd">预约</a-button>
      </div>
    </div>

    <div class="booking-content">
      <WeekView
        v-if="viewMode === 'week'"
        :current-date="currentDate"
        :room-list="roomList"
        :meetings="meetingList"
        @select-time="handleSelectTime"
      />
      <DayView
        v-else
        :current-date="currentDate"
        :room-list="roomList"
        :meetings="meetingList"
        @select-time="handleSelectTime"
      />
    </div>

    <BookingModal
      ref="bookingModalRef"
      :reload="loadMeetings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted, watch } from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import BookingModal from './BookingModal.vue';
import WeekView from './WeekView.vue';
import DayView from './DayView.vue';
import { getRoomListApi } from '../room/Room.api';
import { getRoomOccupancyApi } from './Booking.api';
import dayjs from 'dayjs';

const viewMode = ref('week');
const currentDate = ref(dayjs());
const roomList = ref<any[]>([]);
const meetingList = ref<any[]>([]);
const bookingModalRef = ref();

const currentDateText = computed(() => {
  if (viewMode.value === 'week') {
    const start = currentDate.value.startOf('week').add(1, 'day').format('YYYY年M月D日');
    const end = currentDate.value.endOf('week').add(1, 'day').format('M月D日');
    return `${start} – ${end}`;
  }
  return currentDate.value.format('YYYY年M月D日');
});

onMounted(() => {
  loadRooms();
});

watch([currentDate, viewMode], () => {
  loadMeetings();
});

const loadRooms = async () => {
  try {
    const res = await getRoomListApi({ pageNo: 1, pageSize: 100 });
    roomList.value = res.records || res || [];
    await loadMeetings();
  } catch (error) {
    message.error('加载会议室列表失败');
    console.error(error);
  }
};

const loadMeetings = async () => {
  if (roomList.value.length === 0) return;
  try {
    let startDate, endDate;
    if (viewMode.value === 'week') {
      startDate = currentDate.value.startOf('week').add(1, 'day').format('YYYY-MM-DD');
      endDate = currentDate.value.endOf('week').add(1, 'day').format('YYYY-MM-DD');
    } else {
      startDate = currentDate.value.format('YYYY-MM-DD');
      endDate = currentDate.value.format('YYYY-MM-DD');
    }
    // 加载所有会议室的会议数据
    const allMeetings: any[] = [];
    for (const room of roomList.value) {
      try {
        const res = await getRoomOccupancyApi({
          roomId: room.id,
          startDate,
          endDate,
        });
        const meetings = res.result || res || [];
        meetings.forEach((m: any) => {
          m.roomId = room.id;
          m.roomName = room.roomName;
        });
        allMeetings.push(...meetings);
      } catch (e) {
        // ignore error for single room
      }
    }
    meetingList.value = allMeetings;
  } catch (error) {
    message.error('加载会议列表失败');
    console.error(error);
  }
};

const handlePrev = () => {
  if (viewMode.value === 'week') {
    currentDate.value = currentDate.value.subtract(1, 'week');
  } else {
    currentDate.value = currentDate.value.subtract(1, 'day');
  }
};

const handleNext = () => {
  if (viewMode.value === 'week') {
    currentDate.value = currentDate.value.add(1, 'week');
  } else {
    currentDate.value = currentDate.value.add(1, 'day');
  }
};

const handleAdd = () => {
  if (roomList.value.length === 0) {
    message.warning('暂无可用会议室');
    return;
  }
  bookingModalRef.value.showModal({
    roomId: roomList.value[0].id,
    roomName: roomList.value[0].roomName,
  });
};

const handleSelectTime = (data: any) => {
  bookingModalRef.value.showModal({
    roomId: data.roomId,
    roomName: data.roomName,
    meetingDate: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
  });
};
</script>

<style lang="less" scoped>
.booking-main-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .booking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    border-bottom: 1px solid #f0f0f0;

    .header-left {
      display: flex;
      align-items: center;
    }

    .header-center {
      display: flex;
      align-items: center;

      .current-date {
        margin: 0 16px;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
    }
  }

  .booking-content {
    flex: 1;
    overflow: auto;
    padding: 16px;
  }
}
</style>
