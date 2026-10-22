<template>
  <div class="alarm-list">
    <a-table
      class="alarm-table"
      :columns="columns"
      :data-source="alarmRecords"
      :loading="loading"
      size="small"
      :pagination="pagination"
      :locale="{ emptyText: '暂无数据' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'alarmStatus'">
          <a-tag :color="getStatusColor(record.alarmStatus)">{{ getStatusText(record.alarmStatus) }}</a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { getAlarmListApi } from '../visualization.api';

  /** 告警状态：1未处理，2已消除 */
  const ALARM_STATUS_MAP: Record<number, { text: string; color: string }> = {
    1: { text: '未处理', color: 'red' },
    2: { text: '已消除', color: 'green' },
  };

  interface AlarmRecord {
    deviceName: string;
    alarmTime: string;
    alarmCategoryName: string;
    alarmStatus: number;
  }

  interface AlarmListResult {
    records?: AlarmRecord[];
    total?: number;
    pieData?: { name: string; value: number }[];
  }

  const columns = [
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName' },
    { title: '告警时间', dataIndex: 'alarmTime', key: 'alarmTime' },
    { title: '告警类别名称', dataIndex: 'alarmCategoryName', key: 'alarmCategoryName' },
    { title: '告警状态', dataIndex: 'alarmStatus', key: 'alarmStatus', width: 100 },
  ];

  const alarmRecords = ref<AlarmRecord[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const pagination = computed(() => ({
    current: 1,
    pageSize: 10,
    total: total.value,
    size: 'small',
    showSizeChanger: false,
    showTotal: (val: number) => `共 ${val} 条`,
  }));

  function getStatusText(status: number) {
    return ALARM_STATUS_MAP[status]?.text || '-';
  }

  function getStatusColor(status: number) {
    return ALARM_STATUS_MAP[status]?.color || 'default';
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await getAlarmListApi();
      const data: AlarmListResult = result || {};
      alarmRecords.value = Array.isArray(data.records) ? data.records : [];
      total.value = Number(data.total) || alarmRecords.value.length;
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
  .alarm-list {
    min-height: 300px;

    .alarm-table {
      min-height: 300px;
    }

    :deep(.ant-table-thead > tr > th) {
      background: #f8fafc;
      color: #475569;
      font-size: 14px;
      font-weight: 600;
    }

    :deep(.ant-table-tbody > tr > td) {
      color: #334155;
      font-size: 14px;
    }
  }
</style>
