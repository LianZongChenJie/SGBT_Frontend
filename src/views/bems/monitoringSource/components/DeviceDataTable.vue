<template>
  <div class="device-data-table">
    <!-- 查询条件：长名 / 描述 输入框，对表格长名、描述两列做前端模糊筛选 -->
    <div class="query-bar">
      <span class="query-label">长名：</span>
      <a-input v-model:value="keywordCode" placeholder="请输入长名，模糊查询" allow-clear class="query-input" />
      <span class="query-label">描述：</span>
      <a-input v-model:value="keywordName" placeholder="请输入描述，模糊查询" allow-clear class="query-input" />
    </div>
    <!-- 表格与查询行处于同一个白色卡片内 -->
    <div class="table-wrap">
      <BasicTable @register="registerTable">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a @click="handleHistory(record)">历史</a>
          </template>
        </template>
      </BasicTable>
    </div>
    <!-- 历史弹窗：趋势图（粒度切换 + 时间区间，无 tab 页选择） -->
    <a-modal
      v-model:open="historyVisible"
      :title="historyTitle"
      width="800px"
      :body-style="{ padding: '16px 24px' }"
      :footer="null"
      destroy-on-close
      @cancel="handleHistoryClose"
    >
      <div class="chart-header-bar">
        <a-range-picker
          v-model:value="dateRange"
          value-format="YYYY-MM-DD HH:mm:ss"
          show-time
          style="width: 420px"
          @change="queryHistoryTrend"
        />
        <a-radio-group v-model:value="granularity" button-style="solid" size="small" @change="queryHistoryTrend">
          <a-radio-button value="15min">分钟</a-radio-button>
          <a-radio-button value="hour">小时</a-radio-button>
          <a-radio-button value="day">天</a-radio-button>
        </a-radio-group>
      </div>
      <a-spin :spinning="historyLoading">
        <div class="chart-container">
          <div ref="chartRef" class="chart"></div>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
  import { BasicColumn, BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import echarts from '/@/utils/lib/echarts';
  import { getDeviceAttributePage, getReturnAirCo2Trend } from './api';

  const props = defineProps({
    // 当前标签页对应设备的 deviceId（来自 /bems/monitorSource/tree 初始化接口）
    deviceId: {
      type: [String, Number],
      required: true,
    },
  });

  // 表格列配置（/bems/deviceAttribute/queryPage 返回 records 字段）
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '80px',
      customRender: ({ index }) => index + 1,
    },
    {
      title: '长名',
      dataIndex: 'attributeCode',
      key: 'attributeCode',
    },
    {
      title: '描述',
      dataIndex: 'attributeName',
      key: 'attributeName',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '时间',
      dataIndex: 'gatherTime',
      key: 'gatherTime',
    },
    {
      title: '质量戳',
      dataIndex: 'qualityStamp',
      key: 'qualityStamp',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: '100px',
      fixed: 'right',
    },
  ];

  /* ============== 历史趋势弹窗 ============== */
  const historyVisible = ref(false);
  const historyLoading = ref(false);
  const historyRecord = ref<any>(null);
  // 聚合粒度：15min(分钟) / hour(小时) / day(天)，默认小时
  const granularity = ref<string>('hour');
  // 时间区间，未选择时不传 startTime / endTime（由后端默认当天）
  const dateRange = ref<[string, string] | []>([]);
  const chartRef = ref<HTMLDivElement>();
  let chartInstance: any = null;

  // 弹窗标题：优先展示当前行属性名
  const historyTitle = ref('历史');

  // 点击「历史」：打开弹窗并查询趋势数据
  const handleHistory = (record: any) => {
    historyRecord.value = record;
    historyTitle.value = record?.attributeName ? `历史 - ${record.attributeName}` : '历史';
    // 每次打开重置筛选条件
    granularity.value = 'hour';
    dateRange.value = [];
    historyVisible.value = true;
    // 等待弹窗内容渲染完成后初始化图表并查询
    nextTick(() => queryHistoryTrend());
  };

  // 折线趋势图配置
  const buildTrendOption = (xAxis: string[], series: { name: string; data: (number | null)[] }[]) => ({
    color: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#c3c2b7', width: 1 } },
      backgroundColor: '#fff',
      borderColor: '#e1e0d9',
      borderWidth: 1,
      textStyle: { color: '#0b0b0b' },
    },
    legend:
      series.length >= 2
        ? {
            type: 'scroll',
            bottom: 0,
            itemWidth: 16,
            itemHeight: 8,
            textStyle: { color: '#52514e' },
            data: series.map((s) => s.name),
          }
        : undefined,
    grid: { left: '3%', right: '4%', top: '12%', bottom: series.length >= 2 ? '16%' : '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxis,
      axisLabel: { color: '#898781', interval: xAxis.length > 20 ? Math.ceil(xAxis.length / 10) : 0 },
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#898781' },
      splitLine: { lineStyle: { color: '#e1e0d9' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      connectNulls: false,
      symbol: 'circle',
      symbolSize: 8,
      showSymbol: false,
      lineStyle: { width: 2, cap: 'round', join: 'round' },
      emphasis: { focus: 'series', scale: 1.25 },
    })),
  });

  // 查询历史趋势数据并渲染折线图
  const queryHistoryTrend = async () => {
    const container = chartRef.value;
    if (!container) return;
    historyLoading.value = true;
    try {
      if (!chartInstance) {
        chartInstance = echarts.init(container);
      }
      const record = historyRecord.value || {};
      const params: any = {
        // deviceIds 取选中行，兼容行数据只有 deviceId 的情况
        deviceIds: record.deviceIds ?? record.deviceId ?? props.deviceId,
        attributeName: record.attributeName,
        granularity: granularity.value,
      };
      // 选择了时间区间才传起止时间
      if (dateRange.value && dateRange.value.length === 2) {
        params.startTime = dateRange.value[0];
        params.endTime = dateRange.value[1];
      }

      const res: any = await getReturnAirCo2Trend(params);
      const data = res?.data || res || {};
      const xAxis = data.xAxis || data.xaxis || data.timeList || [];
      const series = (data.series || data.chatSeriesList || data.seriesList || []).filter((s: any) => s.name !== '合计');
      if (!xAxis.length || !series.length) {
        chartInstance.clear();
        return;
      }
      chartInstance.setOption(buildTrendOption(xAxis, series), true);
      // 弹窗刚打开时容器尺寸可能尚未稳定，渲染后再校正一次
      chartInstance.resize();
    } catch (e) {
      console.error('获取历史趋势数据失败', e);
      chartInstance?.clear();
    } finally {
      historyLoading.value = false;
    }
  };

  // 关闭弹窗：销毁图表实例
  const handleHistoryClose = () => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
  };

  // 图表自适应
  const resizeChart = () => chartInstance?.resize();

  // 全量数据缓存（一次拉取，后续查询均为前端过滤）
  const rawList = ref<any[]>([]);
  // 查询条件：长名 / 描述
  const keywordCode = ref('');
  const keywordName = ref('');

  // 不传 api，改用 dataSource 受控模式 + 本地分页，避免切页/过滤相互干扰
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      columns: columns,
      showTableSetting: false,
      showActionColumn: false,
      useSearchForm: false,
      size: 'middle',
      rowKey: 'attributeCode',
      pagination: {
        pageSize: 10,
        showSizeChanger: false,
      },
    },
  });

  // BasicTable绑定注册 + 表格操作方法（setTableData / setPagination）
  const [registerTable, { setTableData, setPagination }] = tableContext;

  // 按长名 attributeCode / 描述 attributeName 模糊过滤，过滤后注入表格并回到第一页
  const applyFilter = () => {
    const code = keywordCode.value.trim().toLowerCase();
    const name = keywordName.value.trim().toLowerCase();
    const list = rawList.value.filter((row) => {
      const rowCode = String(row.attributeCode ?? '').toLowerCase();
      const rowName = String(row.attributeName ?? '').toLowerCase();
      return (!code || rowCode.includes(code)) && (!name || rowName.includes(name));
    });
    setTableData(list);
    setPagination({ total: list.length, current: 1 });
  };

  // 输入变化即时筛选
  watch([keywordCode, keywordName], applyFilter);

  // 首次加载（切换设备标签页时组件会重建触发）
  onMounted(async () => {
    window.addEventListener('resize', resizeChart);
    try {
      const res = await getDeviceAttributePage({
        deviceId: props.deviceId,
        pageNo: 1,
        pageSize: 1000,
      });
      rawList.value = res.records ?? [];
    } catch (e) {
      console.error('获取设备属性数据失败', e);
      rawList.value = [];
    }
    applyFilter();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    handleHistoryClose();
  });
</script>

<style scoped lang="less">
  .device-data-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;
    padding: 16px;

    .query-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;

      .query-label {
        color: #333;
        font-size: 14px;
        white-space: nowrap;
      }

      .query-input {
        width: 220px;
      }
    }

    .table-wrap {
      flex: 1;
      min-height: 0;
    }
  }

  /* 注意：a-modal 默认挂载到 body，弹窗内样式不能嵌套在 .device-data-table 下，否则匹配不到 */
  .chart-header-bar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .chart-container {
    width: 100%;
    min-height: 320px;
    padding-top: 16px;
    background: #fff;
  }

  .chart {
    width: 100%;
    height: 320px;
  }
</style>
