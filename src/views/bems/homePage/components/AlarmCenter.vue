<template>
  <div class="alarm-center-main-box">
    <div class="title">
      设备运行告警中心
      <div class="my-tabs-box">
        <MyTabs :handleSwitchDate="handleSwitchDate" />
      </div>
    </div>
    <div class="device-list-box">
      <MyDeviceList />
    </div>
    <div class="device-status-box">
      <div class="tabs-box">
        <a-tabs
          v-model:activeKey="activeKey"
          :centered="true"
          :tabBarGutter="100"
          @change="handleChangeTabs"
        >
          <a-tab-pane
            :key="1"
            :tab="'已响应' + '(' + deviceStatusData.alreadyResponded.length + ')'"
          >
          </a-tab-pane>
          <a-tab-pane
            :key="2"
            :tab="'未响应' + '(' + deviceStatusData.notResponding.length + ')'"
          >
          </a-tab-pane>
          <a-tab-pane
            :key="3"
            :tab="'自回复' + '(' + deviceStatusData.selfRecovery.length + ')'"
          >
          </a-tab-pane>
        </a-tabs>
      </div>
      <div class="table-box">
        <a-table
          :columns="columns"
          :data-source="tableDataSourse"
          :pagination="false"
          bordered
          :scroll="{ y: getHeightByClass() - 55 }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import MyTabs from './MyTabs.vue';
import MyDeviceList from './MyDeviceList.vue';

// tabs
const activeKey = ref(1);

// 表格列配置
const columns = ref([
  {
    title: '编号',
    dataIndex: 'code',
    key: 'code',
    align: 'center', // 列内容居中
    width: '15%',
  },
  {
    title: '设备',
    dataIndex: 'name',
    key: 'name',
    align: 'center', // 列内容居中
  },
  {
    title: '报警点位',
    dataIndex: 'position',
    key: 'position',
    align: 'center', // 列内容居中
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center', // 列内容居中
    width: '15%',
  },
]);

// 设备状态数据
const deviceStatusData = ref({
  alreadyResponded: [
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
  ],
  notResponding: [
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
  ],
  selfRecovery: [
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
  ],
});

const tableDataSourse: any = ref([]);

// 切换时间
const handleSwitchDate = (type) => {
  console.log('handleSwitchDate----------------->', type);
};

// 切换tabs
const handleChangeTabs = (activeKey) => {
  if (activeKey === 1) {
    tableDataSourse.value = [...deviceStatusData.value.alreadyResponded];
  } else if (activeKey === 2) {
    tableDataSourse.value = [...deviceStatusData.value.notResponding];
  } else {
    tableDataSourse.value = [...deviceStatusData.value.selfRecovery];
  }
};

const getHeightByClass = () => {
  const elements = document.getElementsByClassName('table-box');
  if (elements.length > 0) {
    const height = elements[0].offsetHeight;
    console.log('DIV高度:', height + 'px');
    return height;
  }
  return 0;
};

onMounted(() => {
  tableDataSourse.value = [...deviceStatusData.value.alreadyResponded];
});
</script>

<style lang="less" scoped>
.alarm-center-main-box {
  height: 100%;
  width: 100%;
  padding: 6px 12px;

  .title {
    height: 30px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .my-tabs-box {
      height: 90%;
      width: 30%;
    }
  }

  .device-list-box,
  .device-status-box {
    margin-top: 10px;
    height: calc(50% - 30px);
    width: 100%;
  }

  .device-status-box {
    .tabs-box {
      height: 50px;
    }

    .table-box {
      height: calc(100% - 50px);
    }
  }
}
</style>