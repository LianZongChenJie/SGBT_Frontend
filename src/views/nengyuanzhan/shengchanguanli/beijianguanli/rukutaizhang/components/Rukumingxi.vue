<template>
  <BasicTable @register="registerTable">
    <template #tableTitle>
      <!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
<!--      <a-button-->
<!--        v-if="hasPermission('energy:energy_device_info:exportXls')"-->
<!--        preIcon="ant-design:export-outlined"-->
<!--        type="primary"-->
<!--        @click="handleExportXls('入库明细', getCaozuoHistoryExportXls, exportParams)"-->
<!--      >-->
<!--        导出-->
<!--      </a-button>-->
    </template>
    <!--      <template #action="{ record }" >-->
    <!--        <TableAction :actions="getActions(record)"/>-->
    <!--      </template>-->
  </BasicTable>
</template>
<script lang="ts" setup>
  import { onMounted, watch, unref } from 'vue';
  import { BasicColumn, BasicTable, useTable } from '@/components/Table';
  import { getDetails } from '../demo.api';

  // 声明Emits
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
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
      width: 130,
      resizable: true,
    },
    {
      title: '备件名称',
      dataIndex: 'deviceName',
      width: 140,
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
      title: '设备厂家',
      dataIndex: 'factory',
      width: 150,
      resizable: true,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      width: 150,
      resizable: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 100,
      resizable: true,
    },
    {
      title: '入库数量',
      dataIndex: 'qty',
      width: 100,
      resizable: true,
    },
    // {
    //   title: '存放位置',
    //   dataIndex: 'opContent',
    //   width: 350,
    //   resizable: true,
    // },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 100,
      resizable: true,
    },
  ];
  const [registerTable, { reload, setTableData }] = useTable({
    // api: getCaozuoHistory,
    rowKey: 'id',
    columns: columnsTable,
    // formConfig: {
    //   labelWidth: 120,
    //   schemas: searchFormSchema,
    //   autoSubmitOnEnter: true,
    // },
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
    // beforeFetch: (params) => {
    //   return Object.assign({ id: id.value }, params);
    // },
    // actionColumn: {
    //   width: 150,
    //   title: '操作',
    //   dataIndex: 'action',
    //   slots: {customRender: 'action'},
    //   fixed: 'right',
    // },
  });

  onMounted(() => {
    watch(
      () => props.data,
      async (newValue) => {
        let arr = await getDetails(newValue.sheetNo);
        await setTableData(arr);
      },
      { deep: true, immediate: true }
    );
  });
</script>
