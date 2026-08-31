<template>
  <div class="home-page-main-box">
    <div class="top-box">
      <div class="left-box">
        <EventCenter />
      </div>
      <div class="middle-box">
        <div class="energy-consumption-statistics">
          <EnergyConsumptionStatistics />
        </div>
        <div class="environmental-quality">
          <EnvironmentalQuality />
        </div>
      </div>
      <div class="right-box">
        <AlarmCenter />
      </div>
    </div>
    <div class="bottom-box">
      <WeatherAndEnergy />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EventCenter from './components/EventCenter.vue';
import EnergyConsumptionStatistics from './components/EnergyConsumptionStatistics.vue';
import EnvironmentalQuality from './components/EnvironmentalQuality.vue';
import AlarmCenter from './components/AlarmCenter.vue';
import WeatherAndEnergy from './components/WeatherAndEnergy.vue';
</script>

<style lang="less" scoped>
.home-page-main-box {
  width: 100%;
  height: 110vh;
  padding: 0 14px;

  .top-box {
    height: 68.5%;
    width: 100%;
    display: flex;
    justify-content: space-between;

    .left-box,
    .middle-box,
    .right-box {
      height: 100%;
      width: 32%;
    }

    .middle-box {
      .energy-consumption-statistics,
      .environmental-quality {
        height: 48.5%;
        width: 100%;
        background-color: #fff;
        border-radius: 10px;
      }

      .environmental-quality {
        margin-top: 3%;
      }
    }

    .right-box {
      background-color: #fff;
      border-radius: 10px;
    }
  }
  .bottom-box {
    height: 30%;
    width: 100%;
    margin-top: 1%;
  }
}
</style>