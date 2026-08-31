<template>
  <div class="energy-consumption-statistics-main-box">
    <div class="title">
      能耗统计
      <div class="my-tabs-box">
        <MyTabs :handleSwitchDate="handleSwitchDate" />
      </div>
    </div>
    <div class="info-box">
      <div class="info-item" v-for="(item,index) in infoData" :key="index">
        <div class="icon-box">
          <div class="icon-style" :id="(item.name === '水(m³)') ? 'waterIcon' : (item.name === '电(kWh)' ? 'electricityIcon' : (item.name === '冷热量(Gj)' ? 'hotIcon' : 'gasIcon'))">

          </div>
        </div>
        <div class="info">
          <div>{{ item.name }}</div>
          <div>{{ item.data }}</div>
        </div>
        <div class="info">
          <div>同比</div>
          <div>{{ item.tong }}<FallOutlined v-if="true" style="color: #1edf1e;" /><RiseOutlined v-else style="color: red;"/></div>
        </div>
        <div class="info">
          <div>环比</div>
          <div>{{ item.huan }} <FallOutlined v-if="true" style="color: #1edf1e;" /><RiseOutlined v-else style="color: red;"/></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyTabs from './MyTabs.vue';
import { FallOutlined, RiseOutlined  } from '@ant-design/icons-vue';

const infoData = ref([
  {
    name: '水(m³)',
    data: '33',
    tong: '0.00',
    huan: '-53.85'
  },
  {
    name: '电(kWh)',
    data: '22540',
    tong: '0.00',
    huan: '-57.05'
  },
  {
    name: '冷热量(Gj)',
    data: '28',
    tong: '0.00',
    huan: '-54.35'
  },
  {
    name: '燃气(m³)',
    data: '156',
    tong: '0.00',
    huan: '-53.84'
  },
])
// 切换时间
const handleSwitchDate = (type) => {
  console.log('handleSwitchDate----------------->', type);
};
</script>

<style lang="less" scoped>
.energy-consumption-statistics-main-box {
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

  .info-box {
    height: calc(100% - 30px);
    width: 100%;
    padding: 12px 24px;

    .info-item {
      display: flex;
      height: 25%;
      width: 100%;

      > div {
        width: 25%;
        height: 100%;
      }
      .icon-box {
        display: flex;
        justify-content: center;
        align-items: center;

        .icon-style {
          height: 90%;
          width: 56%;
          background-size: 100% 100%;
        }

        #waterIcon {
          background-image: url('@/assets/images/waterIcon.png');
        }
        #electricityIcon {
          background-image: url('@/assets/images/electricityIcon.png');
        }
        #hotIcon {
          background-image: url('@/assets/images/hotIcon.png');
        }
        #gasIcon {
          background-image: url('@/assets/images/gasIcon.png');
        }
      }

      .info {
        display: flex;
        align-content: center;
        flex-wrap: wrap;
        > div {
          display: flex;
          align-items: center;
          font-size: 18px;
          width: 100%;
          height: 40%;
        }
      }
    }
  }
}
</style>