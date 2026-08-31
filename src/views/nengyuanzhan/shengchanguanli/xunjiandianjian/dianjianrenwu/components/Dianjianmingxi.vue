<template>
  <div>
    <a-divider orientation="left">点检明细</a-divider>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
        <a-button
          v-if="hasPermission('operation:operation_inspection_task:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('点检明细', getExportUrl, exportParams)"
        >
          导出
        </a-button>
      </template>
      <!--      <template #action="{ record }">-->
      <!--        <TableAction :actions="getActions(record)" />-->
      <!--      </template>-->
    </BasicTable>
  </div>
</template>
<script lang="ts" setup>
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  import { ref, onMounted, watch, computed } from 'vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { filterObj } from '/@/utils/common/compUtils';
  import { BasicColumn, BasicTable, useTable, TableAction } from '@/components/Table';
  import { getExportUrl } from '../demo.api';
  const { handleExportXls } = useMethods();

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const checkedKeys = ref<Array<string | number>>([]);
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
    data: { type: Object, default: () => ({}) },
  });
  const exportParams = computed(() => {
    const params: Record<string, unknown> = {
      id: props.data?.id,
      taskId: props.data?.id,
    };
    if (checkedKeys.value.length > 0) {
      params.selections = checkedKeys.value.join(',');
    }
    return filterObj(params);
  });

  const columnsTable: BasicColumn[] = [
    {
      title: '点检项目名称',
      dataIndex: 'itemName',
      width: 130,
      resizable: true,
    },
    {
      title: '点检项目编号',
      dataIndex: 'itemCode',
      width: 140,
      resizable: true,
    },
    {
      title: '点检部位',
      dataIndex: 'categoryName',
      width: 140,
      resizable: true,
    },
    {
      title: '点检方法',
      dataIndex: 'methodName',
      width: 140,
      resizable: true,
    },
    {
      title: '点检内容',
      dataIndex: 'content',
      width: 140,
      resizable: true,
    },
    {
      title: '判定标准',
      dataIndex: 'fieldName',
      width: 140,
      resizable: true,
    },
    {
      title: '点检结果',
      dataIndex: 'fieldName',
      width: 140,
      resizable: true,
    },
    {
      title: '是否正常',
      dataIndex: 'isAbnormal',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (Number(text) === 0) {
          return '正常';
        }
        if (Number(text) === 1) {
          return '异常';
        }
        return text;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
      resizable: true,
    },
    // {
    //   title: '是否拍照',
    //   dataIndex: 'isPhoto',
    //   width: 140,
    //   resizable: true,
    //   customRender:({text})=>{
    //     if(text=== 1){
    //       return '是'
    //     } else if(text === 0){
    //       return '否'
    //     }
    //   }
    // },
  ];

  const [registerTable, { setTableData }] = useTable({
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
    //   title: '巡检项目',
    //   dataIndex: 'action',
    //   slots: {customRender: 'action'},
    //   fixed: 'right',
    // },
  });

  /**
   * 操作列定义
   * @param record
   */
  // function getActions(record) {
  //   return [
  //     {
  //       label: '查看巡检项目',
  //       onClick: handleDetail.bind(null, record),
  //     },
  //   ];
  // }

  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
  }

  onMounted(() => {
    // 禁用字段
    // updateSchema([
    //   {field: 'parentId', componentProps: {disabled: true}},
    //   {field: 'orgCode', componentProps: {disabled: true}},
    // ]);
    // // data 变化，重填表单
    watch(
      () => props.data,
      async (newVal) => {
        setTableData(newVal.taskItems || []);
      },
      { deep: true, immediate: true }
    );
  });
</script>
