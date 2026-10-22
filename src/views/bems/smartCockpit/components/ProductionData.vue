<template>
  <div class="production-data">
    <a-table
      class="production-table"
      :columns="columns"
      :data-source="tableRows"
      :loading="loading"
      size="small"
      :pagination="false"
      :locale="{ emptyText: '暂无数据' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <span class="type-cell">{{ record.type }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { getDailyProductionDataApi } from '../visualization.api';

  interface ProductionDataItem {
    deviceName: string;
    maxValue: number | string;
    minValue: number | string;
    production: number | string;
  }

  interface ProductionDataGroup {
    type: string;
    data?: ProductionDataItem[];
  }

  interface TableRow extends ProductionDataItem {
    key: string;
    type: string;
  }

  const columns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName' },
    { title: '区间内最大值', dataIndex: 'maxValue', key: 'maxValue' },
    { title: '区间内最小值', dataIndex: 'minValue', key: 'minValue' },
    { title: '产量', dataIndex: 'production', key: 'production' },
  ];

  const groupList = ref<ProductionDataGroup[]>([]);
  const loading = ref(false);

  const tableRows = computed<TableRow[]>(() => {
    const rows: TableRow[] = [];
    groupList.value.forEach((group, groupIndex) => {
      (group.data || []).forEach((item, itemIndex) => {
        rows.push({
          key: `${group.type}-${groupIndex}-${itemIndex}`,
          type: group.type,
          ...item,
        });
      });
    });
    return rows;
  });

  async function loadData() {
    loading.value = true;
    try {
      const result = await getDailyProductionDataApi();
      groupList.value = Array.isArray(result) ? result : [];
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
  .production-data {
    min-height: 300px;

    .production-table {
      min-height: 300px;
    }

    .type-cell {
      font-weight: 600;
      color: #0d9488;
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
