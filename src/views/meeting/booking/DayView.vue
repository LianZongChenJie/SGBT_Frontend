<template>
  <div class="day-view">
    <table class="day-table">
      <thead>
        <tr>
          <th class="room-header">会议室名称</th>
          <th v-for="hour in timeHours" :key="hour" :colspan="2">
            {{ hour }}:00
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="room in roomList" :key="room.id" :class="{ 'locked-room': room.status === '0' }">
          <td class="room-name-cell">
            {{ room.roomName }}
            <span v-if="room.status === '0'" class="lock-tag">锁定</span>
          </td>
          <td
            v-for="slot in timeSlots"
            :key="slot.time"
            class="time-cell"
            :class="getCellClass(room.id, slot.time)"
            @click="room.status !== '0' && !isSlotDisabled(slot.time, room) && handleCellClick(room, slot.time)"
          >
            <a-tooltip
              v-if="getMeetingsAtSlot(room.id, slot.time).length > 0"
              placement="top"
            >
              <template #title>
                <div v-for="(m, idx) in getMeetingsAtSlot(room.id, slot.time)" :key="idx" style="margin-bottom: 8px;">
                  <div>会议主题：{{ m.meetingTitle || '无主题' }}</div>
                  <div>预订时间：{{ m.startTime || '' }}-{{ m.endTime || '' }}</div>
                  <div>预订人：{{ m.organizerName || m.organizerId || '未知' }}</div>
                </div>
              </template>
              <div class="tooltip-trigger"></div>
            </a-tooltip>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="legend">
      <span class="legend-item"><span class="legend-icon meeting"></span> 会议</span>
      <span class="legend-item"><span class="legend-icon training"></span> 培训</span>
      <span class="legend-item"><span class="legend-icon reception"></span> 接待</span>
      <span class="legend-item"><span class="legend-icon expired"></span> 过期</span>
      <span class="legend-item"><span class="legend-icon locked"></span> 会议室锁定</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  currentDate: Object,
  roomList: Array,
  meetings: Array,
});

const emit = defineEmits(['select-time']);

const timeHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const timeSlots = computed(() => {
  const slots = [];
  for (let hour = 8; hour < 20; hour++) {
    slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, hour });
    slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, hour });
  }
  return slots;
});

const getMeetingsAtSlot = (roomId: string, time: string) => {
  if (!props.meetings) return [];
  const dateStr = props.currentDate.format('YYYY-MM-DD');
  return props.meetings.filter((m: any) => {
    if (m.roomId !== roomId) return false;
    const meetingDate = dayjs(m.meetingDate).format('YYYY-MM-DD');
    if (meetingDate !== dateStr) return false;
    const start = m.startTime?.substring(0, 5);
    const end = m.endTime?.substring(0, 5);
    return time >= start && time < end;
  });
};

const getMeetingAtSlot = (roomId: string, time: string) => {
  return getMeetingsAtSlot(roomId, time)[0] || null;
};

const isPastTime = (time: string) => {
  const today = dayjs().format('YYYY-MM-DD');
  const selectedDate = props.currentDate.format('YYYY-MM-DD');
  if (selectedDate < today) return true;
  if (selectedDate > today) return false;
  // 今天：比较时间
  const now = dayjs();
  const slotTime = dayjs(`${today} ${time}`);
  return slotTime.isBefore(now);
};

const getCellClass = (roomId: string, time: string) => {
  const meeting = getMeetingAtSlot(roomId, time);
  if (!meeting) {
    // 过去时间的单元格置为expired
    if (isPastTime(time)) {
      return 'expired';
    }
    return 'empty';
  }
  const typeMap: Record<string, string> = {
    meeting: 'meeting',
    training: 'training',
    reception: 'reception',
  };
  return typeMap[meeting.meetingType] || 'meeting';
};

const isSlotDisabled = (time: string, room: any) => {
  if (room?.status === '0') return true;
  return isPastTime(time);
};

const handleCellClick = (room: any, time: string) => {
  // 判断是否是过去时间或锁定，不允许点击预约
  if (isSlotDisabled(time, room)) {
    return;
  }

  const [hour, minute] = time.split(':');
  const endHour = parseInt(hour) + 1;
  const endTime = `${endHour.toString().padStart(2, '0')}:${minute}`;
  emit('select-time', {
    roomId: room.id,
    roomName: room.roomName,
    date: props.currentDate.format('YYYY-MM-DD'),
    startTime: time,
    endTime,
  });
};
</script>

<style lang="less" scoped>
.day-view {
  .day-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th, td {
      border: 1px solid #e8e8e8;
      text-align: center;
    }

    .room-header {
      width: 120px;
      background-color: #fafafa;
      font-weight: 500;
      padding: 8px;
    }

    th {
      background-color: #fafafa;
      padding: 8px 4px;
      font-size: 12px;
    }

    .room-name-cell {
      padding: 12px 8px;
      font-weight: 500;
      background-color: #fafafa;
    }

    .time-cell {
      height: 50px;
      cursor: pointer;
      min-width: 30px;

      &:hover {
        opacity: 0.8;
      }

      &.empty {
        background-color: #fff;
      }

      &.meeting {
        background-color: #52c41a;
      }

      &.training {
        background-color: #1890ff;
      }

      &.reception {
        background-color: #eb2f96;
      }

      &.expired {
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
      }

      .locked {
        background-color: #f5f5f5;
      }
    
      .tooltip-trigger {
        width: 100%;
        height: 100%;
      }
    }
    
    .locked-room {
      .room-name-cell {
        color: #999;
        background-color: #f0f0f0;
      }

      .time-cell {
        background-color: #f5f5f5;
      }
    }

    .lock-tag {
      display: inline-block;
      margin-left: 4px;
      padding: 0 4px;
      font-size: 10px;
      color: #fff;
      background-color: #999;
      border-radius: 2px;
      vertical-align: middle;
    }
  }

  .legend {
    margin-top: 12px;
    display: flex;
    gap: 16px;
    padding: 8px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;

      .legend-icon {
        width: 16px;
        height: 16px;
        border-radius: 2px;

        &.meeting {
          background-color: #52c41a;
        }

        &.training {
          background-color: #1890ff;
        }

        &.reception {
          background-color: #eb2f96;
        }

        &.expired {
          background-color: #bfbfbf;
        }

        &.locked {
          background-color: #d9d9d9;
        }
      }
    }
  }
}
</style>
