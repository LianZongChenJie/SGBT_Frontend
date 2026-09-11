<template>
  <div class="monitor-view">
    <!-- ===== 第一行：统计卡片 ===== -->
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in statCards"
        :key="index"
        :label="item.label"
        :value="item.value"
        :change-text="item.changeText"
        :color="item.color"
        :icon="item.icon"
      />
    </div>

    <!-- ===== 实时监控画面 ===== -->
    <div class="card">
      <div class="card-header">
        <h3><video-camera-outlined /> 实时监控画面</h3>
        <div class="monitor-actions">
          <a-radio-group v-model:value="gridLayout" button-style="solid" size="small">
            <a-radio-button :value="1">1×1</a-radio-button>
            <a-radio-button :value="2">2×2</a-radio-button>
            <a-radio-button :value="3">3×3</a-radio-button>
            <!-- 4×4 暂时隐藏 -->
            <!-- <a-radio-button :value="4">4×4</a-radio-button> -->
          </a-radio-group>
          <button class="collapse-btn" @click="monitorCollapsed = !monitorCollapsed">
            <caret-down-outlined v-if="!monitorCollapsed" />
            <caret-up-outlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!monitorCollapsed" class="card-body">
        <!-- 左右两栏：左侧固定宽度放摄像头选择，右侧展示监控画面 -->
        <div class="monitor-layout">
          <!-- 左侧：摄像头选择面板（原右侧抽屉内容） -->
          <aside class="camera-panel">
            <a-input-search
              v-model:value="cameraSearchValue"
              placeholder="搜索摄像头"
              allow-clear
              class="camera-search"
            />
            <div class="camera-tree-wrap">
              <a-spin :spinning="treeLoading">
                <a-tree
                  v-if="filteredCameraTreeData.length > 0"
                  v-model:checkedKeys="cameraCheckedKeys"
                  v-model:expandedKeys="cameraExpandedKeys"
                  :tree-data="filteredCameraTreeData"
                  checkable
                  :selectable="false"
                  show-line
                >
                  <!-- 分组节点名称后展示摄像头总数 -->
                  <template #title="node">
                    <span class="camera-tree-title">{{ node.title }}</span>
                    <span v-if="!node.isLeaf" class="camera-tree-count">{{ node.cameraCount ?? 0 }}</span>
                  </template>
                </a-tree>
                <a-empty v-else-if="!treeLoading" description="暂无摄像头数据" />
              </a-spin>
            </div>

            <!-- 已选摄像头（可在此取消选中） -->
            <div v-if="checkedCameras.length > 0" class="camera-checked-wrap">
              <div class="camera-checked-title">已选摄像头（{{ checkedCameras.length }}）</div>
              <div class="camera-checked-tags">
                <a-tag v-for="cam in checkedCameras" :key="cam.key" closable @close="removeCheckedCamera(cam.key)">
                  {{ cam.name }}
                </a-tag>
              </div>
            </div>

            <div class="camera-panel-footer">
              <span class="camera-selected-count">已选 {{ cameraCheckedLeafCount }} / 最多 {{ gridCapacity }}</span>
              <div>
                <a-button size="small" style="margin-right: 8px" @click="clearCheckedCameras">清空</a-button>
                <a-button size="small" type="primary" :loading="confirmLoading" @click="handleCameraSelectConfirm">
                  确认
                </a-button>
              </div>
            </div>
          </aside>

          <!-- 右侧：监控画面 -->
          <section class="monitor-stage">
            <CameraCarousel :cameras="cameraList" :layout="gridLayout" />
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import {
    VideoCameraOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ApartmentOutlined,
    CaretDownOutlined,
    CaretUpOutlined,
  } from '@ant-design/icons-vue';
  import StatCard from '/@/views/bems/monitoringSource/components/StatCard.vue';
  import CameraCarousel from './CameraCarousel/index.vue';
  import { getCameraPackageGroup, getCameraLocalPlayUrl } from '../index.api';
  import type { PackageGroup, PackageVideo } from '../index.api';

  interface CameraItem {
    id: number | string;
    cameraName: string;
    url?: string;
    indexCode?: string;
    /** 树节点 key，用于抽屉回填已选 */
    treeKey?: string;
  }

  /** 折叠状态 */
  const monitorCollapsed = ref(false);

  /** 监控画面网格布局：1=1×1, 2=2×2, 3=3×3, 4=4×4 */
  const gridLayout = ref(2);

  /** 当前布局容量：1×1=1, 2×2=4, 3×3=9, 4×4=16 */
  const gridCapacity = computed(() => gridLayout.value * gridLayout.value);

  /** ===== 统计卡片 ===== */
  const cameraTotalCount = ref(0);
  const cameraOnlineCount = ref(0);
  const cameraOfflineCount = ref(0);
  const groupCount = ref(0);

  /** 统计卡片配置与数据（第 2 张展示在线率） */
  const statCards = computed(() => {
    const total = cameraTotalCount.value;
    const online = cameraOnlineCount.value;
    const rate = total > 0 ? Math.floor((online / total) * 100) : 0;
    return [
      { label: '监控设备总数', value: total, changeText: '', color: 'blue' as const, icon: VideoCameraOutlined },
      { label: '在线设备数量', value: online, changeText: `在线率 ${rate}%`, color: 'green' as const, icon: CheckCircleOutlined },
      { label: '离线设备数量', value: cameraOfflineCount.value, changeText: '', color: 'red' as const, icon: WarningOutlined },
      { label: '监控分组数量', value: groupCount.value, changeText: '', color: 'purple' as const, icon: ApartmentOutlined },
    ];
  });

  /** ===== 摄像头树（选择面板与统计口径一致） ===== */
  const treeLoading = ref(false);
  const confirmLoading = ref(false);
  const cameraTreeData = ref<any[]>([]);
  const cameraExpandedKeys = ref<(string | number)[]>([]);
  const cameraSearchValue = ref('');
  /** 叶子 key → 摄像头（PackageVideo）映射，确认时用于取编码/名称 */
  const cameraLeafMap = new Map<string, PackageVideo>();

  /** 叶子 key 以 v- 开头 */
  const isLeafKey = (k: string | number): k is string => typeof k === 'string' && k.startsWith('v-');

  /** 取摄像头唯一编码：以 indexCode 为准，兼容旧格式 systemId（去 #）/id */
  const getVideoCode = (v: PackageVideo) =>
    String(v?.indexCode || (v?.systemId || '').replace(/#/g, '') || v?.id || '').trim();

  /** 从播放地址接口返回中提取可用地址（兼容字符串 / 对象 / 数组 / indexCode 映射结构） */
  const pickPlayUrl = (res: any): string => {
    if (!res) return '';
    if (typeof res === 'string') return res;
    if (Array.isArray(res)) return res.length ? pickPlayUrl(res[0]) : '';
    if (typeof res !== 'object') return '';
    for (const key of ['url', 'playUrl', 'playURL', 'playAddress', 'streamUrl', 'wsUrl', 'hls', 'rtsp']) {
      const value = res[key];
      if (typeof value === 'string' && value) return value;
    }
    for (const key of ['data', 'result', 'body']) {
      const value = res[key];
      if (value && typeof value === 'object') {
        const url = pickPlayUrl(value);
        if (url) return url;
      }
    }
    // 形如 { [indexCode]: 'ws://...' } 的映射
    const urls = Object.values(res).filter(
      (v): v is string => typeof v === 'string' && /^(https?|wss?|rtmp|rtsp):\/\//i.test(v),
    );
    return urls[0] || '';
  };

  /** 计算分组下（含子孙）摄像头总数 */
  const countGroupCameras = (g: PackageGroup): number => {
    const direct = (g?.videoList || []).length;
    const sub = (g?.children || []).reduce((sum, child) => sum + countGroupCameras(child), 0);
    return direct + sub;
  };

  /** 在线状态：online 为数值 1 或布尔 true 均视为在线 */
  const isVideoOnline = (v: PackageVideo) => v?.online === 1 || v?.online === '1' || v?.online === true;

  /**
   * 分组树 → a-tree treeData，并填充叶子映射
   * 与安防「选择摄像头」口径一致：摄像头取分组 videoList，子分组取 children，
   * 摄像头唯一编码取 indexCode（兼容旧格式 systemId/id）
   */
  const buildCameraTreeData = (groups: PackageGroup[]): any[] => {
    cameraLeafMap.clear();
    const walk = (list: PackageGroup[]): any[] =>
      (list || [])
        .map((g) => {
          const leaves = (g.videoList || []).map((v) => {
            const leafKey = `v-${getVideoCode(v)}`;
            cameraLeafMap.set(leafKey, v);
            return { title: v.name, key: leafKey, isLeaf: true };
          });
          const subChildren = walk(g.children || []);
          return {
            title: g.name,
            name: g.name,
            key: `grp-${g.indexCode || g.id}`,
            disableCheckbox: true,
            // 分组节点名称后展示其下摄像头总数
            cameraCount: countGroupCameras(g),
            children: [...leaves, ...subChildren],
          };
        })
        .filter((n) => n.children.length > 0);
    return walk(groups);
  };

  /** 统计分组数量（含子分组，忽略空分组） */
  const countGroups = (groups: PackageGroup[]): number =>
    (groups || []).reduce((sum, g) => {
      if (!(g?.videoList?.length || g?.children?.length)) return sum;
      return sum + 1 + countGroups(g?.children || []);
    }, 0);

  /** 收集所有分组 key（搜索时全部展开） */
  const collectGroupKeys = (nodes: any[]): (string | number)[] =>
    nodes.flatMap((n) => (n.isLeaf ? [] : [n.key, ...collectGroupKeys(n.children || [])]));

  /** 拉取摄像头分组包数据（/bems/hikvision/camera/packageGroup） */
  const loadCameraTree = async () => {
    treeLoading.value = true;
    try {
      const res = await getCameraPackageGroup();
      const groups: PackageGroup[] = Array.isArray(res) ? res : [];
      if (!groups.length) {
        // 便于排查：接口成功但无数据时打印原始返回结构
        console.warn('[bems/hikvision/camera/packageGroup] 返回数据为空，原始返回：', res);
      }
      cameraTreeData.value = buildCameraTreeData(groups);
      cameraExpandedKeys.value = cameraTreeData.value.map((n) => n.key);
      // 统计：总数 / 在线 / 离线 / 分组
      cameraTotalCount.value = cameraLeafMap.size;
      let online = 0;
      cameraLeafMap.forEach((v) => {
        if (isVideoOnline(v)) online += 1;
      });
      cameraOnlineCount.value = online;
      cameraOfflineCount.value = cameraTotalCount.value - online;
      groupCount.value = countGroups(groups);
    } catch (error) {
      console.error('获取监控摄像头树失败:', error);
    } finally {
      treeLoading.value = false;
    }
  };

  /** ===== 摄像头选择面板（原右下角抽拉抽屉内容，现常驻左侧固定宽度区域） ===== */
  const cameraCheckedKeys = ref<(string | number)[]>([]);
  /** 当前已选摄像头（全量，网格切换时按容量截断展示） */
  const selectedCameras = ref<CameraItem[]>([]);

  /** 监控画面展示列表：按当前网格容量截断 */
  const cameraList = computed(() => selectedCameras.value.slice(0, gridCapacity.value));

  /** 已选叶子数量 */
  const cameraCheckedLeafCount = computed(() => cameraCheckedKeys.value.filter(isLeafKey).length);

  /** 已选摄像头列表（树下方展示与取消用） */
  const checkedCameras = computed(() =>
    cameraCheckedKeys.value.filter(isLeafKey).map((k) => ({
      key: k,
      name: cameraLeafMap.get(k)?.name || k,
    })),
  );

  /** 搜索过滤：保留命中叶子及其祖先链 */
  const filteredCameraTreeData = computed(() => {
    const kw = cameraSearchValue.value.trim().toLowerCase();
    if (!kw) return cameraTreeData.value;
    const filterWalk = (nodes: any[]): any[] =>
      nodes
        .map((n) => {
          if (n.isLeaf) {
            const hit = String(n.title || '')
              .toLowerCase()
              .includes(kw);
            const selected = cameraCheckedKeys.value.includes(n.key);
            return hit || selected ? n : null;
          }
          if (
            String(n.title || '')
              .toLowerCase()
              .includes(kw)
          ) {
            return n;
          }
          const children = filterWalk(n.children || []);
          return children.length > 0 ? { ...n, children } : null;
        })
        .filter(Boolean);
    return filterWalk(cameraTreeData.value);
  });

  /** 搜索时展开所有分组 */
  watch(cameraSearchValue, (val) => {
    if (val) {
      cameraExpandedKeys.value = collectGroupKeys(cameraTreeData.value);
    }
  });

  /** 网格切换时，若已选路数超过当前容量则提示 */
  watch(gridLayout, () => {
    if (selectedCameras.value.length > gridCapacity.value) {
      message.warning(`当前布局最多展示 ${gridCapacity.value} 路，已截断显示`);
    }
  });

  /** 取消选中单个摄像头 */
  const removeCheckedCamera = (key: string) => {
    cameraCheckedKeys.value = cameraCheckedKeys.value.filter((k) => k !== key);
  };

  /** 清空已选（同时清除已上墙画面） */
  const clearCheckedCameras = () => {
    cameraCheckedKeys.value = [];
    selectedCameras.value = [];
  };

  /** 确认选择：调用 /bems/hikvision/camera/localPlayUrl 取播放地址，按网格容量上墙 */
  const handleCameraSelectConfirm = async () => {
    const leafKeys = cameraCheckedKeys.value.filter(isLeafKey);
    if (leafKeys.length === 0) {
      message.warning('请至少选择一个摄像头');
      return;
    }
    const cap = gridCapacity.value;
    if (leafKeys.length > cap) {
      message.warning(`当前布局最多展示 ${cap} 路，将只显示前 ${cap} 路`);
    }
    confirmLoading.value = true;
    try {
      // 逐路并行请求：cameraIndexCode 取选中摄像头（videoList 项）的 indexCode
      const list = await Promise.all(
        leafKeys.map(async (key): Promise<CameraItem | null> => {
          const v = cameraLeafMap.get(key);
          if (!v) return null;
          const indexCode = getVideoCode(v);
          let url = '';
          // 心跳 streamKey 取摄像头唯一编码 cameraIndexCode
          let streamKey = indexCode;
          if (indexCode) {
            try {
              // 接口返回：url 为 m3u8 播放地址，cameraIndexCode 为摄像头唯一编码
              const res = await getCameraLocalPlayUrl({ cameraIndexCode: indexCode });
              url = res?.url || pickPlayUrl(res) || '';
              // streamKey 优先取播放接口返回的 streamKey，其次取 cameraIndexCode
              streamKey = res?.streamKey || res?.cameraIndexCode || indexCode;
            } catch (error) {
              console.error('获取摄像头播放地址失败:', indexCode, error);
            }
          }
          // 接口未返回播放地址时，回退到树节点自带 url
          if (!url) url = v?.url || '';
          return {
            id: streamKey || key,
            cameraName: v.name,
            url,
            indexCode: streamKey,
            treeKey: key,
          };
        }),
      );
      selectedCameras.value = list.filter((item): item is CameraItem => !!item);
    } finally {
      confirmLoading.value = false;
    }
  };

  onMounted(() => {
    void loadCameraTree();
  });
</script>

<style scoped lang="less">
  // 页面灰色背景由 index.vue 的页签内容区提供，此处仅保证模块内容为白色
  .monitor-view {
    min-height: 100%;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 20px;
  }

  .card {
    // 模块内容保持白色背景
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    overflow: hidden;

    // 最后一张卡片去掉底部间距，避免与内容区底部留白叠加
    &:last-child {
      margin-bottom: 0;
    }

    .card-header {
      padding: 18px 22px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
      }
    }

    .card-body {
      padding: 22px;
    }
  }

  // 实时监控画面模块内部：左右两栏
  // 左栏绝对定位脱离文档流，容器高度完全由右侧监控画面决定，从而保证两者严格等高
  .monitor-layout {
    position: relative;
    // 左栏 300px + 16px 间距
    padding-left: 316px;
  }

  // 左侧：固定宽度，放原抽拉抽屉的全部内容（搜索 / 摄像头树 / 已选 / 操作）
  .camera-panel {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 12px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 8px;

    .camera-search {
      flex-shrink: 0;
      margin-bottom: 12px;
    }
  }

  // 右侧：监控画面
  .monitor-stage {
    min-width: 0;
  }

  // 窄屏下改为上下排列，避免左侧面板挤压监控画面
  @media (max-width: 1200px) {
    .monitor-layout {
      padding-left: 0;

      // 恢复为常规流式布局，左栏高度不再受右侧约束
      .camera-panel {
        position: static;
        width: 100%;
        margin-bottom: 16px;
      }

      .camera-tree-wrap {
        min-height: 240px;
        max-height: 340px;
      }
    }
  }

  .monitor-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .collapse-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      color: #1677ff;
      border-color: #1677ff;
    }
  }

  .camera-tree-wrap {
    flex: 1;
    // 允许压缩：左栏整体高度以右侧监控画面为准，保证两者始终等高
    min-height: 0;
    overflow-y: auto;

    // 隐藏分组节点的 checkbox（分组 disableCheckbox，仅摄像头叶子可勾选）
    :deep(.ant-tree-checkbox-disabled) {
      display: none;
    }

    .camera-tree-title {
      font-size: 13px;
    }

    // 分组节点后的摄像头总数徽标
    .camera-tree-count {
      display: inline-block;
      margin-left: 6px;
      padding: 0 6px;
      height: 18px;
      line-height: 18px;
      font-size: 12px;
      color: #8c8c8c;
      background: #f0f0f0;
      border-radius: 9px;
    }
  }

  .camera-checked-wrap {
    flex-shrink: 0;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    .camera-checked-title {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }

    .camera-checked-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 90px;
      overflow-y: auto;
    }
  }

  .camera-panel-footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }

  .camera-selected-count {
    color: #666;
    font-size: 12px;
  }
</style>
