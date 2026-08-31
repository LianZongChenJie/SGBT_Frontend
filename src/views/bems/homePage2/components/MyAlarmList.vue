<template>
  <div class="my-alarm-list">
    <div
      class="alarm-item"
      v-for="(item,index) in props.alarmList"
      :key="index"
    >
      <div
        class="alarm-title"
        :id="(item.status === '未处理') ? 'untreatedIcon' : (item.status === '处理中' ? 'processingIcon' : 'processedIcon')"
      >
        <div class="icon-box">
          <ProfileOutlined :style="{fontSize: '16px', color: '#fff',}" />
        </div>
        <div class="alarm-info">
          {{ item.info }}
        </div>
        <div class="alarm-status">
          {{ item.status }}
        </div>
      </div>
      <div class="base-info">
        <div>设备位置：{{ item.position }}</div>
      </div>
      <div class="base-info">
        <div>报单时间：{{ item.reportTime }}</div>
      </div>
      <div class="base-info">
        <div>要求完成时间：{{ item.finishTime }}</div>
      </div>
      <div class="base-info">
        <div>维修人员：{{ item.repairPerson }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ProfileOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  alarmList: {
    type: Array<any>,
    default: [
      {
        info: '空调KT-32设定温度过高',
        position: '歌剧院F4办公楼',
        reportTime: '2022-05-02 14:00:00',
        finishTime: '2022-05-05 14:00:00',
        repairPerson: '张三',
        status: '未处理',
      },
      {
        info: '空调机组KT-28堵塞告警',
        position: '歌剧院F4办公楼',
        reportTime: '2022-05-02 14:00:00',
        finishTime: '2022-05-05 14:00:00',
        repairPerson: '张三',
        status: '未处理',
      },
    ],
  },
});
</script>

<style lang="less" scoped>
.my-alarm-list {
  height: 100%;
  overflow: auto;
  .alarm-item {
    height: 140px;
    border: 1px solid rgb(207, 204, 204);
    margin-bottom: 10px;

    .alarm-title {
      padding: 0 12px;
      height: 40px;
      border-bottom: 1px solid rgb(207, 204, 204);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .icon-box {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 30px;
        width: 30px;
        background-color: #f19d59;
        border-radius: 30px;
      }

      .alarm-info {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        width: 68%;
        height: 100%;
      }

      .alarm-status {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 20%;
        height: 100%;
      }
    }

    #untreatedIcon {
      .icon-box {
        background-color: #d61414 !important;
      }
      .alarm-status {
        color: #d61414;
      }
    }
    #processingIcon {
      .icon-box {
        background-color: #f19d59;
      }
      .alarm-status {
        color: #f19d59;
      }
    }
    #processedIcon {
      .icon-box {
        background-color: #1ce036;
      }
      .alarm-status {
        color: #1ce036;
      }
    }

    .base-info {
      height: 25px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 0 12px;
    }
  }
}
  .my-alarm-list {
    overflow: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */
  }

  .my-alarm-list::-webkit-scrollbar {
    display: none; /* Chrome, Safari 和 Opera */
  }
</style>