<template>
  <div class="monitoring-source-main-box">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs" :destroyInactiveTabPane="true">
      <a-tab-pane key="1" tab="燃气">
        <gas />
      </a-tab-pane>
      <a-tab-pane key="2" tab="氢气">
        <hydrogen />
      </a-tab-pane>
      <a-tab-pane key="3" tab="二楼电表">
        <eldb />
      </a-tab-pane>
      <a-tab-pane key="4" tab="雨水处理器">
        <ysclq />
      </a-tab-pane>
      <a-tab-pane key="5" tab="1#锅炉">
        <gl1 />
      </a-tab-pane>
      <a-tab-pane key="6" tab="2#锅炉">
        <gl2 />
      </a-tab-pane>
      <a-tab-pane key="7" tab="3#锅炉">
        <gl3 />
      </a-tab-pane>
      <a-tab-pane key="8" tab="锅炉辅机">
        <glfj />
      </a-tab-pane>
      <a-tab-pane key="9" tab="北方稀土水处理">
        <bfxtscl />
      </a-tab-pane>
      <a-tab-pane key="10" tab="零氮">
        <ld />
      </a-tab-pane>
      <a-tab-pane key="11" tab="掺氢-混气">
        <cqhq />
      </a-tab-pane>
      <a-tab-pane key="12" tab="掺氢氢气减压撬">
        <cqqqjyq />
      </a-tab-pane>
      <a-tab-pane key="13" tab="光伏">
        <gf />
      </a-tab-pane>
      <a-tab-pane key="14" tab="光热系统主机">
        <grxtzj />
      </a-tab-pane>
      <a-tab-pane key="15" tab="cems">
        <bems />
      </a-tab-pane>
      <a-tab-pane key="16" tab="能源站">
        <nyz />
      </a-tab-pane>
      <!--<a-tab-pane key="11" tab="冷源监控与分析">
        <lengyuan />
      </a-tab-pane>
      <a-tab-pane key="2" tab="空调机组">
        <MyTopoComponents :path="'kongTiao.json'" :categoryId="'16'" :deviceList="kongTiaoDeviceList" />
      </a-tab-pane>
      <a-tab-pane key="3" tab="排风机">
        <listComponents :categoryId="'6'" />
      </a-tab-pane>
      <a-tab-pane key="4" tab="集水坑">
        <listComponents :categoryId="'8'" />
      </a-tab-pane>
      <a-tab-pane key="5" tab="热风幕">
        <listComponents :categoryId="'7'" />
      </a-tab-pane>
      <a-tab-pane key="6" tab="热风幕">
        <listComponents :categoryId="'7'" />
      </a-tab-pane>
      <a-tab-pane key="7" tab="空气质量">
        <listComponents :categoryId="'9'" />
      </a-tab-pane>
      <a-tab-pane key="8" tab="风机盘管">
        <listComponents :categoryId="'10'" />
      </a-tab-pane>-->

      <!-- <a-tab-pane key="2" tab="环境监控与分析">
        <EnvironmentalMonitoring />
      </a-tab-pane>
      <a-tab-pane key="3" tab="变配电运行监控">
        <substationAndDistribution />
      </a-tab-pane>
      <a-tab-pane key="4" tab="照明监控">
        模式化
      </a-tab-pane>
      <a-tab-pane key="5" tab="给排水">
        <WaterSupplyAndDrainage />
      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import SubstationAndDistribution from './components/SubstationAndDistribution.vue';
  import ColdSourceMonitoring from './components/ColdSourceMonitoring.vue';
  // import EnvironmentalMonitoring from './components/EnvironmentalMonitoring.vue'
  import WaterSupplyAndDrainage from './components/WaterSupplyAndDrainage.vue';
  import lengyuan from './components/lengyuan.vue';
  import gas from './components/gas.vue';
  import hydrogen from './components/hydrogen.vue';
  import bems from './components/bems.vue';
  import bfxtscl from './components/bfxtscl.vue';
  import cqhq from './components/cqhq.vue';
  import cqqqjyq from './components/cqqqjyq.vue';
  import eldb from './components/eldb.vue';
  import gf from './components/gf.vue';
  import gl1 from './components/gl1.vue';
  import gl2 from './components/gl2.vue';
  import gl3 from './components/gl3.vue';
  import glfj from './components/glfj.vue';
  import grxtzj from './components/grxtzj.vue';
  import ld from './components/ld.vue';
  import nyz from './components/nyz.vue';
  import ysclq from './components/ysclq.vue';
  import MyTopoComponents from './components/MyTopoComponents.vue';
  import listComponents from './components/listComponents.vue';
  import { ref } from 'vue';

  const activeKey = ref('1');
  const kongTiaoDeviceList = [
    {
      name: '操作模式',
      attributeCode: 'MODE',
    },
    {
      name: '系统启停',
      attributeCode: 'SYSENA',
    },
    {
      name: '设定温度',
      attributeCode: 'TSP',
    },
    {
      name: '季节模式',
      attributeCode: 'SEASON',
    },
    {
      name: '水阀冬季最小开度',
      attributeCode: 'VLVMIN',
    },
    {
      name: '防冻状态',
      attributeCode: 'LOWT',
    },
    {
      name: '送风温度',
      attributeCode: 'SAT',
    },
    {
      name: '新风阀反馈',
      attributeCode: 'OADS',
    },
    {
      name: '新风阀开关',
      attributeCode: 'OADC',
    },
    {
      name: '水阀反馈',
      attributeCode: 'VLVFB',
    },
    {
      name: '水阀调节',
      attributeCode: 'VLVA',
    },
    {
      name: '送风机运行状态',
      attributeCode: 'SFS',
    },
    {
      name: '送风机故障状态',
      attributeCode: 'SFF',
    },
    {
      name: '送风机手自动状态',
      attributeCode: 'SFAM',
    },
    {
      name: '送风机压差状态',
      attributeCode: 'SFDP',
    },
    {
      name: '送风机启停',
      attributeCode: 'SFC',
    },
    {
      name: '回风阀反馈',
      attributeCode: 'RADS',
    },
    {
      name: '回风阀调节',
      attributeCode: 'RADC',
    },
    {
      name: '设定湿度',
      attributeCode: 'HSP',
    },
    {
      name: '回风温度',
      attributeCode: 'RAT',
    },
    {
      name: '回风湿度',
      attributeCode: 'RAH',
    },
    {
      name: '送风湿度',
      attributeCode: 'SAH',
    },
    {
      name: '袋式过滤网',
      attributeCode: 'FILT',
    },
    {
      name: '静电除尘运行状态',
      attributeCode: 'JDS',
    },
    {
      name: '静电除尘手自动状态',
      attributeCode: 'JDAM',
    },
    {
      name: '加湿阀运行状态',
      attributeCode: 'HUMS',
    },
    {
      name: '加湿阀手自动状态',
      attributeCode: 'HUMAM',
    },
    {
      name: '排风湿度',
      attributeCode: 'EAT',
    },
    {
      name: '排风机运行时间',
      attributeCode: 'EFBT',
    },
    {
      name: '排风机运行状态',
      attributeCode: 'EFS',
    },
    {
      name: '排风机故障状态',
      attributeCode: 'EFF',
    },
    {
      name: '排风机手自动状态',
      attributeCode: 'EFAM',
    },
    {
      name: '排风机压差状态',
      attributeCode: 'EFDP',
    },
    {
      name: '排风机启停',
      attributeCode: 'EFC',
    },
    {
      name: '排风机频率设定',
      attributeCode: 'EFVFDA',
    },
    {
      name: '排风机频率反馈',
      attributeCode: 'EFVFDFB',
    },
    {
      name: '新风湿度',
      attributeCode: 'OAT',
    },
    {
      name: '热转轮启停控制',
      attributeCode: 'RZLC',
    },
    {
      name: '热转轮故障状态',
      attributeCode: 'RZLF',
    },
    {
      name: '热转轮手自动状态',
      attributeCode: 'RZLAM',
    },
    {
      name: '中效滤网状态',
      attributeCode: 'RFILT',
    },
  ];
</script>

<style scoped lang="less">
  :deep(.ant-tabs-nav-list) {
  }
</style>
