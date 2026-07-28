<template>
  <div class="event-dashboard-main-box">
    <div class="left-echarts-box">
      <div class="left-echarts">
        <allSources-ofEvents-echarts />
      </div>
      <div class="left-echarts">
        <event-analysis-echarts />
      </div>
      <div class="left-echarts">
        <reported-incident-echarts />
      </div>
    </div>
    <div class="middle-echarts-box">
      <div class="map-box">
        <show-map-box />
      </div>
      <div class="middle-echarts">
        <average-service-processing-time-echarts />
      </div>
    </div>
    <div class="right-echarts-box">
      <div class="right-echarts">
        <in-progress-events-echarts />
      </div>
      <div class="right-echarts">
        <tenant-reporting-list />
      </div>
      <div class="right-echarts">
        <event-distribution-echarts />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="OrderList">
import AllSourcesOfEventsEcharts from './components/AllSourcesOfEventsEcharts.vue'
import EventAnalysisEcharts from './components/EventAnalysisEcharts.vue'
import ReportedIncidentEcharts from './components/ReportedIncidentEcharts.vue'
import InProgressEventsEcharts from './components/InProgressEventsEcharts.vue'
import TenantReportingList from './components/TenantReportingList.vue'
import EventDistributionEcharts from './components/EventDistributionEcharts.vue'
import AverageServiceProcessingTimeEcharts from './components/AverageServiceProcessingTimeEcharts.vue'
import ShowMapBox from './components/ShowMapBox.vue'

</script>

<style lang="less" scoped>
.event-dashboard-main-box{
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #fff;

  .left-echarts-box,.right-echarts-box {
    width: 27%;
    height: 100%;

    .left-echarts,.right-echarts{
      width: 100%;
      height: 33%;
    }
  }

  .middle-echarts-box{
    width: 44%;
    height: 100%;
    .map-box{
      height: 66%;
      width: 100%;
    }
    .middle-echarts{
      height: 34%;
      width: 100%;
    }
  }
}

</style>