<template>
  <div class="energy-carbon-management-main-box">
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
        <BoilerEnergyCarbonConversion
          v-if="module.title === BOILER_CARBON_EMISSION_TITLE"
          :ref="setModuleRef(module.title)"
        />
        <BoilerSteamOutput v-else-if="module.title === BOILER_STEAM_OUTPUT_TITLE" :ref="setModuleRef(module.title)" />
        <WaterTreatmentProduction
          v-else-if="module.title === WATER_TREATMENT_TITLE"
          :ref="setModuleRef(module.title)"
          :period="activePeriodMap[WATER_TREATMENT_TITLE]"
        />
        <PhotovoltaicEnergy
          v-else-if="module.title === PHOTOVOLTAIC_TITLE"
          :ref="setModuleRef(module.title)"
          :period="activePeriodMap[PHOTOVOLTAIC_TITLE]"
        />
        <ProductionData
          v-else-if="module.title === PRODUCTION_DATA_TITLE"
          :ref="setModuleRef(module.title)"
          :period="activePeriodMap[PRODUCTION_DATA_TITLE]"
        />
        <BoilerWaterSteamConsumption
          v-else-if="module.title === BOILER_WATER_STEAM_CONSUMPTION_TITLE"
          :ref="setModuleRef(module.title)"
          :period="activePeriodMap[BOILER_WATER_STEAM_CONSUMPTION_TITLE]"
        />
        <div v-else class="module-content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import BoilerEnergyCarbonConversion from './components/BoilerEnergyCarbonConversion.vue';
  import BoilerSteamOutput from './components/BoilerSteamOutput.vue';
  import WaterTreatmentProduction from './components/WaterTreatmentProduction.vue';
  import PhotovoltaicEnergy from './components/PhotovoltaicEnergy.vue';
  import ProductionData from './components/ProductionData.vue';
  import BoilerWaterSteamConsumption from './components/BoilerWaterSteamConsumption.vue';

  interface ModuleItem {
    title: string;
  }

  /** 子组件统一对外暴露 loadData 用于重新拉取接口 */
  interface RefreshableModule {
    loadData: () => Promise<void> | void;
  }

  const BOILER_CARBON_EMISSION_TITLE = '锅炉能碳指标（锅炉能耗转换碳排放量）';
  const BOILER_STEAM_OUTPUT_TITLE = '锅炉能碳指标（蒸汽产量）';
  const WATER_TREATMENT_TITLE = '水处理生产指标';
  const REUSED_PREHEAT_STEAM_TITLE = '再利用能源指标（园区累计预热蒸汽总量）';
  const REUSED_WASTE_HEAT_STEAM_TITLE = '再利用能源指标（余热蒸汽量）';
  const PHOTOVOLTAIC_TITLE = '光伏能源';
  const PRODUCTION_DATA_TITLE = '生产数据';
  const BOILER_WATER_STEAM_CONSUMPTION_TITLE = '锅炉的水、汽耗数据';

  type PeriodType = '本周' | '本月' | '本年';

  const periodOptions: PeriodType[] = ['本周', '本月', '本年'];
  const periodModules: string[] = [
    WATER_TREATMENT_TITLE,
    PHOTOVOLTAIC_TITLE,
    PRODUCTION_DATA_TITLE,
    BOILER_WATER_STEAM_CONSUMPTION_TITLE,
  ];
  const activePeriodMap = reactive<Record<string, PeriodType>>({
    [WATER_TREATMENT_TITLE]: '本周',
    [PHOTOVOLTAIC_TITLE]: '本周',
    [PRODUCTION_DATA_TITLE]: '本周',
    [BOILER_WATER_STEAM_CONSUMPTION_TITLE]: '本周',
  });

  const moduleList: ModuleItem[] = [
    { title: BOILER_CARBON_EMISSION_TITLE },
    { title: BOILER_STEAM_OUTPUT_TITLE },
    { title: WATER_TREATMENT_TITLE },
    { title: REUSED_PREHEAT_STEAM_TITLE },
    { title: REUSED_WASTE_HEAT_STEAM_TITLE },
    { title: PHOTOVOLTAIC_TITLE },
    { title: PRODUCTION_DATA_TITLE },
    { title: BOILER_WATER_STEAM_CONSUMPTION_TITLE },
  ];

  /** 已接入接口、支持刷新的模块 */
  const refreshModules: string[] = [BOILER_CARBON_EMISSION_TITLE, BOILER_STEAM_OUTPUT_TITLE];

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
      console.error('[能碳管理] 刷新失败：', title, error);
      createMessage.error('刷新失败，请稍后重试');
    } finally {
      refreshingMap[title] = false;
    }
  }
</script>

<style scoped lang="less">
  .energy-carbon-management-main-box {
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

      @keyframes module-refresh-spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      .module-content {
        min-height: 300px;
      }
    }
  }
</style>
