<template>
  <div class="safety-environment-management-main-box">
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
            <template v-if="module.title === ENV_MONITOR_TWO_TITLE">
              <span class="extra-label">是否按天做平均</span>
              <a-switch v-model:checked="envMonitorTwoQuery.byDayAverage" size="small" />
              <a-range-picker
                v-model:value="envMonitorTwoDateRange"
                class="extra-range-picker"
                size="small"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :allow-clear="false"
              />
            </template>
          </div>
        </div>
        <EnvironmentalMonitoringOne
          v-if="module.title === ENV_MONITOR_ONE_TITLE"
          :period="activePeriodMap[ENV_MONITOR_ONE_TITLE]"
        />
        <EnvironmentalMonitoringTwo
          v-else-if="module.title === ENV_MONITOR_TWO_TITLE"
          :by-day="envMonitorTwoQuery.byDayAverage"
          :start-time="envMonitorTwoQuery.startTime"
          :end-time="envMonitorTwoQuery.endTime"
        />
        <AlarmComposition
          v-else-if="module.title === ALARM_COMPOSITION_TITLE"
          :period="activePeriodMap[ALARM_COMPOSITION_TITLE]"
        />
        <!-- 各模块内容待补充 -->
        <div v-else class="module-content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue';
  import dayjs from 'dayjs';
  import EnvironmentalMonitoringOne from './components/EnvironmentalMonitoringOne.vue';
  import EnvironmentalMonitoringTwo from './components/EnvironmentalMonitoringTwo.vue';
  import AlarmComposition from './components/AlarmComposition.vue';

  interface ModuleItem {
    title: string;
  }

  const ENV_MONITOR_ONE_TITLE = '环境监测1';
  const ENV_MONITOR_TWO_TITLE = '环境监测2';
  const ALARM_COMPOSITION_TITLE = '报警组成';

  type PeriodType = '本周' | '本月' | '本年';

  const periodOptions: PeriodType[] = ['本周', '本月', '本年'];
  const periodModules: string[] = [ENV_MONITOR_ONE_TITLE, ALARM_COMPOSITION_TITLE];
  const activePeriodMap = reactive<Record<string, PeriodType>>({
    [ENV_MONITOR_ONE_TITLE]: '本周',
    [ALARM_COMPOSITION_TITLE]: '本周',
  });

  const DATE_FORMAT = 'YYYY-MM-DD';

  /** 环境监测2查询条件：按天平均默认开启，日期默认最近一周 */
  const envMonitorTwoQuery = reactive<{ byDayAverage: boolean; startTime: string; endTime: string }>({
    byDayAverage: true,
    startTime: dayjs().subtract(7, 'day').format(DATE_FORMAT),
    endTime: dayjs().format(DATE_FORMAT),
  });

  /** 日期选择器与 startTime / endTime 双向绑定 */
  const envMonitorTwoDateRange = computed({
    get: (): [string, string] => [envMonitorTwoQuery.startTime, envMonitorTwoQuery.endTime],
    set: (value: [string, string]) => {
      envMonitorTwoQuery.startTime = value?.[0] ?? '';
      envMonitorTwoQuery.endTime = value?.[1] ?? '';
    },
  });

  const moduleList: ModuleItem[] = [
    { title: ENV_MONITOR_ONE_TITLE },
    { title: ENV_MONITOR_TWO_TITLE },
    { title: ALARM_COMPOSITION_TITLE },
  ];
</script>

<style scoped lang="less">
  .safety-environment-management-main-box {
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

        .extra-label {
          font-size: 14px;
          font-weight: normal;
          color: #64748b;
          white-space: nowrap;
        }

        .extra-range-picker {
          width: 240px;
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
      }

      .module-content {
        min-height: 300px;
      }
    }
  }
</style>
