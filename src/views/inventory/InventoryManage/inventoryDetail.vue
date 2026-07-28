<template>
  <BasicTable @register="registerTable2">
    <template #toolbar>
      <a-button type="primary" @click="onExportXls" :loading="exportLoading">导出</a-button>
    </template></BasicTable
  >
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { detailListApi } from '@/views/inventory/InventoryManage/api';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { inventoryDetailColumns, searchFormDetailSchema } from './data';
  import { getExportUrl } from '@/views/inventory/InventoryManage/api';
  const exportLoading = ref(false);
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      title: '出入库详情',
      api: detailListApi,
      columns: inventoryDetailColumns,
      actionColumn: null,
      showIndexColumn: true,
      formConfig: {
        schemas: searchFormDetailSchema,
        fieldMapToTime: [['time', ['time_begin', 'time_end'], 'YYYY-MM-DD']],
      },
    },
  });
  const [registerTable2, tableAction] = tableContext;
  async function onExportXls() {
    const formData = await tableAction.getForm().validate();
    console.log(formData, 'formData');
    const filtered = Object.fromEntries(Object.entries(formData).filter(([_, value]) => value !== undefined));
    exportLoading.value = true;
    await getExportUrl(filtered, '出入库详情.xlsx', '/jeecg-demo/admin/inventoryRecord/exportData');
    exportLoading.value = false;
  }
</script>
<style scoped>
  .ant-input-number {
    width: 100%;
  }
</style>
