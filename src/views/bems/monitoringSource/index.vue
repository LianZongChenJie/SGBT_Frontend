<template>
  <div class="monitoring-source-main-box">
    <!-- 顶部统计卡片（数据来自 /bems/deviceStatistis/statistics 接口） -->
    <div class="stats-row">
      <StatCard label="设备数量" :value="statData.deviceCount" change-text="" color="blue" :icon="DeviceIcon" />
      <StatCard label="设备类别数量" :value="statData.categorycount" change-text="" color="green" :icon="CategoryIcon" />
      <StatCard label="采集点位数" :value="statData.attributeCount" change-text="" color="orange" :icon="PointIcon" />
      <StatCard label="好的数据数" :value="statData.goodQualityCount" change-text="" color="purple" :icon="GoodIcon" />
    </div>
    <!-- 一级 tab 页签（数据来自 /bems/monitorSource/tree 接口） -->
    <a-tabs
      v-if="categoryData.length"
      v-model:activeKey="activeCategory"
      centered
      class="page-tabs"
      :destroy-inactive-tab-pane="true"
      @change="handleCategoryChange"
    >
      <a-tab-pane v-for="category in categoryData" :key="category.key" :tab="category.value">
        <!-- 有 children 字段：在第一层 tab 页下面生成二级 tab 页 -->
        <template v-if="category.children && category.children.length">
          <a-tabs v-model:activeKey="activeChild" size="small" class="sub-level-tabs">
            <a-tab-pane v-for="child in category.children" :key="child.key" :tab="child.value">
              <div class="component-container">
                <DeviceDataTable v-if="child.deviceId != null" :deviceId="child.deviceId" />
                <div v-else class="empty-state">该分类暂无组件</div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </template>
        <!-- 无 children：直接展示该分类组件 -->
        <div v-else class="component-container">
          <DeviceDataTable v-if="category.deviceId != null" :deviceId="category.deviceId" />
          <div v-else class="empty-state">该分类暂无组件</div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <!-- 加载中 / 无数据提示 -->
    <div v-else class="empty-page">
      {{ isLoaded ? '暂无监测源分类数据，请检查 /bems/monitorSource/tree 接口返回' : '监测源数据加载中…' }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, h } from 'vue';
  import { getMonitorSourceTree, getDeviceStatistics } from './index.api';
  import DeviceDataTable from './components/DeviceDataTable.vue';
  import StatCard from './components/StatCard.vue';

  // 统计卡片图标（emoji）
  const DeviceIcon = () => h('span', { style: 'font-size: 20px;' }, '🖥️');
  const CategoryIcon = () => h('span', { style: 'font-size: 20px;' }, '🗂️');
  const PointIcon = () => h('span', { style: 'font-size: 20px;' }, '📍');
  const GoodIcon = () => h('span', { style: 'font-size: 20px;' }, '✅');

  // 顶部统计数据
  const statData = ref({
    deviceCount: '--',
    categorycount: '--',
    attributeCount: '--',
    goodQualityCount: '--',
  });

  interface MonitorTreeNode {
    key: string;
    value: string;
    // 设备节点对应的 deviceId（来自 /bems/monitorSource/tree），点击标签时传给 queryPage 统一查询
    deviceId?: string | number;
    children?: MonitorTreeNode[];
  }

  // 页签数据（完全由 /bems/monitorSource/tree 接口返回）
  const categoryData = ref<MonitorTreeNode[]>([]);

  // 当前选中的一级页签 / 二级页签
  const activeCategory = ref<string>('');
  const activeChild = ref<string>('');

  // 接口是否加载完成（用于区分加载中/无数据）
  const isLoaded = ref(false);

  // 常见列表包装字段，兼容后端返回 { list/records/data/... } 而非纯数组的情况
  const LIST_WRAP_FIELDS = ['list', 'records', 'result', 'data', 'tree', 'rows', 'items', 'children'];

  const resolveList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object') {
      for (const field of LIST_WRAP_FIELDS) {
        if (Array.isArray(payload[field])) return payload[field];
      }
    }
    return [];
  };

  /**
   * 接口数据归一化
   * 一级（分类）节点：key 取 categoryId，value 取 categoryName
   * 二级（设备）节点：key 取 deviceId（唯一），value 取 deviceName，deviceId 原样保留用于 queryPage 查询
   */
  const normalizeTreeData = (data: any[]): MonitorTreeNode[] => {
    const normalizeCategory = (item: any): MonitorTreeNode | null => {
      if (!item || typeof item !== 'object') return null;
      const node: MonitorTreeNode = {
        key: String(item.key ?? item.categoryId ?? item.code ?? item.id ?? ''),
        value: String(item.value ?? item.categoryName ?? item.name ?? item.title ?? item.label ?? item.text ?? ''),
        deviceId: item.deviceId ?? item.id,
      };
      if (!node.key || !node.value) return null;
      if (Array.isArray(item.children) && item.children.length) {
        const children = item.children
          .map(normalizeDevice)
          .filter((child): child is MonitorTreeNode => !!child);
        if (children.length) node.children = children;
      }
      return node;
    };

    const normalizeDevice = (item: any): MonitorTreeNode | null => {
      if (!item || typeof item !== 'object') return null;
      const deviceId = item.deviceId ?? item.id;
      // tab 唯一 key：优先 deviceId（数字唯一），回退 deviceCode
      const devKey = String(deviceId ?? item.deviceCode ?? item.code ?? '');
      const value = String(item.deviceName ?? item.name ?? item.value ?? item.title ?? item.label ?? '');
      if (!devKey || !value) return null;
      const node: MonitorTreeNode = {
        key: devKey,
        value,
        deviceId,
      };
      return node;
    };

    return data.map(normalizeCategory).filter((node): node is MonitorTreeNode => !!node);
  };

  // 默认选中第一个一级页签（有 children 时联动选中第一个二级页签）
  const selectDefaultTab = () => {
    const first = categoryData.value[0];
    if (!first) return;
    activeCategory.value = first.key;
    activeChild.value = first.children && first.children.length ? first.children[0].key : '';
  };

  // 切换一级页签时，联动选中其第一个二级页签（无 children 则清空）
  const handleCategoryChange = (key: string) => {
    const category = categoryData.value.find((item) => item.key === key);
    activeChild.value = category?.children?.length ? category.children[0].key : '';
  };

  // 初始化：调用接口获取页签数据
  const fetchCategoryData = async () => {
    try {
      const res: any = await getMonitorSourceTree();
      categoryData.value = normalizeTreeData(resolveList(res));
      if (!categoryData.value.length) {
        // 便于排查：接口成功但解析不出页签数据时，打印原始返回结构
        console.warn('[/bems/monitorSource/tree] 返回数据为空或字段无法解析，原始返回：', res);
      }
    } catch (e) {
      console.error('获取监测源页签数据失败', e);
      categoryData.value = [];
    } finally {
      isLoaded.value = true;
    }
    selectDefaultTab();
  };

  // 获取顶部统计数据
  const fetchStatistics = async () => {
    try {
      const res: any = await getDeviceStatistics();
      if (res) {
        statData.value = {
          deviceCount: res.deviceCount ?? '--',
          categorycount: res.categorycount ?? res.categoryCount ?? '--',
          attributeCount: res.attributeCount ?? '--',
          goodQualityCount: res.goodQualityCount ?? '--',
        };
      }
    } catch (e) {
      console.error('获取监测源统计数据失败', e);
    }
  };

  onMounted(() => {
    fetchStatistics();
    fetchCategoryData();
  });
</script>

<style scoped lang="less">
  .monitoring-source-main-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: #fff;
  }

  /* 顶部统计卡片 */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    padding: 16px 16px 0;
    flex-shrink: 0;
  }

  /* 一级页签：参考 standardizedManagement 的 tab 页 */
  .page-tabs {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #fff;

    :deep(.ant-tabs-nav) {
      margin: 0;
    }

    :deep(.ant-tabs-content-holder) {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }

    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }

  /* 二级页签 */
  .sub-level-tabs {
    padding: 8px 8px 0;
    background: #f7f7f7;

    :deep(.ant-tabs-nav) {
      margin: 0 0 0 16px;
    }
  }

  .component-container {
    height: 100%;
    overflow: auto;
    padding: 16px;
    background: #f0f2f5;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: #999;
    font-size: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .empty-page {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 14px;
    background: #fff;
  }
</style>
