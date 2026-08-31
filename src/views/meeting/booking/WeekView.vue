<template>
  <div class="week-view">
    <table class="week-table">
      <thead>
        <tr>
          <th class="room-header">会议室名称</th>
          <th v-for="day in weekDays" :key="day.fullDate" :class="{ today: day.isToday, 'has-meeting-day': hasMeetingOnDay(day.fullDate) }">
            <div class="day-cell">
              <div class="day-date">{{ day.date }}</div>
              <div class="day-week">{{ day.weekDay }}</div>
            </div>
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
            v-for="day in weekDays"
            :key="day.fullDate"
            class="time-slot-cell"
            :class="{ today: day.isToday }"
          >
            <div class="slot-row">
                <a-tooltip
                  v-for="period in ['am', 'pm']"
                  :key="period"
                  placement="top"
                >
                  <template #title>
                    <div v-for="(m, idx) in getMeetings(room.id, day.fullDate, period)" :key="idx" style="margin-bottom: 8px;">
                      <div>会议主题：{{ m.meetingTitle || '无主题' }}</div>
                      <div>预订时间：{{ m.startTime || '' }}-{{ m.endTime || '' }}</div>
                      <div>预订人：{{ m.organizerName || m.organizerId || '未知' }}</div>
                    </div>
                    <div v-if="getMeetings(room.id, day.fullDate, period).length === 0">{{ period === 'am' ? '上午' : '下午' }}</div>
                  </template>
                  <div
                    :class="['slot', period, getSlotStatus(room.id, day.fullDate, period), { 'past-slot': isSlotDisabled(day.fullDate, period, room), 'locked-slot': room.status === '0' }]"
                    @click="room.status !== '0' && !isSlotDisabled(day.fullDate, period, room) && handleSlotClick(room, day.fullDate, period)"
                  >
                    <span class="slot-label">{{ period === 'am' ? '上午' : '下午' }}</span>
                  </div>
                </a-tooltip>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="legend">
      <span class="legend-item"><span class="legend-icon has-meeting"></span> 有会议</span>
      <span class="legend-item"><span class="legend-icon no-meeting"></span> 无会议</span>
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

const weekDays = computed(() => {
  const start = props.currentDate.startOf('week').add(1, 'day');
  const days = [];
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  for (let i = 0; i < 7; i++) {
    const date = start.add(i, 'day');
    days.push({
      date: date.format('MM-DD'),
      fullDate: date.format('YYYY-MM-DD'),
      weekDay: weekDays[i],
      isToday: date.isSame(dayjs(), 'day'),
    });
  }
  return days;
});

const getMeetings = (roomId: string, date: string, period: string) => {
  if (!props.meetings) return [];
  const fullDate = dayjs(date).format('YYYY-MM-DD');
  return props.meetings.filter((m: any) => {
    if (m.roomId !== roomId) return false;
    const meetingDate = dayjs(m.meetingDate).format('YYYY-MM-DD');
    if (meetingDate !== fullDate) return false;
    const hour = parseInt(m.startTime?.split(':')[0] || '0');
    return period === 'am' ? hour < 12 : hour >= 12;
  });
};

const hasMeeting = (roomId: string, date: string, period: string) => {
  return getMeetings(roomId, date, period).length > 0;
};

const getSlotStatus = (roomId: string, date: string, period: string) => {
  return hasMeeting(roomId, date, period) ? 'has-meeting' : 'no-meeting';
};

// 判断时间段是否不可点击（过去时间或锁定）
const isSlotDisabled = (date: string, period: string, room: any) => {
  // 锁定会议室直接禁用
  if (room?.status === '0') return true;
  const fullDate = dayjs(date).format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');
  // 如果日期早于今天，整个时间段都禁用
  if (dayjs(fullDate).isBefore(today, 'day')) return true;
  // 如果日期晚于今天，不禁用
  if (dayjs(fullDate).isAfter(today, 'day')) return false;
  // 今天是当天，根据时间段判断
  const now = dayjs();
  const periodEndTime = period === 'am' ? dayjs(`${today} 12:00:00`) : dayjs(`${today} 23:59:59`);
  return now.isAfter(periodEndTime);
};

// 判断某天是否有会议（任意会议室）
const hasMeetingOnDay = (date: string) => {
  if (!props.meetings || props.meetings.length === 0) return false;
  const fullDate = dayjs(date).format('YYYY-MM-DD');
  return props.meetings.some((m: any) => {
    const meetingDate = m.meetingDate ? dayjs(m.meetingDate).format('YYYY-MM-DD') : '';
    return meetingDate === fullDate;
  });
};

const handleSlotClick = (room: any, date: string, period: string) => {
  if (isSlotDisabled(date, period, room)) {
    return;
  }
  // 判断是否是今天：今天需要根据当前时间智能计算，非今天直接按上午/下午默认值
  const isToday = dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  let startTime: string;
  if (isToday) {
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
    startTime = defaultStart.format('HH:mm');
  } else {
    startTime = period === 'am' ? '08:00' : '14:00';
  }
  const [h, m] = startTime.split(':');
  const endHour = parseInt(h) + 1;
  const endTime = `${endHour.toString().padStart(2, '0')}:${m}`;
  emit('select-time', {
    roomId: room.id,
    roomName: room.roomName,
    date: date,
    startTime,
    endTime,
  });
};
</script>

<style lang="less" scoped>
.week-view {
  .week-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th, td {
      border: 1px solid #e8e8e8;
      text-align: center;
      padding: 0;
    }

    .room-header {
      width: 120px;
      background-color: #fafafa;
      font-weight: 500;
    }

    th {
      background-color: #fafafa;
      padding: 8px;
    
      &.today {
        background-color: #e6f7ff;
      }
    
      &.has-meeting-day {
        background-color: #fff7e6;
      }
    
      .day-cell {
        .day-date {
          font-size: 14px;
          font-weight: 500;
        }
        .day-week {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .room-name-cell {
      padding: 12px 8px;
      font-weight: 500;
      background-color: #fafafa;
    }

    .time-slot-cell {
      &.today {
        background-color: #e6f7ff;
      }

      .slot-row {
        display: flex;
        height: 60px;

        .slot {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.8;
          }

          &.am {
            border-right: 1px solid #e8e8e8;
          }

          &.has-meeting {
            background-color: #52c41a !important;
            color: #fff !important;
          }

          &.no-meeting {
            background-color: #fff;
            color: #999;
          }

          &.past-slot {
            background-color: #bfbfbf;
            color: #fff;
            cursor: not-allowed;
            opacity: 0.6;
          }

          &.locked-slot {
            background-color: #d9d9d9;
            color: #999;
            cursor: not-allowed;
            opacity: 0.6;
          }

          .slot-label {
            font-size: 12px;
          }

          .slot-icon {
            font-size: 14px;
            font-weight: bold;
            margin-top: 2px;
          }
        }
      }

      .locked-room {
        .room-name-cell {
          color: #999;
          background-color: #f0f0f0;
        }

        .time-slot-cell {
          background-color: #f5f5f5;
        }
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

        &.has-meeting {
          background-color: #52c41a;
        }

        &.no-meeting {
          background-color: #fff;
          border: 1px solid #d9d9d9;
        }

        &.locked {
          background-color: #d9d9d9;
        }

        &.past-slot {
          background-color: #bfbfbf;
        }
      }
    }
  }
}
</style>
