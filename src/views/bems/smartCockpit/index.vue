<template>
  <div class="smart-cockpit-main-box">
    <div class="module-grid">
      <div v-for="module in moduleList" :key="module.title" class="module-card">
        <div class="module-title">
          <span>{{ module.title }}</span>
          <div class="module-title__extra">
            <div v-if="periodModules.includes(module.title)" class="period-tabs">
              <span
                v-for="period in periodOptions"
                :key="period"
                class="period-chip"
                :class="{ 'period-chip--active': period === activePeriodMap[module.title] }"
                @click="activePeriodMap[module.title] = period"
              >
                {{ period }}
              </span>
            </div>
            <a-tooltip v-if="refreshModules.includes(module.title)" title="刷新">
              <Icon
                class="refresh-icon"
                :class="{ 'refresh-icon--loading': refreshingMap[module.title] }"
                icon="ant-design:reload-outlined"
                :size="18"
                @click="handleRefresh(module.title)"
              />
            </a-tooltip>
          </div>
        </div>
        <ProductionData v-if="module.title === PRODUCTION_DATA_TITLE" :ref="setModuleRef(module.title)" />
        <EnergySupplyOverview v-else-if="module.title === ENERGY_SUPPLY_TITLE" :ref="setModuleRef(module.title)" />
        <CarbonFootprint v-else-if="module.title === CARBON_FOOTPRINT_TITLE" :ref="setModuleRef(module.title)" />
        <EnvironmentalMonitoring
          v-else-if="module.title === ENV_MONITOR_TITLE"
          :ref="setModuleRef(module.title)"
          :period="activePeriodMap[ENV_MONITOR_TITLE]"
        />
        <ProductionOverview
          v-else-if="module.title === PRODUCTION_OVERVIEW_TITLE"
          :ref="setModuleRef(module.title)"
          :period="activePeriodMap[PRODUCTION_OVERVIEW_TITLE]"
        />
        <AlarmList v-else-if="module.title === ALARM_LIST_TITLE" :ref="setModuleRef(module.title)" />
        <KeyEquipmentStatus v-else-if="module.title === KEY_EQUIPMENT_TITLE" :ref="setModuleRef(module.title)" />
        <div v-else class="module-content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import EnergySupplyOverview from './components/EnergySupplyOverview.vue';
  import CarbonFootprint from './components/CarbonFootprint.vue';
  import EnvironmentalMonitoring from './components/EnvironmentalMonitoring.vue';
  import ProductionOverview from './components/ProductionOverview.vue';
  import AlarmList from './components/AlarmList.vue';
  import ProductionData from './components/ProductionData.vue';
  import KeyEquipmentStatus from './components/KeyEquipmentStatus.vue';

  interface ModuleItem {
    title: string;
  }

  /** 子组件统一对外暴露 loadData 用于重新拉取接口 */
  interface RefreshableModule {
    loadData: () => Promise<void> | void;
  }

  const ENV_MONITOR_TITLE = '环境监测';
  const PRODUCTION_OVERVIEW_TITLE = '生产概况';
  const ALARM_LIST_TITLE = '报警列表';
  const PRODUCTION_DATA_TITLE = '生产数据';
  const KEY_EQUIPMENT_TITLE = '重点设备运行状况';
  const ENERGY_SUPPLY_TITLE = '供能概况';
  const CARBON_FOOTPRINT_TITLE = '碳足迹';

  type PeriodType = '本周' | '本月' | '本年';

  const periodOptions: PeriodType[] = ['本周', '本月', '本年'];
  const periodModules: string[] = [ENV_MONITOR_TITLE, PRODUCTION_OVERVIEW_TITLE];
  const activePeriodMap = reactive<Record<string, PeriodType>>({
    [ENV_MONITOR_TITLE]: '本周',
    [PRODUCTION_OVERVIEW_TITLE]: '本周',
  });

  const moduleList: ModuleItem[] = [
    { title: PRODUCTION_DATA_TITLE },
    { title: ENERGY_SUPPLY_TITLE },
    { title: CARBON_FOOTPRINT_TITLE },
    { title: ENV_MONITOR_TITLE },
    { title: PRODUCTION_OVERVIEW_TITLE },
    { title: KEY_EQUIPMENT_TITLE },
    { title: ALARM_LIST_TITLE },
  ];

  /** 右上角已有周期切换按钮的模块不再重复添加刷新按钮 */
  const refreshModules: string[] = [
    PRODUCTION_DATA_TITLE,
    ENERGY_SUPPLY_TITLE,
    CARBON_FOOTPRINT_TITLE,
    KEY_EQUIPMENT_TITLE,
    ALARM_LIST_TITLE,
  ];

  const refreshingMap = reactive<Record<string, boolean>>({});
  const moduleRefMap: Record<string, RefreshableModule | null> = {};
  const refSetterCache: Record<string, (el: unknown) => void> = {};

  /**
   * v-for 内部按模块名称收集子组件实例，避免数组型 ref 顺序不可控
   */
  function setModuleRef(title: string) {
    if (!refSetterCache[title]) {
      refSetterCache[title] = (el: unknown) => {
        moduleRefMap[title] = (el as RefreshableModule | null) || null;
      };
    }
    return refSetterCache[title];
  }

  const { createMessage } = useMessage();

  async function handleRefresh(title: string) {
    const instance = moduleRefMap[title];
    if (!instance?.loadData || refreshingMap[title]) return;

    refreshingMap[title] = true;
    try {
      await instance.loadData();
    } catch (error) {
      console.error('[智慧驾驶舱] 刷新失败：', title, error);
      createMessage.error('刷新失败，请稍后重试');
    } finally {
      refreshingMap[title] = false;
    }
  }
</script>

<style scoped lang="less">
  .smart-cockpit-main-box {
    margin: 16px;

    .module-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .module-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 16px 20px;

      .module-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 -20px 16px;
        padding: 0 20px 12px;
        border-bottom: 1px solid #edf2f7;
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .module-title__extra {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .refresh-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .refresh-icon:hover {
        color: #2563eb;
        background: rgba(37, 99, 235, 0.1);
      }

      .refresh-icon--loading {
        color: #2563eb;
        cursor: not-allowed;
        animation: module-refresh-spin 0.8s linear infinite;
      }

      @keyframes module-refresh-spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      .period-tabs {
        display: flex;
        gap: 10px;
      }

      .period-chip {
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: normal;
        color: #64748b;
        background: #f1f5f9;
        transition: all 0.2s ease;
        cursor: pointer;
        user-select: none;
      }

      .period-chip:hover {
        color: #1d4ed8;
        background: rgba(37, 99, 235, 0.08);
      }

      .period-chip--active {
        color: #0f172a;
        background: rgba(37, 99, 235, 0.12);
        box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.14);
      }

      .module-content {
        min-height: 300px;
      }
    }
  }
</style>
