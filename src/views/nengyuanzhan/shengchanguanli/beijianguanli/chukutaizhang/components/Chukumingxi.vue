<template>
    <BasicTable @register="registerTable">
<!--      <template #action="{ record }" >-->
<!--        <TableAction :actions="getActions(record)"/>-->
<!--      </template>-->
    </BasicTable>

</template>
<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { BasicColumn, BasicTable,useTable } from '@/components/Table';
import { getDetails } from '../demo.api';

// 声明Emits
//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
  data: {type: Object, default: () => ({})},
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
    title: '厂家',
    dataIndex: 'factory',
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
    title: '出库数量',
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
    width: 150,
    resizable: true,
  },
];
const [registerTable,{reload,setTableData}] = useTable({
  // api: getCaozuoHistory,
  rowKey: 'id',
  columns:columnsTable,
  // formConfig: {
  //   labelWidth: 120,
  //   schemas: searchFormSchema,
  //   autoSubmitOnEnter: true,
  // },
  striped: true,
  useSearchForm: false,
  showTableSetting: true,
  clickToRowSelect: false,
  bordered: true,
  showIndexColumn: true,
  indexColumnProps: {
    fixed: 'left',
  },
  tableSetting: {fullScreen: true},
  // beforeFetch: (params) => {
  //   return Object.assign({id: id.value}, params);
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
  // 禁用字段
  // updateSchema([
  //   {field: 'parentId', componentProps: {disabled: true}},
  //   {field: 'orgCode', componentProps: {disabled: true}},
  // ]);
  // // data 变化，重填表单
  watch(
    () => props.data,
    async (newValue) => {
      let arr = await getDetails(newValue.sheetNo);
      await setTableData(arr);
    },
    {deep: true, immediate: true}
  );

});
</script>
