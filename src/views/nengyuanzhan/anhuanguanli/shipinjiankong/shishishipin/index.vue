<template>
  <div class="app-container">
    <a-row :gutter="10">
      <a-col :span="4">
        <a-card>
          <a-tabs v-model:activeKey="activeKey" size="small" type="card">
            <!--            <a-tab-pane key="1" tab="设备列表">-->
            <!--              <div class="treeBox">-->
            <!--                <ShebeiList ref="leftTree" @select="onTreeSelect" />-->
            <!--              </div>-->
            <!--            </a-tab-pane>-->
            <a-tab-pane key="2" force-render tab="摄像机组">
              <div class="treeBox">
                <!--                <Tree :data-source="treeData" @on-select="handleNodeSelect" />-->
                <DepartLeftTree ref="leftTree" @rootTreeData="onRootTreeData" @select="onTreeSelect" />
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-card>
        <a-card class="mt2" size="small" title="云台控制">
          <div class="flex justify-around items-start gap-4">
            <div class="yuanchengBox">
              <div class="flex justify-center">
                <a-button @click="onClickPtzControl('UP')" class="text-white" preIcon="ant-design:up-circle-outlined" type="link"></a-button>
              </div>
              <div class="flex justify-between mt3 mb3">
                <a-button @click="onClickPtzControl('LEFT')" class="text-white" preIcon="ant-design:left-circle-outlined" type="link"></a-button>
                <a-button @click="onClickPtzControl('RIGHT')" class="text-white" preIcon="ant-design:right-circle-outlined" type="link"></a-button>
              </div>
              <div class="flex justify-center">
                <a-button @click="onClickPtzControl('DOWN')" class="text-white" preIcon="ant-design:down-circle-outlined" type="link"></a-button>
              </div>
            </div>
            <div>
              <a-space>
                <a-button @click="onClickPtzControl('ZOOM_IN')" preIcon="ant-design:zoom-in-outlined" type="primary"></a-button>
                <a-button @click="onClickPtzControl('ZOOM_OUT')" preIcon="ant-design:zoom-out-outlined" type="primary"></a-button>
              </a-space>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="20">
        <a-card>
          <div class="video-player-panel">
            <div :class="['player_container', `player_container_${radio}`]">
              <div v-for="(item, index) in playerList" :key="item.index" :class="['player_item', { player_item_active: activeSlotIndex === index }]">
                <button
                  type="button"
                  class="player_click_mask"
                  :class="{ player_click_mask_active: activeSlotIndex === index }"
                  :aria-label="`选择${item.index}号窗口`"
                  @click="setActiveSlot(index)"
                ></button>
                <div class="slot_header">
                  <span class="slot_index">{{ item.index }}</span>
                  <span class="slot_name">{{ item.cameraName || '未选择摄像头' }}</span>
                </div>
                <div :id="`player_box${item.index}`" class="player_box"></div>
              </div>
            </div>

            <div class="status-row">
              <label class="audio-switch">
                <input :checked="config.hasAudio" type="checkbox" @click.prevent="onUse('hasAudio')" />
                <span>音频</span>
              </label>
              <div class="active-slot-info">{{ activeSlotLabel }}</div>
            </div>

            <div class="control-row">
              <div class="control-actions">
                <div v-if="activeSlotPlaying" class="radio-item" @click="onReplay">重播</div>
                <div v-else class="radio-item" @click="onPlayer">播放</div>
                <div class="radio-item" @click="onPause">暂停</div>
                <div class="radio-item" @click="onMute">静音</div>
                <div class="radio-item" @click="setFullscreen">全屏</div>
                <div v-if="activeSlotPlaying || activeSlot?.cameraCode" class="radio-item" @click="onStop">注销</div>
              </div>

              <div class="radio-container control-screens">
                <div
                  v-for="item in radioList"
                  :key="item.value"
                  :class="['radio-item', { 'radio-active': radio === item.value }]"
                  @click="onRadio(item.value)"
                >
                  {{ item.label }}
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
  import DepartLeftTree from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinshebeiguanli/components/DepartLeftTree.vue';
  import { useEasyPlayerList } from '@/views/nengyuanzhan/anhuanguanli/hooks/useEasyPlayer';
  import { useGlobSetting } from '/@/hooks/setting';
  import { setPtzControl } from '@/views/nengyuanzhan/anhuanguanli/shipinjiankong/shishishipin/depart.api';

  interface VideoTreeNode {
    key?: string;
    title?: string;
    name?: string;
    camera?: string;
    cameraCode?: string;
    deviceCode?: string;
    children?: VideoTreeNode[];
  }

  interface PlayerSlot {
    index: number;
    player: any | null;
    deviceCode: string;
    cameraCode: string;
    cameraName: string;
    playUrl: string;
    isPlaying: boolean;
  }

  interface PlayerSlotSnapshot {
    deviceCode: string;
    cameraCode: string;
    cameraName: string;
    playUrl: string;
    isPlaying: boolean;
  }

  type PlayerControlType = 'hasAudio' | 'MSE' | 'WCS';

  const activeKey = ref('2');
  const glob = useGlobSetting();
  const leftTree = ref<{ setSelectedNode?: (data: VideoTreeNode, shouldEmit?: boolean) => void } | null>(null);
  const radio = ref(4);
  const radioList = [
    { label: '单分屏', value: 1 },
    { label: '四分屏', value: 4 },
    { label: '九分屏', value: 9 },
  ];
  const activeSlotIndex = ref(0);
  const rootTreeData = ref<VideoTreeNode[]>([]);
  const hasResolvedDefaultCamera = ref(false);
  const config = reactive({
    hasAudio: true,
    MSE: false,
    WCS: false,
  });
  const playerList = ref<PlayerSlot[]>([]);
  const reconnectVersions = new Map<number, number>();
  const {
    create: createPlayer,
    destroy: destroyPlayers,
    getPlayer,
    pause: pausePlayer,
    play: playPlayer,
    setFullscreen: setPlayerFullscreen,
    setMute: setPlayerMute,
  } = useEasyPlayerList();

  const activeSlot = computed(() => playerList.value[activeSlotIndex.value] || null);
  const activeSlotPlaying = computed(() => Boolean(activeSlot.value?.isPlaying));
  const activeSlotLabel = computed(() => {
    const slot = activeSlot.value;
    if (!slot) {
      return '当前未选择宫格';
    }

    if (slot.cameraName) {
      return `当前操作窗口：${slot.index}号 - ${slot.cameraName}`;
    }

    return `当前操作窗口：${slot.index}号 - 未选择摄像头`;
  });

  function createEmptySlot(index: number): PlayerSlot {
    return {
      index,
      player: null,
      deviceCode: '',
      cameraCode: '',
      cameraName: '',
      playUrl: '',
      isPlaying: false,
    };
  }

  function createSlotSnapshot(slot?: PlayerSlot | null): PlayerSlotSnapshot {
    return {
      deviceCode: slot?.deviceCode || '',
      cameraCode: slot?.cameraCode || '',
      cameraName: slot?.cameraName || '',
      playUrl: slot?.playUrl || '',
      isPlaying: Boolean(slot?.isPlaying),
    };
  }

  function buildSlot(index: number, snapshot: Partial<PlayerSlotSnapshot> = {}): PlayerSlot {
    return {
      ...createEmptySlot(index),
      ...snapshot,
      index,
      player: null,
    };
  }

  function getSlot(slotIndex = activeSlotIndex.value) {
    return playerList.value[slotIndex] || null;
  }

  function getPlayerAt(slotIndex = activeSlotIndex.value) {
    return getSlot(slotIndex)?.player || getPlayer(slotIndex) || null;
  }

  function getCameraName(data: VideoTreeNode) {
    return data?.title || data?.name || '未命名摄像头';
  }

  function isCameraNode(data?: VideoTreeNode | null) {
    return data?.camera === 'true';
  }

  async function setActiveSlot(index: number) {
    if (index < 0 || index >= playerList.value.length) {
      return;
    }
    activeSlotIndex.value = index;

    if (getSlot(index)?.cameraCode) {
      await reconnectSlot(index);
    }
  }

  function findFirstPlayableNode(nodes: VideoTreeNode[] = []): VideoTreeNode | null {
    for (const node of nodes) {
      if (isCameraNode(node)) {
        return node;
      }

      const childNode = findFirstPlayableNode(node.children || []);
      if (childNode) {
        return childNode;
      }
    }

    return null;
  }

  function getVideoWebSocketUrl(cameraCode: string) {
    if (!cameraCode) {
      return '';
    }

    const webSocketDomain = glob.domainUrl?.replace('https://', 'wss://').replace('http://', 'ws://');
    return webSocketDomain ? `${webSocketDomain}/websocket/flv/${encodeURIComponent(cameraCode)}` : '';
  }

  async function createPlayerForSlot(slotIndex: number) {
    const slot = getSlot(slotIndex);
    if (!slot) {
      return null;
    }

    const player = await createPlayer(slotIndex, `player_box${slot.index}`, {
      MSE: config.MSE,
      WCS: config.WCS,
      hasAudio: config.hasAudio,
    });

    slot.player = player;
    return player;
  }

  async function createVisiblePlayers() {
    for (let index = 0; index < playerList.value.length; index += 1) {
      await createPlayerForSlot(index);
    }
  }

  async function destroySlotPlayer(slotIndex: number, clearSource = false) {
    const slot = getSlot(slotIndex);
    if (!slot) {
      return;
    }

    await destroyPlayers(slotIndex);
    slot.player = null;
    slot.isPlaying = false;

    if (clearSource) {
      slot.deviceCode = '';
      slot.cameraCode = '';
      slot.cameraName = '';
      slot.playUrl = '';
    }
  }

  async function destroyAllPlayers() {
    playerList.value.forEach((_, index) => cancelPendingReconnect(index));
    await destroyPlayers();
    playerList.value.forEach((slot) => {
      slot.player = null;
      slot.isPlaying = false;
    });
  }

  async function playSlotByCameraCode(slotIndex: number) {
    const slot = getSlot(slotIndex);
    if (!slot?.cameraCode) {
      return;
    }

    const url = getVideoWebSocketUrl(slot.cameraCode);
    if (!url) {
      return;
    }

    if (!getPlayerAt(slotIndex)) {
      await createPlayerForSlot(slotIndex);
    }

    slot.playUrl = url;
    slot.isPlaying = true;

    await playPlayer(slotIndex, url, 'play', (error) => {
      slot.isPlaying = false;
      console.error(error);
    });
  }

  async function reconnectSlot(slotIndex: number) {
    const slot = getSlot(slotIndex);
    if (!slot?.cameraCode) {
      return;
    }

    const reconnectVersion = (reconnectVersions.get(slotIndex) || 0) + 1;
    reconnectVersions.set(slotIndex, reconnectVersion);

    await destroySlotPlayer(slotIndex);
    if (reconnectVersions.get(slotIndex) !== reconnectVersion) {
      return;
    }

    await nextTick();
    await createPlayerForSlot(slotIndex);
    if (reconnectVersions.get(slotIndex) !== reconnectVersion) {
      return;
    }

    await playSlotByCameraCode(slotIndex);
  }

  function cancelPendingReconnect(slotIndex: number) {
    reconnectVersions.set(slotIndex, (reconnectVersions.get(slotIndex) || 0) + 1);
  }

  async function initializeSlots() {
    playerList.value = Array.from({ length: radio.value }, (_, index) => createEmptySlot(index + 1));
    activeSlotIndex.value = 0;
    await nextTick();
    await createVisiblePlayers();
  }

  async function rebuildPlayersWithSnapshots(nextCount = radio.value) {
    const preservedSlots = playerList.value.slice(0, Math.min(nextCount, playerList.value.length)).map((slot) => createSlotSnapshot(slot));

    await destroyAllPlayers();
    playerList.value = Array.from({ length: nextCount }, (_, index) => buildSlot(index + 1, preservedSlots[index]));
    activeSlotIndex.value = Math.min(activeSlotIndex.value, nextCount - 1);

    await nextTick();
    await createVisiblePlayers();

    for (let index = 0; index < preservedSlots.length; index += 1) {
      if (preservedSlots[index]?.isPlaying && preservedSlots[index]?.cameraCode) {
        await playSlotByCameraCode(index);
      }
    }
  }

  async function tryResolveDefaultCamera() {
    if (hasResolvedDefaultCamera.value || !playerList.value.length || rootTreeData.value.length === 0) {
      return;
    }

    const firstCamera = findFirstPlayableNode(rootTreeData.value);
    if (!firstCamera) {
      return;
    }

    leftTree.value?.setSelectedNode?.(firstCamera, true);
  }

  function onRootTreeData(data: VideoTreeNode[]) {
    rootTreeData.value = Array.isArray(data) ? data : [];
    void tryResolveDefaultCamera();
  }

  async function onTreeSelect(data: VideoTreeNode) {
    if (!isCameraNode(data)) {
      message.error('请选择摄像头!');
      return;
    }

    const slot = activeSlot.value;
    if (!slot) {
      message.error('当前分屏不可用，请重新选择分屏后再试!');
      return;
    }

    const cameraCode = data.cameraCode || '';
    if (!cameraCode) {
      message.error('未获取到摄像头编码!');
      return;
    }

    const deviceCode = data.deviceCode || data.key || '';

    hasResolvedDefaultCamera.value = true;
    slot.deviceCode = deviceCode;
    slot.cameraCode = cameraCode;
    slot.cameraName = getCameraName(data);
    slot.playUrl = getVideoWebSocketUrl(cameraCode);

    await reconnectSlot(activeSlotIndex.value);
  }

  // 云台控制
  function onClickPtzControl(command: string) {
    const deviceCode = activeSlot.value?.deviceCode;
    if (deviceCode) {
      setPtzControl({
        command,
        deviceCode,
      });
    } else {
      message.error('请选择右侧屏,然后选择摄像头后再远程操作!');
    }
  }

  async function onPlayer() {
    const slot = activeSlot.value;
    if (!slot?.cameraCode) {
      message.warning('请先选择摄像头!');
      return;
    }

    await playSlotByCameraCode(activeSlotIndex.value);
  }

  function onPause() {
    const slot = activeSlot.value;
    if (!slot) {
      return;
    }

    pausePlayer(activeSlotIndex.value);
    slot.isPlaying = false;
  }

  function onMute() {
    setPlayerMute(activeSlotIndex.value, true);
  }

  function setFullscreen() {
    setPlayerFullscreen(activeSlotIndex.value, true);
  }

  async function onReplay() {
    const slot = activeSlot.value;
    if (!slot?.cameraCode) {
      message.warning('请先选择摄像头!');
      return;
    }

    await reconnectSlot(activeSlotIndex.value);
  }

  async function onStop() {
    const slot = activeSlot.value;
    if (!slot) {
      return;
    }

    cancelPendingReconnect(activeSlotIndex.value);
    await destroySlotPlayer(activeSlotIndex.value, true);
    await nextTick();
    await createPlayerForSlot(activeSlotIndex.value);
  }

  async function onUse(type: PlayerControlType) {
    if (type === 'hasAudio') {
      config.hasAudio = !config.hasAudio;
      await rebuildPlayersWithSnapshots();
      return;
    }

    config.MSE = type === 'MSE';
    config.WCS = type === 'WCS';
    await rebuildPlayersWithSnapshots();
  }

  async function onRadio(val: number) {
    const nextCount = Number(val);
    if (nextCount === radio.value) {
      return;
    }

    radio.value = nextCount;
    await rebuildPlayersWithSnapshots(nextCount);
  }

  onMounted(() => {
    void initializeSlots().then(() => tryResolveDefaultCamera());
  });
  onBeforeUnmount(() => {
    void destroyAllPlayers();
  });
</script>

<style lang="less" scoped>
  .app-container {
    padding: 10px;

    :deep(.ant-card-body) {
      padding: 10px;
    }

    .treeBox {
      height: calc(100vh - 390px);
      overflow: auto;
    }

    .yuanchengBox {
      width: 120px;
      height: 120px;
      background: url('@/assets/images/yuanchengBg.png') no-repeat;
      background-size: 100% 100%;
    }
  }

  .radio-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .radio-item {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px #ccc solid;
    transition: all 0.2s ease;
  }

  .radio-active {
    color: #fff;
    background-color: #07baf4;
    border-color: #07baf4;
  }

  .player_container {
    display: grid;
    gap: 8px;
  }

  .player_container_1 {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .player_container_4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .player_container_9 {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }

  .player_container_16 {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
  }

  .player_container_25 {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  }

  .player_container_36 {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
  }

  .player_item {
    position: relative;
    padding-bottom: 56%;
    background-color: #000;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .player_item_active {
    border-color: #07baf4;
    box-shadow:
      0 0 0 1px rgba(7, 186, 244, 0.25),
      0 0 20px rgba(7, 186, 244, 0.18);
  }

  .slot_header {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    color: #fff;
    font-size: 12px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.12));
  }

  .player_click_mask {
    position: absolute;
    inset: 0;
    z-index: 1;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .player_click_mask_active {
    cursor: default;
  }

  .slot_index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: rgba(7, 186, 244, 0.88);
    font-weight: 700;
  }

  .slot_name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player_box {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .video-player-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .status-row,
  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .audio-switch {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #303133;
  }

  .control-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .control-screens {
    margin-left: auto;
    justify-content: flex-end;
  }

  .active-slot-info {
    min-width: 0;
    color: #606266;
    font-size: 14px;
  }

  .audio-switch input {
    cursor: pointer;
  }

  .control-actions .radio-item,
  .control-screens .radio-item {
    margin-right: 0;
  }
</style>
