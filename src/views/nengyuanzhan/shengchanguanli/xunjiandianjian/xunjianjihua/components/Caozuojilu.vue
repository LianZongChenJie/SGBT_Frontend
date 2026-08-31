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
  const checkedKeys = ref<Array<string | number>>([]);
  //自定义接受参数
  const props = defineProps({
    data: { type: Object, default: () => ({}) },
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const columnsTable: BasicColumn[] = [
    {
      title: '操作人',
      dataIndex: 'operatorName',
      width: 130,
      resizable: true,
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      width: 140,
      resizable: true,
    },
    {
      title: '操作内容',
      dataIndex: 'opContent',
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

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '执行巡检',
        onClick: handleEdit.bind(null, record),
        auth: 'energy:energy_device_info:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      {
        label: '上传图片',
        onClick: handleEdit.bind(null, record),
        auth: 'energy:energy_device_info:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      // {
      //   label: '删除',
      //   auth: 'energy:energy_device_info:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDelete.bind(null, record),
      //   },
      // },
    ];
  }

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
    watch(
      () => props.data,
      async (newValue) => {
        // let record = unref(newValue);
        // if (typeof record !== 'object') {
        //   record = {};
        // }
        // model.value = record;
        console.log(newValue.recordLogs, '操作日志记录');
        setTableData(newValue.recordLogs || []);
      },
      { deep: true, immediate: true }
    );
  });
</script>
