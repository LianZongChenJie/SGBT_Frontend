<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button
        v-if="hasPermission('operation:operation_inspection_task:exportXls')"
        preIcon="ant-design:export-outlined"
        type="primary"
        @click="handleExportXls('巡检路线', getExportDetail, exportParams)"
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
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { filterObj } from '/@/utils/common/compUtils';
  import { BasicColumn, BasicTable, useTable } from '@/components/Table';
  import { getExportDetail } from '../demo.api';

  const { hasPermission } = usePermission();
  const { handleExportXls } = useMethods();

  const checkedKeys = ref<Array<string | number>>([]);
  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
    data: { type: Object, default: () => ({}) },
  });

  const exportParams = computed(() => {
    const params: Record<string, unknown> = {
      id: props.data?.id,
    };
    if (checkedKeys.value.length > 0) {
      params.selections = checkedKeys.value.join(',');
    }
    return filterObj(params);
  });

  const columnsTable: BasicColumn[] = [
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      width: 130,
      resizable: true,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      width: 140,
      resizable: true,
    },
    {
      title: '规格型号',
      dataIndex: 'deviceModule',
      width: 140,
      resizable: true,
    },
    {
      title: '设备类型',
      dataIndex: 'category',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (text === 1) {
          return '设备';
        } else if (text === 2) {
          return '备件';
        } else {
          return '工具';
        }
      },
    },
    {
      title: '巡检项目',
      dataIndex: 'totalItems',
      width: 140,
      resizable: true,
    },
    {
      title: '已检',
      dataIndex: 'checkedItems',
      width: 140,
      resizable: true,
    },

    {
      title: '未检',
      dataIndex: 'uncheckedItems',
      width: 140,
      resizable: true,
    },
    {
      title: '异常',
      dataIndex: 'abnormalItems',
      width: 140,
      resizable: true,
    },
  ];
  const [registerTable, { setTableData }] = useTable({
    rowKey: 'id',
    columns: columnsTable,
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
  });

  /**
   * 选择列配置
   */
  const rowSelection = computed<Record<string, any>>(() => ({
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys.value,
    onChange: onSelectChange,
  }));

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  function getRouteRows(data) {
    return Array.isArray(data?.details) ? data.details : [];
  }

  async function refreshTableData(data = props.data) {
    checkedKeys.value = [];
    await nextTick();
    setTableData(getRouteRows(data));
  }

  onMounted(() => {
    watch(
      () => props.data,
      (newVal) => {
        refreshTableData(newVal);
      },
      { deep: true, immediate: true }
    );
  });
</script>
