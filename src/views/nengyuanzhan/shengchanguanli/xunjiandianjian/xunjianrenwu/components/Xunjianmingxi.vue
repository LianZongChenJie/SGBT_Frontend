<template>
  <div>
    <a-divider orientation="left">巡检明细</a-divider>
    <BasicTable v-show="!showFinish" class="detail-table" :minHeight="220" @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
        <a-button
          v-if="hasPermission('operation:operation_inspection_task:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('巡检明细', getExportDetail, exportParams)"
        >
          导出
        </a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <div v-show="showFinish" class="finish-panel">
      <a-row :gutter="16" class="finish-stats">
        <a-col :span="12">
          <a-card class="finish-card finish-card--device" :bordered="false">
            <div class="finish-card__head">
              <div class="finish-card__headline">
                <span class="finish-card__eyebrow">巡检设备概览</span>
                <h3 class="finish-card__title">
                  设备数量
                  <strong>{{ device.deviceTotalCount }}</strong>
                  台
                </h3>
              </div>
              <span class="finish-card__badge">{{ num }} 完成</span>
            </div>
            <div class="finish-card__body">
              <div class="finish-card__chart">
                <PieQuan :option="shebeiOpiton" width="100%"></PieQuan>
              </div>
              <div class="finish-card__legend">
                <div v-for="item in deviceLegendItems" :key="item.label" class="finish-card__legend-item">
                  <span class="finish-card__legend-dot" :style="{ background: item.color }"></span>
                  <span class="finish-card__legend-label">{{ item.label }}</span>
                  <strong class="finish-card__legend-value">{{ item.value }}</strong>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card class="finish-card finish-card--item" :bordered="false">
            <div class="finish-card__head">
              <div class="finish-card__headline">
                <span class="finish-card__eyebrow">巡检项目概览</span>
                <h3 class="finish-card__title">
                  巡检项目数量
                  <strong>{{ device.itemStatsTotal }}</strong>
                  项
                </h3>
              </div>
              <span class="finish-card__badge">{{ xiangmuNum }} 完成</span>
            </div>
            <div class="finish-card__body">
              <div class="finish-card__chart">
                <PieQuan :option="xiangmuOpiton" width="100%"></PieQuan>
              </div>
              <div class="finish-card__legend">
                <div v-for="item in itemLegendItems" :key="item.label" class="finish-card__legend-item">
                  <span class="finish-card__legend-dot" :style="{ background: item.color }"></span>
                  <span class="finish-card__legend-label">{{ item.label }}</span>
                  <strong class="finish-card__legend-value">{{ item.value }}</strong>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
      <BasicTable
        class="detail-table detail-table--finish"
        :minHeight="220"
        @register="registerTableFinish"
        :rowSelection="rowSelection"
        :rowExpandable="rowExpandable"
      >
        <template #tableTitle>
          <!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
          <a-button
            v-if="hasPermission('operation:operation_inspection_task:exportXls')"
            preIcon="ant-design:export-outlined"
            type="primary"
            @click="handleExportXls('巡检明细', getExportDetail, exportParams)"
          >
            导出
          </a-button>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getActionsFinish(record)" />
        </template>
        <template #expandedRowRender="{ record }">
          <a-table :columns="innerColumns" :data-source="record.detailItems" :pagination="false"></a-table>
        </template>
      </BasicTable>
    </div>

    <DemoModalZhixingxunjian :isDisabled="Disabled" @register="registerModalZhixingxunjian" @success="reload"></DemoModalZhixingxunjian>
    <demoModalImg :isDisabled="isDisabled" @register="registerModalImg"></demoModalImg>
  </div>
</template>
<script lang="ts" setup>
  import { usePermission } from '/@/hooks/web/usePermission';
  import DemoModalZhixingxunjian from '../DemoModalZhixingxunjian.vue';
  import demoModalImg from '../demoModalImg.vue';

  const { hasPermission } = usePermission();
  import { ref, reactive, computed, unref, onMounted, watch } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { BasicColumn, BasicTable, useTable, TableAction } from '@/components/Table';
  import { getExportDetail } from '../demo.api';
  import { useMethods } from '@/hooks/system/useMethods';
  const { handleExportXls, handleImportXls } = useMethods();
  import { filterObj } from '/@/utils/common/compUtils';
  import PieQuan from '@/components/chart/PieQuan.vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  const rowExpandable = (record) => {
    return record.detailItems && record.detailItems.length > 0;
  };
  const { getThemeColor } = useRootSetting();
  const showFinish = ref(false);
  const Disabled = ref(false);
  const device = reactive({});
  const arr = ref([]);
  const arr2 = ref([]);
  const deviceFinished = ref(0);
  const xiangmuFinished = ref(0);
  const num = ref(0);
  const xiangmuNum = ref(0);
  const statusPalette = ['#78c67a', '#ef6b70', '#d7dce5', '#5673d9'];

  const deviceLegendItems = computed(() => [
    { label: '正常', value: arr.value[0]?.value ?? 0, color: statusPalette[0] },
    { label: '异常', value: arr.value[1]?.value ?? 0, color: statusPalette[1] },
    { label: '未检', value: arr.value[2]?.value ?? 0, color: statusPalette[2] },
    { label: '跳过', value: arr.value[3]?.value ?? 0, color: statusPalette[3] },
  ]);

  const itemLegendItems = computed(() => [
    { label: '正常', value: arr2.value[0]?.value ?? 0, color: statusPalette[0] },
    { label: '异常', value: arr2.value[1]?.value ?? 0, color: statusPalette[1] },
    { label: '未检', value: arr2.value[2]?.value ?? 0, color: statusPalette[2] },
    { label: '跳过', value: arr2.value[3]?.value ?? 0, color: statusPalette[3] },
  ]);

  function createRingOption() {
    return {
      grid: {
        left: '2%',
        right: '2%',
        top: '24px',
        bottom: '24px',
        containLabel: true,
      },
      legend: {
        show: false,
      },
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          name: '',
          id: '101',
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '54%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 6,
            color: function (params) {
              return statusPalette[params.dataIndex] || statusPalette[0];
            },
          },
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          emphasis: {
            scale: false,
            itemStyle: {
              shadowBlur: 16,
              shadowOffsetX: 0,
              shadowColor: 'rgba(62, 89, 148, 0.18)',
            },
          },
          data: [],
        },
      ],
    };
  }

  const shebeiOpiton = ref(createRingOption());
  const xiangmuOpiton = ref(createRingOption());
  const id = ref(0);
  const exportParams = computed(() => {
    let paramsForm = {
      id: id.value,
    };
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const checkedKeys = ref<Array<string | number>>([]);
  const emptyStats = {
    total: 0,
    finished: 0,
    normal: 0,
    abnormal: 0,
    unchecked: 0,
    skipped: 0,
  };
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
    // {
    //   title: '使用部门A',
    //   dataIndex: 'factoryName',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '存储位置A',
    //   dataIndex: 'factoryName',
    //   width: 140,
    //   resizable: true,
    // },
    {
      title: '是否拍照',
      dataIndex: 'isPhoto',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (text === 1) {
          return '是';
        } else if (text === 0) {
          return '否';
        }
      },
    },
    {
      title: '扫码登记',
      dataIndex: 'isScan',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (text === 1) {
          return '是';
        } else if (text === 0) {
          return '否';
        }
      },
    },
  ];
  const columnsTableFinish: BasicColumn[] = [
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
    // {
    //   title: '使用部门A',
    //   dataIndex: 'factoryName',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '存放位置A',
    //   dataIndex: 'factoryName',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '执行时间A',
    //   dataIndex: 'factoryName',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '巡检项目名称',
    //   dataIndex: 'itemName',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '巡检分类',
    //   dataIndex: 'categoryName',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '巡检内容',
    //   dataIndex: 'content',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '巡检结果',
    //   dataIndex: 'checkStatus',
    //   width: 140,
    //   resizable: true,
    //   customRender: ({ text }) => {
    //     if (text === 0) {
    //       return '未开始';
    //     } else if (text === 1) {
    //       return '巡检中';
    //     } else if (text === 2){
    //       return '已完成'
    //     }else if(text ===3){
    //       return '跳过'
    //     }
    //   },
    // },
    // {
    //   title: '是否正常',
    //   dataIndex: 'isAbnormal',
    //   width: 140,
    //   resizable: true,
    //   customRender: ({ text }) => {
    //     if (text === 0) {
    //       return '正常';
    //     } else if (text === 1) {
    //       return '异常';
    //     }
    //   },
    // },
    // {
    //   title: '跳过原因',
    //   dataIndex: 'skipReason',
    //   width: 140,
    //   resizable: true,
    // },
  ];
  const innerData = ref([]);
  const innerColumns: BasicColumn[] = [
    {
      title: '巡检项目名称',
      dataIndex: 'itemName',
      width: 140,
      resizable: true,
      align: 'center',
    },
    {
      title: '巡检分类',
      dataIndex: 'categoryName',
      width: 140,
      resizable: true,
      align: 'center',
    },
    {
      title: '巡检内容',
      dataIndex: 'content',
      width: 140,
      resizable: true,
      align: 'center',
    },
    {
      title: '巡检结果',
      dataIndex: 'actualValue',
      width: 140,
      resizable: true,
      // customRender: ({ text }) => {
      //   if (text === 0) {
      //     return '未开始';
      //   } else if (text === 1) {
      //     return '巡检中';
      //   } else if (text === 2){
      //     return '已完成'
      //   }else if(text ===3){
      //     return '跳过'
      //   }
      // },
    },
    {
      title: '是否正常',
      dataIndex: 'isAbnormal',
      width: 140,
      resizable: true,
      align: 'center',
      customRender: ({ text }) => {
        if (text === 0) {
          return '正常';
        } else if (text === 1) {
          return '异常';
        }
      },
    },
    {
      title: '跳过原因',
      dataIndex: 'skipReason',
      width: 140,
      resizable: true,
      align: 'center',
    },
  ];
  const [registerTable, { reload, setTableData: setTableDataDaizhixing }] = useTable({
    // api: list,
    rowKey: 'id',
    columns: columnsTable,
    // formConfig: {
    //   labelWidth: 120,
    //   schemas: searchFormSchema,
    //   autoSubmitOnEnter: true,
    // },
    striped: true,
    canResize: false,
    useSearchForm: false,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    scroll: {
      y: 320,
    },
    // beforeFetch: (params) => {
    //   return Object.assign({column: 'createTime', order: 'desc'}, params);
    // },
    actionColumn: {
      width: 150,
      title: '巡检项目',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });
  const [registerTableFinish, { setTableData }] = useTable({
    // api: list,
    rowKey: 'id',
    columns: columnsTableFinish,
    // formConfig: {
    //   labelWidth: 120,
    //   schemas: searchFormSchema,
    //   autoSubmitOnEnter: true,
    // },
    striped: true,
    canResize: false,
    useSearchForm: false,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    scroll: {
      y: 260,
    },
    // beforeFetch: (params) => {
    //   return Object.assign({column: 'createTime', order: 'desc'}, params);
    // },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });
  const [registerModalZhixingxunjian, { openModal: openModalYulan }] = useModal();
  const [registerModalImg, { openModal: openModalImg }] = useModal();

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '查看巡检项目',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  function getActionsFinish(record) {
    return [
      {
        label: '查看照片',
        onClick: handleImg.bind(null, record),
      },
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

  function handleDetail(record) {
    console.log(record, '详情里传过来的对象');
    Disabled.value = true;
    openModalYulan(true, {
      record,
      isUpdate: true,
    });
  }

  function handleImg(record) {
    // props.isDisabled = true;
    openModalImg(true, {
      record,
      isUpdate: true,
    });
  }

  function buildChartData(stats) {
    return [
      { value: stats.normal, name: '正常' },
      { value: stats.abnormal, name: '异常' },
      { value: stats.unchecked, name: '未检' },
      { value: stats.skipped, name: '跳过' },
    ];
  }

  function formatPercent(finished, total) {
    return `${total ? (finished / total) * 100 : 0}%`;
  }

  function buildGraphic(percent, finished, unit) {
    return [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        z: 10,
        style: {
          text: [`{title|${percent}}`, `{value|已检${finished} ${unit}}`].join('\n'),
          textAlign: 'center',
          rich: {
            title: {
              fontSize: 34,
              fontWeight: 700,
              color: '#17315c',
              padding: [0, 0, 8, 0],
            },
            value: {
              fontSize: 15,
              fontWeight: 600,
              color: '#42a65c',
            },
          },
        },
      },
    ];
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
        const details = newVal.details || [];
        const deviceStats = newVal.statistics?.deviceStats || emptyStats;
        const itemStats = newVal.statistics?.itemStats || emptyStats;

        device.deviceTotalCount = deviceStats.total;
        num.value = formatPercent(deviceStats.finished, deviceStats.total);
        deviceFinished.value = deviceStats.finished;
        arr.value = buildChartData(deviceStats);
        shebeiOpiton.value.series[0].data = arr.value;
        shebeiOpiton.value.graphic = buildGraphic(num.value, deviceFinished.value, '台');

        device.itemStatsTotal = itemStats.total;
        xiangmuNum.value = formatPercent(itemStats.finished, itemStats.total);
        xiangmuFinished.value = itemStats.finished;
        arr2.value = buildChartData(itemStats);
        xiangmuOpiton.value.series[0].data = arr2.value;
        xiangmuOpiton.value.graphic = buildGraphic(xiangmuNum.value, xiangmuFinished.value, '项');

        setTableDataDaizhixing(details);
        setTableData(details);
        checkedKeys.value = [];
        showFinish.value = Number(newVal.status) === 3;
        id.value = newVal.id || 0;
      },
      { deep: true, immediate: true }
    );
  });
</script>
<style lang="less" scoped>
  .finish-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .finish-stats {
    margin-bottom: 0;
  }

  .finish-card {
    overflow: hidden;
    border-radius: 22px;
    background: radial-gradient(circle at top left, rgba(114, 176, 255, 0.16), transparent 42%), linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
    box-shadow:
      0 14px 32px rgba(25, 69, 133, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.88);

    :deep(.ant-card-body) {
      padding: 22px 22px 18px;
    }
  }

  .finish-card--item {
    background: radial-gradient(circle at top left, rgba(95, 212, 163, 0.14), transparent 42%), linear-gradient(180deg, #ffffff 0%, #f7fffb 100%);
  }

  .finish-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .finish-card__headline {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .finish-card__eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #6c84ab;
  }

  .finish-card__title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
    color: #1c2f57;

    strong {
      margin: 0 4px;
      font-size: 30px;
      font-weight: 700;
      color: #13284d;
    }
  }

  .finish-card__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 96px;
    padding: 9px 14px;
    border: 1px solid rgba(72, 128, 255, 0.16);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 8px 18px rgba(53, 104, 189, 0.08);
    font-size: 13px;
    font-weight: 600;
    color: #2a5cc2;
    white-space: nowrap;
  }

  .finish-card__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 168px;
    gap: 18px;
    align-items: center;
  }

  .finish-card__chart {
    min-height: 260px;
    padding: 8px 10px;
    border: 1px solid rgba(101, 142, 212, 0.12);
    border-radius: 20px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 249, 255, 0.88) 100%);
  }

  .finish-card__legend {
    display: grid;
    gap: 12px;
  }

  .finish-card__legend-item {
    display: grid;
    grid-template-columns: 10px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid rgba(115, 143, 189, 0.12);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.82);
  }

  .finish-card__legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.92);
  }

  .finish-card__legend-label {
    font-size: 14px;
    font-weight: 500;
    color: #5c7197;
  }

  .finish-card__legend-value {
    font-size: 16px;
    font-weight: 700;
    color: #17315c;
  }

  .detail-table {
    :deep(.ant-table-wrapper) {
      min-height: 220px;
    }
  }

  .detail-table--finish {
    :deep(.ant-table-wrapper) {
      min-height: 260px;
    }
  }

  @media (max-width: 1400px) {
    .finish-card__body {
      grid-template-columns: 1fr;
    }

    .finish-card__legend {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
