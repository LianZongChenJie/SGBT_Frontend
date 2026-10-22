<template>
  <div class="key-equipment-status">
    <div v-for="item in deviceCards" :key="item.key" class="metric-card" :style="getMetricStyle(item)">
      <div class="metric-card__content">
        <div class="metric-card__icon">
          <Icon :icon="item.icon" :size="26" :color="item.color" />
        </div>
        <div class="metric-card__meta">
          <div class="metric-card__value">{{ item.statusText }}</div>
          <div class="metric-card__label">{{ item.deviceName }}</div>
        </div>
      </div>
    </div>
    <div v-if="deviceCards.length === 0" class="equipment-empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { getKeyEquipmentStatusApi } from '../visualization.api';

  /** 锅炉：0停止 1点火 2前吹扫 3点火 4负荷运行 5后吹扫 6待机 */
  const BOILER_STATUS_MAP: Record<number, string> = {
    0: '停止',
    1: '点火',
    2: '前吹扫',
    3: '点火',
    4: '负荷运行',
    5: '后吹扫',
    6: '待机',
  };

  /** 除氧水泵：0停止 1运行 */
  const PUMP_STATUS_MAP: Record<number, string> = {
    0: '停止',
    1: '运行',
  };

  const STATUS_COLOR_MAP: Record<string, string> = {
    停止: '#94a3b8',
    运行: '#22c55e',
    负荷运行: '#22c55e',
    点火: '#f59e0b',
    前吹扫: '#f59e0b',
    后吹扫: '#f59e0b',
    待机: '#3b82f6',
  };

  const STATUS_SOFT_COLOR_MAP: Record<string, string> = {
    停止: 'rgba(148, 163, 184, 0.18)',
    运行: 'rgba(34, 197, 94, 0.14)',
    负荷运行: 'rgba(34, 197, 94, 0.14)',
    点火: 'rgba(245, 158, 11, 0.14)',
    前吹扫: 'rgba(245, 158, 11, 0.14)',
    后吹扫: 'rgba(245, 158, 11, 0.14)',
    待机: 'rgba(59, 130, 246, 0.14)',
  };

  interface DeviceAttribute {
    attributeCode?: string;
    attributeName?: string;
    value?: number | string;
  }

  interface KeyDevice {
    deviceName: string;
    deviceCode?: string;
    attribute?: DeviceAttribute;
  }

  interface KeyEquipmentResult {
    total?: number;
    devices?: KeyDevice[];
  }

  interface DeviceCard {
    key: string;
    deviceName: string;
    statusText: string;
    icon: string;
    color: string;
    softColor: string;
  }

  const deviceList = ref<KeyDevice[]>([]);
  const loading = ref(false);

  const deviceCards = computed<DeviceCard[]>(() =>
    deviceList.value.map((device, index) => {
      const statusText = getStatusText(device);
      const isPump = (device.deviceName || '').includes('除氧水泵');
      return {
        key: `${device.deviceCode ?? ''}-${device.deviceName}-${index}`,
        deviceName: device.deviceName || '-',
        statusText,
        icon: isPump ? 'ant-design:dashboard-outlined' : 'ant-design:fire-outlined',
        color: STATUS_COLOR_MAP[statusText] || '#64748b',
        softColor: STATUS_SOFT_COLOR_MAP[statusText] || 'rgba(100, 116, 139, 0.14)',
      };
    })
  );

  function getStatusText(device: KeyDevice) {
    const rawValue = Number(device.attribute?.value);
    if (!Number.isFinite(rawValue)) {
      return '-';
    }
    const value = Math.trunc(rawValue);
    const isPump = (device.deviceName || '').includes('除氧水泵');
    const statusMap = isPump ? PUMP_STATUS_MAP : BOILER_STATUS_MAP;
    return statusMap[value] || '-';
  }

  function getMetricStyle(item: DeviceCard) {
    return {
      '--metric-color': item.color,
      '--metric-soft-color': item.softColor,
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result: KeyEquipmentResult = await getKeyEquipmentStatusApi();
      deviceList.value = Array.isArray(result?.devices) ? result.devices : [];
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadData();
  });

  defineExpose({ loadData });
</script>

<style lang="less" scoped>
  .key-equipment-status {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    min-height: 300px;
  }

  .metric-card {
    border-radius: 16px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow:
      0 12px 28px rgba(15, 23, 42, 0.06),
      inset 0 0 0 1px rgba(148, 163, 184, 0.1);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 18px 32px rgba(15, 23, 42, 0.08),
      inset 0 0 0 1px rgba(148, 163, 184, 0.12);
  }

  .metric-card__content {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 72px;
    padding: 18px 20px;
  }

  .metric-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: var(--metric-soft-color);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
    flex: none;
  }

  .metric-card__meta {
    min-width: 0;
  }

  .metric-card__value {
    font-size: 22px;
    line-height: 1;
    font-weight: 700;
    color: #172554;
  }

  .metric-card__label {
    margin-top: 8px;
    font-size: 14px;
    color: #64748b;
    letter-spacing: 0.02em;
  }

  .equipment-empty {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 260px;
    font-size: 15px;
    color: #94a3b8;
  }
</style>
