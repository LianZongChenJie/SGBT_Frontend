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
      <BasicTable @register="registerTable" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { BasicColumn, BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getDeviceAttributePage } from './api';

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
  ];

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
</style>
