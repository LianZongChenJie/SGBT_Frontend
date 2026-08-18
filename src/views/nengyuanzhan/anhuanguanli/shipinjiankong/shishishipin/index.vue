<template>
  <div class="app-container">
    <a-row :gutter="10">
      <a-col :span="4" class="realtime-sidebar-column">
        <div class="realtime-sidebar">
          <a-card class="realtime-tree-card">
            <div class="treeBox">
              <DepartLeftTree @select="onTreeSelect" />
            </div>
          </a-card>
          <a-card class="mt2 realtime-ptz-card" size="small" title="云台控制">
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
        </div>
      </a-col>
      <a-col :span="20" class="realtime-video-column">
        <a-card class="realtime-video-card">
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
              <div class="active-slot-info">{{ activeSlotLabel }}</div>
            </div>

            <div class="control-row">
              <div class="control-actions">
                <div class="radio-item" @click="setFullscreen">全屏</div>
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
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref } from 'vue';
  import { useWebSocket } from '@vueuse/core';
  import DepartLeftTree from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinshebeiguanli/components/DepartLeftTree.vue';
  import { useEasyPlayerList } from '@/views/nengyuanzhan/anhuanguanli/hooks/useEasyPlayer';
  import { useGlobSetting } from '/@/hooks/setting';
  import { setPtzControl } from '@/views/nengyuanzhan/anhuanguanli/shipinjiankong/shishishipin/depart.api';
  import { useUserStore } from '/@/store/modules/user';
  import { getToken } from '/@/utils/auth';
  import md5 from 'crypto-js/md5';

  interface VideoTreeNode {
    [key: string]: any;
    key?: string | number;
    value?: string | number;
    id?: string | number;
    title?: string;
    name?: string;
    camera?: string;
    cameraCode?: string | number;
    deviceCode?: string | number;
    children?: VideoTreeNode[];
  }

  interface PlayerSlot {
    index: number;
    player: any | null;
    deviceCode: string;
    cameraCode: string;
    cameraName: string;
    playUrl: string;
    streamId: string;
    isPlaying: boolean;
  }

  interface PlayerSlotSnapshot {
    deviceCode: string;
    cameraCode: string;
    cameraName: string;
    playUrl: string;
    streamId: string;
    isPlaying: boolean;
  }

  interface VideoCommand {
    cmd: 'play' | 'stop';
    cameraCode: string;
    windowIndex: string;
    streamId?: string;
  }

  interface VideoCommandResult {
    cmd?: string;
    status?: string;
    massage?: string;
    message?: string;
    windowIndex?: string | number;
    url?: string;
    streamId?: string;
  }

  const glob = useGlobSetting();
  const userStore = useUserStore();
  const radio = ref(4);
  const radioList = [
    { label: '单分屏', value: 1 },
    { label: '四分屏', value: 4 },
    { label: '九分屏', value: 9 },
  ];
  const activeSlotIndex = ref(0);
  const playerList = ref<PlayerSlot[]>([]);
  const manualTargetSlotIndex = ref<number | null>(null);
  const videoCommandSocketUrl = ref('');
  const pendingPlayCommands = new Map<number, VideoCommand>();
  const inFlightPlayCommands = new Map<number, VideoCommand>();
  const pendingStopCommands = new Map<string, VideoCommand>();
  const videoSocket = useWebSocket(videoCommandSocketUrl, {
    immediate: false,
    autoReconnect: {
      retries: 10,
      delay: 5000,
    },
    heartbeat: {
      message: 'ping',
      interval: 5000,
    },
    protocols: [(getToken() || '') as string],
    onConnected: (socket) => {
      console.log('[实时视频命令 WebSocket] 连接成功', {
        url: socket.url,
        status: socket.readyState,
      });
      flushPendingCommands();
    },
    onDisconnected: (socket, event) => {
      console.warn('[实时视频命令 WebSocket] 连接断开', {
        url: socket.url,
        status: socket.readyState,
        event,
      });
      console.warn(`[实时视频命令 WebSocket] 断开详情 code=${event.code} reason=${event.reason || '(empty)'} wasClean=${event.wasClean}`);
      inFlightPlayCommands.clear();
    },
    onError: (socket, event) => {
      console.error('[实时视频命令 WebSocket] 连接失败', {
        url: socket.url,
        status: socket.readyState,
        event,
      });
    },
    onMessage: (_ws, event) => {
      console.log('[实时视频命令 WebSocket] 收到消息', event.data);
      try {
        if (event.data !== 'ping') {
          void handleVideoCommandMessage(JSON.parse(event.data));
        }
      } catch (error) {
        console.error('[实时视频] 无法解析命令 WebSocket 消息', error);
      }
    },
  });

  const {
    create: createPlayer,
    destroy: destroyPlayers,
    getPlayer,
    play: playPlayer,
    setFullscreen: setPlayerFullscreen,
  } = useEasyPlayerList((slotIndex) => ({
    websocketOpen: () => {
      const slot = getSlot(slotIndex);
      console.log('[实时视频] WebSocket 连接成功', slot?.playUrl, {
        slot: slotIndex + 1,
        cameraCode: slot?.cameraCode,
      });
    },
    websocketError: (error) => {
      const slot = getSlot(slotIndex);
      console.error('[实时视频] WebSocket 连接失败', {
        slot: slotIndex + 1,
        cameraCode: slot?.cameraCode,
        url: slot?.playUrl,
        error,
      });
    },
    websocketClose: (event) => {
      const slot = getSlot(slotIndex);
      console.warn('[实时视频] WebSocket 连接关闭', {
        slot: slotIndex + 1,
        cameraCode: slot?.cameraCode,
        url: slot?.playUrl,
        event,
      });
    },
  }));

  const activeSlot = computed(() => playerList.value[activeSlotIndex.value] || null);
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
      streamId: '',
      isPlaying: false,
    };
  }

  function createSlotSnapshot(slot?: PlayerSlot | null): PlayerSlotSnapshot {
    return {
      deviceCode: slot?.deviceCode || '',
      cameraCode: slot?.cameraCode || '',
      cameraName: slot?.cameraName || '',
      playUrl: slot?.playUrl || '',
      streamId: slot?.streamId || '',
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

  function getFirstCode(data: VideoTreeNode, fields: string[]) {
    for (const field of fields) {
      const value = data?.[field];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return String(value).trim();
      }
    }

    return '';
  }

  function getCameraCode(data: VideoTreeNode) {
    return getFirstCode(data, ['cameraCode', 'deviceCode', 'key', 'value', 'id', 'code']);
  }

  function getDeviceCode(data: VideoTreeNode) {
    return getFirstCode(data, ['deviceCode', 'deviceId', 'deviceNo', 'code', 'key', 'value', 'id', 'cameraCode']);
  }

  function isCameraNode(data?: VideoTreeNode | null) {
    return data?.camera === 'true';
  }

  function setActiveSlot(index: number) {
    if (index < 0 || index >= playerList.value.length) {
      return;
    }
    activeSlotIndex.value = index;
    manualTargetSlotIndex.value = index;
  }

  function consumeTargetSlotIndex() {
    const manualTargetIndex = manualTargetSlotIndex.value;
    manualTargetSlotIndex.value = null;

    if (manualTargetIndex !== null && getSlot(manualTargetIndex)) {
      return manualTargetIndex;
    }

    const emptySlotIndex = playerList.value.findIndex((slot) => !slot.cameraCode);
    return emptySlotIndex >= 0 ? emptySlotIndex : 0;
  }

  function getVideoCommandSocketUrl() {
    const token = getToken() || '';
    const wsClientId = md5(token).toString();
    const userId = `${unref(userStore.getUserInfo).id}_${wsClientId}`;
    const webSocketDomain = glob.domainUrl?.replace('https://', 'wss://').replace('http://', 'ws://');
    if (!webSocketDomain || !userId) {
      return '';
    }

    return `${webSocketDomain}/websocket/flv/${userId}`;
  }

  function initializeVideoCommandSocket() {
    const url = getVideoCommandSocketUrl();
    if (!url) {
      console.warn('[实时视频命令 WebSocket] 未生成连接地址', {
        domainUrl: glob.domainUrl,
        userId: unref(userStore.getUserInfo).id,
      });
      return;
    }

    console.log('[实时视频命令 WebSocket] 开始建立连接', url);
    if (videoCommandSocketUrl.value === url) {
      if (videoSocket.status.value !== 'OPEN' && videoSocket.status.value !== 'CONNECTING') {
        videoSocket.open();
      }
      return;
    }

    videoCommandSocketUrl.value = url;
  }

  function sendCommand(command: VideoCommand) {
    const messageText = JSON.stringify(command);
    if (videoSocket.status.value !== 'OPEN') {
      console.warn('[实时视频命令 WebSocket] 连接未就绪，命令暂存', {
        command,
        socketStatus: videoSocket.status.value,
        socketUrl: videoCommandSocketUrl.value,
      });
      return false;
    }

    const isSent = videoSocket.send(messageText);
    console.log('[实时视频命令 WebSocket] 发送命令结果', {
      isSent,
      message: messageText,
      socketStatus: videoSocket.status.value,
      socketUrl: videoCommandSocketUrl.value,
    });
    console.log(`[实时视频命令 WebSocket] 实际发送 isSent=${isSent} payload=${messageText}`);
    return isSent;
  }

  function sendPlayCommand(slotIndex: number, command: VideoCommand) {
    const inFlightCommand = inFlightPlayCommands.get(slotIndex);
    const pendingCommand = pendingPlayCommands.get(slotIndex);
    if (inFlightCommand?.cameraCode === command.cameraCode && inFlightCommand.windowIndex === command.windowIndex) {
      console.log('[实时视频命令 WebSocket] 当前窗口已有相同 play 命令发送中，跳过重复发送', command);
      return;
    }
    if (pendingCommand?.cameraCode === command.cameraCode && pendingCommand.windowIndex === command.windowIndex) {
      console.log('[实时视频命令 WebSocket] 当前窗口已有相同 play 命令待发送，跳过重复发送', command);
      return;
    }

    pendingPlayCommands.set(slotIndex, command);
    initializeVideoCommandSocket();

    if (videoSocket.status.value === 'CONNECTING') {
      console.log('[实时视频命令 WebSocket] 已暂存 play 命令，等待连接成功后立即发送', {
        command,
        socketUrl: videoCommandSocketUrl.value,
      });
      return;
    }

    if (!sendCommand(command)) {
      return;
    }

    pendingPlayCommands.delete(slotIndex);
    inFlightPlayCommands.set(slotIndex, command);
  }

  function requestPlay(slotIndex: number) {
    const slot = getSlot(slotIndex);
    if (!slot?.cameraCode) {
      return;
    }

    const command: VideoCommand = {
      cmd: 'play',
      cameraCode: slot.cameraCode,
      windowIndex: String(slot.index),
    };
    console.log('[实时视频命令 WebSocket] 准备发送 play 命令', command);
    sendPlayCommand(slotIndex, command);
  }

  function getStopCommandKey(command: VideoCommand) {
    return `${command.windowIndex}_${command.cameraCode}`;
  }

  function sendStopCommand(slot: PlayerSlot) {
    if (!slot.cameraCode) {
      return;
    }

    if (!slot.streamId) {
      console.warn('[实时视频命令 WebSocket] 未获取到 streamId，跳过 stop 命令', {
        cameraCode: slot.cameraCode,
        windowIndex: String(slot.index),
      });
      return;
    }

    const command: VideoCommand = {
      cmd: 'stop',
      cameraCode: slot.cameraCode,
      windowIndex: String(slot.index),
      streamId: slot.streamId,
    };
    if (!sendCommand(command)) {
      pendingStopCommands.set(getStopCommandKey(command), command);
      return;
    }

    pendingStopCommands.delete(getStopCommandKey(command));
  }

  function cancelPlayRequest(slotIndex: number) {
    pendingPlayCommands.delete(slotIndex);
    inFlightPlayCommands.delete(slotIndex);
  }

  function flushPendingCommands() {
    console.log('[实时视频命令 WebSocket] 开始同步待发送命令', {
      pendingStopCount: pendingStopCommands.size,
      pendingPlayCount: pendingPlayCommands.size,
    });

    pendingStopCommands.forEach((command) => {
      if (sendCommand(command)) {
        pendingStopCommands.delete(getStopCommandKey(command));
      }
    });

    pendingPlayCommands.forEach((command, slotIndex) => {
      if (sendCommand(command)) {
        pendingPlayCommands.delete(slotIndex);
        inFlightPlayCommands.set(slotIndex, command);
      }
    });
  }

  async function handleVideoCommandMessage(data: VideoCommandResult) {
    if (data?.message === '已停止' || data?.massage === '已停止') {
      return;
    }

    if (data?.cmd !== 'playResult') {
      return;
    }

    const slotIndex = playerList.value.findIndex((slot) => String(slot.index) === String(data.windowIndex));
    if (slotIndex < 0) {
      console.warn('[实时视频命令 WebSocket] 未找到返回消息对应窗口', data);
      return;
    }

    const inFlightCommand = inFlightPlayCommands.get(slotIndex);
    inFlightPlayCommands.delete(slotIndex);

    if (data.status !== 'success' || !data.url) {
      message.error(data.massage || data.message || '获取视频流地址失败');
      return;
    }

    const slot = getSlot(slotIndex);
    if (!slot) {
      return;
    }

    if (inFlightCommand && inFlightCommand.cameraCode !== slot.cameraCode) {
      console.warn('[实时视频命令 WebSocket] 忽略过期 playResult', {
        data,
        currentCameraCode: slot.cameraCode,
        inFlightCommand,
      });
      return;
    }

    slot.playUrl = data.url;
    slot.streamId = String(data.streamId || '');
    console.log('[实时视频] 使用后端返回地址播放', {
      slot: slotIndex + 1,
      cameraCode: slot.cameraCode,
      streamId: slot.streamId,
      url: slot.playUrl,
    });

    await destroySlotPlayer(slotIndex);
    await nextTick();
    await createPlayerForSlot(slotIndex);
    await playSlot(slotIndex);
  }
  async function createPlayerForSlot(slotIndex: number) {
    const slot = getSlot(slotIndex);
    if (!slot) {
      return null;
    }

    const player = await createPlayer(slotIndex, `player_box${slot.index}`, {
      MSE: false,
      WCS: false,
      hasAudio: true,
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
      slot.streamId = '';
    }
  }

  async function destroyAllPlayers() {
    await destroyPlayers();
    playerList.value.forEach((slot) => {
      slot.player = null;
      slot.isPlaying = false;
    });
  }

  async function playSlot(slotIndex: number) {
    const slot = getSlot(slotIndex);
    if (!slot) {
      return;
    }

    const url = slot.playUrl;
    if (!url) {
      message.warning('未获取到视频流地址');
      console.warn('[实时视频] 未获取到视频流地址', slot);
      return;
    }

    if (!getPlayerAt(slotIndex)) {
      await createPlayerForSlot(slotIndex);
    }

    slot.playUrl = url;
    slot.isPlaying = true;
    console.log('[实时视频] 播放地址', url, {
      slot: slotIndex + 1,
      cameraName: slot.cameraName,
      cameraCode: slot.cameraCode,
      deviceCode: slot.deviceCode,
    });

    await playPlayer(slotIndex, url, 'play', (error) => {
      slot.isPlaying = false;
      console.error('[实时视频] 播放失败', {
        slot: slotIndex + 1,
        cameraCode: slot.cameraCode,
        url,
        error,
      });
    });
  }

  async function initializeSlots() {
    playerList.value = Array.from({ length: radio.value }, (_, index) => createEmptySlot(index + 1));
    activeSlotIndex.value = 0;
    await nextTick();
    await createVisiblePlayers();
  }

  async function rebuildPlayersWithSnapshots(nextCount = radio.value) {
    const preservedSlots = playerList.value.slice(0, Math.min(nextCount, playerList.value.length)).map((slot) => createSlotSnapshot(slot));

    playerList.value.slice(nextCount).forEach((slot, index) => {
      cancelPlayRequest(nextCount + index);
      sendStopCommand(slot);
    });

    await destroyAllPlayers();
    playerList.value = Array.from({ length: nextCount }, (_, index) => buildSlot(index + 1, preservedSlots[index]));
    activeSlotIndex.value = Math.min(activeSlotIndex.value, nextCount - 1);
    if (manualTargetSlotIndex.value !== null && manualTargetSlotIndex.value >= nextCount) {
      manualTargetSlotIndex.value = null;
    }

    await nextTick();
    await createVisiblePlayers();

    for (let index = 0; index < preservedSlots.length; index += 1) {
      if (preservedSlots[index]?.isPlaying && preservedSlots[index]?.cameraCode) {
        await playSlot(index);
      }
    }
  }

  async function onTreeSelect(data: VideoTreeNode) {
    if (!isCameraNode(data)) {
      message.error('请选择摄像头!');
      return;
    }

    const cameraCode = getCameraCode(data);
    if (!cameraCode) {
      message.error('未获取到摄像头编码!');
      console.warn('[实时视频] 未获取到摄像头编码', data);
      return;
    }

    const targetSlotIndex = consumeTargetSlotIndex();
    const slot = getSlot(targetSlotIndex);
    if (!slot) {
      message.error('当前分屏不可用，请重新选择分屏后再试!');
      return;
    }

    activeSlotIndex.value = targetSlotIndex;
    const deviceCode = getDeviceCode(data) || cameraCode;
    const previousCameraCode = slot.cameraCode;
    const previousWindowIndex = slot.index;

    if (previousCameraCode === cameraCode && slot.playUrl) {
      if (slot.isPlaying) {
        console.log('[实时视频] 当前宫格已经在播放该摄像头，跳过重复播放', {
          slot: slot.index,
          cameraCode,
          url: slot.playUrl,
        });
        return;
      }
      slot.playUrl = '';
    }

    if (previousCameraCode && previousCameraCode !== cameraCode) {
      console.log('[实时视频] 当前宫格切换摄像头，先关闭旧播放器连接', {
        slot: previousWindowIndex,
        previousCameraCode,
        nextCameraCode: cameraCode,
      });
      sendStopCommand(slot);
      cancelPlayRequest(targetSlotIndex);
    }

    slot.deviceCode = deviceCode;
    slot.cameraCode = cameraCode;
    slot.cameraName = getCameraName(data);
    slot.playUrl = '';
    slot.streamId = '';

    await destroySlotPlayer(targetSlotIndex);
    requestPlay(targetSlotIndex);
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

  function setFullscreen() {
    setPlayerFullscreen(activeSlotIndex.value, true);
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
    void initializeSlots();
  });
  onBeforeUnmount(() => {
    playerList.value.forEach((slot, index) => {
      cancelPlayRequest(index);
      sendStopCommand(slot);
    });
    videoSocket.close();
    void destroyAllPlayers();
  });
</script>

<style lang="less" scoped>
  .app-container {
    box-sizing: border-box;
    height: calc(100vh - 110px);
    padding: 10px;
    overflow: hidden;

    :deep(.ant-card-body) {
      padding: 10px;
    }

    :deep(> .ant-row) {
      height: 100%;
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
    flex: 1;
    width: 100%;
    min-height: 0;
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
    min-height: 0;
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
    width: 100%;
    height: 100%;
    min-height: 0;
    gap: 16px;
    overflow: hidden;
  }

  .status-row,
  .control-row {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
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

  .control-actions .radio-item,
  .control-screens .radio-item {
    margin-right: 0;
  }

  .realtime-sidebar-column,
  .realtime-video-column {
    display: flex;
    height: 100%;
    min-height: 0;
  }

  .realtime-sidebar,
  .realtime-video-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .realtime-sidebar {
    overflow: hidden;
  }

  .realtime-tree-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    :deep(.ant-card-body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }
  }

  .treeBox {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .realtime-ptz-card {
    flex: 0 0 auto;
  }

  .realtime-video-card {
    width: 100%;
    overflow: hidden;

    :deep(.ant-card-body) {
      box-sizing: border-box;
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }
  }
</style>
