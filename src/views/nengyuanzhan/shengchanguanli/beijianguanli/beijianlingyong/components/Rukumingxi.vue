<template>
  <BasicTable @register="registerTable" />
</template>

<script lang="ts" setup>
  import { onMounted, watch } from 'vue';
  import { BasicColumn, BasicTable, useTable } from '@/components/Table';
  import { getSheetNoDetail } from '../demo.api';

  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
    data: { type: Object, default: () => ({}) },
  });

  const columnsTable: BasicColumn[] = [
    {
      title: '备件编码',
      dataIndex: 'deviceCode',
      width: 150,
      resizable: true,
    },
    {
      title: '备件名称',
      dataIndex: 'deviceName',
      width: 150,
      resizable: true,
    },
    {
      title: '规格型号',
      dataIndex: 'deviceModule',
      width: 150,
      resizable: true,
    },
    {
      title: '备件类型',
      dataIndex: 'deviceTypeName',
      width: 150,
      resizable: true,
    },
    {
      title: '品牌',
      dataIndex: 'supplier',
      width: 140,
      resizable: true,
    },
    {
      title: '设备厂家',
      dataIndex: 'factory',
      width: 140,
      resizable: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 100,
      resizable: true,
    },
    {
      title: '当前库存',
      dataIndex: 'invQty',
      width: 110,
      resizable: true,
    },
    {
      title: '申领数量',
      dataIndex: 'applyQty',
      width: 110,
      resizable: true,
    },
    {
      title: '已出库数量',
      dataIndex: 'outQty',
      width: 120,
      resizable: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      resizable: true,
    },
  ];

  const [registerTable, { setTableData }] = useTable({
    rowKey: 'id',
    columns: columnsTable,
    striped: true,
    useSearchForm: false,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
  });

  onMounted(() => {
    watch(
      () => props.data,
      async (newValue) => {
        const sheetNo = newValue?.sheetNo;
        if (!sheetNo) {
          await setTableData([]);
          return;
        }
        const rows = await getSheetNoDetail({ sheetNo });
        await setTableData(Array.isArray(rows) ? rows : []);
      },
      { deep: true, immediate: true }
    );
  });
</script>
