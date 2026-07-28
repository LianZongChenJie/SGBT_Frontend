<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
      <a-button
        v-if="hasPermission('operation:operation_base_fault_order:exportXls')"
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
  import { ref, onMounted, watch, computed } from 'vue';
  import { getHistoryShenhejilu } from '../demo.api';
  import { BasicColumn, BasicTable, useTable } from '@/components/Table';
  import { getExportUrl, getImportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';
  import { useMethods } from '@/hooks/system/useMethods';
  import { filterObj } from '@/utils/common/compUtils';

  const { handleExportXls, handleImportXls } = useMethods();
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const orderId = ref(0);
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
    let paramsForm = {
      id: id.value,
    };
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });
  const columnsTable: BasicColumn[] = [
    {
      title: '操作节点',
      dataIndex: 'nodeName',
      width: 130,
      resizable: true,
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      width: 140,
      resizable: true,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 140,
      resizable: true,
    },
    {
      title: '操作时间',
      dataIndex: 'auditTime',
      width: 140,
      resizable: true,
    },
    {
      title: '审批内容',
      dataIndex: 'auditContent',
      width: 140,
      resizable: true,
    },
  ];
  const [registerTable, { reload }] = useTable({
    api: getHistoryShenhejilu,
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
    beforeFetch: (params) => {
      return Object.assign({ orderId: orderId.value }, params);
    },
    // actionColumn: {
    //   width: 150,
    //   title: '操作',
    //   dataIndex: 'action',
    //   slots: {customRender: 'action'},
    //   fixed: 'right',
    // },
  });

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
      async (newValue) => {
        console.log(newValue, '父组件传过来的值');
        orderId.value = newValue.id;
        reload();
      },
      { deep: true, immediate: true }
    );
  });
</script>
