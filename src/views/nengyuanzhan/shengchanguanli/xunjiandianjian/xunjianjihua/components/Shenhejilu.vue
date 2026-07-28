<template>
  <BasicTable @register="registerTable">
    <template #tableTitle>
      <!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
      <a-button
        v-if="hasPermission('operation:operation_inspection_plan:exportXls')"
        preIcon="ant-design:export-outlined"
        type="primary"
        @click="handleExportXls('单表示例', getExportUrl, exportParams)"
      >
        导出
      </a-button>
    </template>
    <!--      <template #action="{ record }" >-->
    <!--        <TableAction :actions="getActions(record)"/>-->
    <!--      </template>-->
  </BasicTable>
</template>
<script lang="ts" setup>
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  import { ref, computed, unref, watch, onMounted } from 'vue';
  import { BasicColumn, BasicTable, useTable, TableAction } from '@/components/Table';
  import { getExportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
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
    // {
    //   title: '操作节点',
    //   dataIndex: 'amount',
    //   width: 130,
    //   resizable: true,
    // },
    {
      title: '操作人',
      dataIndex: 'reviewerName',
      width: 140,
      resizable: true,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 140,
      resizable: true,
      // customRender: ({ text }) => {
      //   if (text == 1) {
      //     return '通过';
      //   } else if (text == 2) {
      //     return '驳回';
      //   } else if (text == 3) {
      //     return '撤销';
      //   } else if (text == 4) {
      //     return '关闭';
      //   }
      // },
    },
    {
      title: '操作时间',
      dataIndex: 'reviewTime',
      width: 140,
      resizable: true,
    },
    {
      title: '审批内容',
      dataIndex: 'remark',
      width: 140,
      resizable: true,
    },
  ];
  const [registerTable, { reload, setTableData }] = useTable({
    // api: list,
    rowKey: 'id',
    columns: columnsTable,
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
    tableSetting: { fullScreen: true },
    // beforeFetch: (params) => {
    //   return Object.assign({column: 'createTime', order: 'desc'}, params);
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
        console.log(newValue, '111');
        // let record = unref(newValue);
        // if (typeof record !== 'object') {
        //   record = {};
        // }
        // model.value = record;
        console.log(newValue.reviewLogs, '审核记录');
        setTableData(newValue.reviewLogs || []);
      },
      { deep: true, immediate: true }
    );
  });
</script>
