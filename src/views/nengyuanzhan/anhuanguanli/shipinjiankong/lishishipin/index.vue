<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="app-container">
    <div ref="layoutRef" class="history-layout">
      <section class="history-sidebar-column" :style="sidebarWidth ? { width: `${sidebarWidth}px`, flex: '0 0 auto' } : undefined">
        <a-card class="history-sidebar-card">
          <div class="treeBox">
            <DepartLeftTree ref="leftTree" @select="onTreeSelect" />
          </div>

          <a-card class="mt2 history-search-card" size="small" title="录像搜索">
            <div class="history-table-container">
              <BasicTable class="history-record-table" @register="registerTable">
                <template #action="{ record }">
                  <TableAction :actions="getActions(record)" />
                </template>
              </BasicTable>
            </div>
          </a-card>
        </a-card>
      </section>
      <div class="history-resize-handle" @mousedown="startResize"></div>
      <section class="history-player-column">
        <a-card class="history-player-card">
          <div class="history-player-panel">
            <div class="player_container player_container_1">
              <div class="player_item">
                <div class="slot_header">
                  <span class="slot_index">回放</span>
                  <span class="slot_name">{{ currentHistoryLabel }}</span>
                </div>
                <div class="player_box" id="player_box1"></div>
              </div>
            </div>

            <div class="control-row">
              <div class="control-actions">
                <div v-if="isPlaying" class="radio-item" @click="onReplay">重播</div>
                <div v-else class="radio-item" @click="onPlayer">播放</div>
                <div class="radio-item" @click="onPause">暂停</div>
                <div class="radio-item" @click="setFullscreen">全屏</div>
              </div>
            </div>
          </div>
        </a-card>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup name="lishishipin">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import DepartLeftTree from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinshebeiguanli/components/DepartLeftTree.vue';
  import { useEasyPlayer } from '@/views/nengyuanzhan/anhuanguanli/hooks/useEasyPlayer';
  import { normalizeVideoStreamUrl } from '@/views/nengyuanzhan/anhuanguanli/utils/videoStreamUrl';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { columns, searchFormSchema } from './demo.data';
  import { closeHistoryPlayback, getDemoList, openHistoryPlayback } from './demo.api';

  interface VideoTreeNode {
    key?: string;
    camera?: string;
  }

  interface HistoryRecord {
    id?: string | number;
    beginTime?: string;
    endTime?: string;
  }

  const deviceCode = ref('');
  const layoutRef = ref<HTMLElement | null>(null);
  // 未拖拽时由左右两个 flex 区域均分宽度；开始拖拽后才记录左侧固定宽度。
  const sidebarWidth = ref(0);
  const videoUrl = ref('');
  const isPlaying = ref(false);
  const playbackId = ref('');
  const currentRecord = ref<HistoryRecord | null>(null);
  const {
    create: createPlayer,
    destroy: destroyPlayer,
    pause: pausePlayer,
    play: playPlayer,
    setFullscreen: setPlayerFullscreen,
  } = useEasyPlayer({
    playbackRate: (rate, player) => {
      player.setRate?.(rate);
    },
    playbackSeek: (time) => {
      seekHistoryVideo(Number(time));
    },
  });

  const currentHistoryLabel = computed(() => {
    const record = currentRecord.value;
    if (!record) {
      return '当前回放：未选择录像';
    }

    const beginTime = record.beginTime || '--';
    const endTime = record.endTime || '--';
    return `当前回放：${beginTime} 至 ${endTime}`;
  });

  const [registerTable] = useTable({
    api: getDemoList,
    immediate: false,
    columns,
    formConfig: {
      layout: 'horizontal',
      schemas: searchFormSchema,
      autoAdvancedCol: 3,
      actionColOptions: {
        span: 8,
        style: { paddingLeft: '8px', textAlign: 'left', whiteSpace: 'nowrap' },
      },
      showAdvancedButton: false,
    },
    beforeFetch: (params) => {
      return {
        ...params,
        deviceCode: deviceCode.value,
      };
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    pagination: false,
    canResize: false,
    scroll: { y: 'calc(100vh - 620px)' },
    rowKey: 'id',
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  function startResize(event: MouseEvent) {
    event.preventDefault();
    document.addEventListener('mousemove', resizeSidebar);
    document.addEventListener('mouseup', stopResize);
    document.body.classList.add('history-video-resizing');
  }

  function resizeSidebar(event: MouseEvent) {
    const layout = layoutRef.value;
    if (!layout) return;
    const { left, width } = layout.getBoundingClientRect();
    const minWidth = 280;
    const maxWidth = Math.max(minWidth, Math.floor(width * 0.55));
    sidebarWidth.value = Math.min(Math.max(event.clientX - left, minWidth), maxWidth);
  }

  function stopResize() {
    document.removeEventListener('mousemove', resizeSidebar);
    document.removeEventListener('mouseup', stopResize);
    document.body.classList.remove('history-video-resizing');
  }

  function getActions(record: HistoryRecord) {
    return [
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  async function resetPlaybackState(options: { clearRecord?: boolean } = {}) {
    isPlaying.value = false;
    await releasePlaybackProxy();

    if (options.clearRecord) {
      currentRecord.value = null;
      videoUrl.value = '';
    }

    await recreateHistoryPlayer();
  }

  async function onTreeSelect(data: VideoTreeNode) {
    if (data.camera === 'true') {
      deviceCode.value = data.key || '';
      await resetPlaybackState({ clearRecord: true });
    }
  }

  async function createHistoryPlayer() {
    return createPlayer('player_box1', {
      isLive: false,
      MSE: false,
      WCS: false,
      hasAudio: true,
      hiddenRightMenu: true,
    });
  }

  async function recreateHistoryPlayer() {
    await destroyPlayer();
    await nextTick();
    await createHistoryPlayer();
  }

  async function playHistoryVideo(url = videoUrl.value) {
    if (!url) {
      message.warning('请先选择录像记录');
      return;
    }

    isPlaying.value = true;
    await playPlayer(url, 'playback', (error) => {
      isPlaying.value = false;
      console.error(error);
    });
  }

  function seekHistoryVideo(time: number) {
    if (!Number.isFinite(time) || time < 0) return;
    const video = document.querySelector<HTMLVideoElement>('#player_box1 video');
    if (!video) return;

    let targetTime = time;
    const { seekable } = video;
    if (seekable.length > 0) {
      const rangeStart = seekable.start(0);
      const rangeEnd = seekable.end(seekable.length - 1);
      // MP4 代理可能是逐步生成的，拖动范围必须限制在浏览器已经可寻址的时间段内。
      targetTime = Math.min(Math.max(targetTime, rangeStart), Math.max(rangeStart, rangeEnd - 0.1));
    } else if (Number.isFinite(video.duration) && video.duration > 0) {
      targetTime = Math.min(targetTime, Math.max(0, video.duration - 0.1));
    } else {
      return;
    }

    if (Math.abs(video.currentTime - targetTime) > 0.05) {
      video.currentTime = targetTime;
    }
  }

  async function handleDetail(record: HistoryRecord) {
    if (!deviceCode.value) {
      message.warning('请先选择摄像头');
      return;
    }
    currentRecord.value = record;
    await openPlaybackProxy(record);
  }

  async function onPlayer() {
    if (!currentRecord.value) {
      message.warning('请先选择录像记录');
      return;
    }
    if (!playbackId.value) {
      await openPlaybackProxy(currentRecord.value);
      return;
    }
    await playHistoryVideo();
  }

  function onPause() {
    pausePlayer();
    isPlaying.value = false;
  }

  function setFullscreen() {
    setPlayerFullscreen(true);
  }

  async function onReplay() {
    if (!currentRecord.value) {
      message.warning('请先选择录像记录');
      return;
    }
    await openPlaybackProxy(currentRecord.value);
  }

  async function openPlaybackProxy(record: HistoryRecord) {
    if (!record.beginTime || !record.endTime) {
      message.warning('录像时间段不完整，无法播放');
      return;
    }

    await releasePlaybackProxy();
    isPlaying.value = false;
    try {
      const playback = await openHistoryPlayback({
        cameraIndexCode: deviceCode.value,
        beginTime: record.beginTime,
        endTime: record.endTime,
        recordLocation: 0,
        streamType: 1,
      });
      const streamUrl = normalizeVideoStreamUrl(playback.mp4Url || playback.wsFlvUrl || playback.httpFlvUrl);
      if (!playback.playbackId || !streamUrl) {
        throw new Error('未获取到历史回放播放地址');
      }
      playbackId.value = playback.playbackId;
      videoUrl.value = streamUrl;
      await recreateHistoryPlayer();
      await playHistoryVideo(streamUrl);
    } catch (error) {
      await releasePlaybackProxy();
      message.error(error instanceof Error ? error.message : '创建历史回放失败');
    }
  }

  async function releasePlaybackProxy() {
    const activePlaybackId = playbackId.value;
    playbackId.value = '';
    if (!activePlaybackId) return;
    try {
      await closeHistoryPlayback(activePlaybackId);
    } catch (error) {
      console.warn('关闭历史回放代理失败', error);
    }
  }

  onMounted(() => {
    void createHistoryPlayer();
  });

  onBeforeUnmount(() => {
    stopResize();
    void releasePlaybackProxy();
    void destroyPlayer();
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

    .history-layout {
      display: flex;
      height: 100%;
      min-width: 0;
    }

    .treeBox {
      flex: 0 0 clamp(160px, 22vh, 210px);
      overflow: auto;
      height: clamp(160px, 22vh, 210px);
    }
  }

  .history-player-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    gap: 16px;
    overflow: hidden;
  }

  .history-player-card {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;

    :deep(.ant-card-body) {
      box-sizing: border-box;
      height: 100%;
      overflow: hidden;
    }
  }

  .history-player-column {
    display: flex;
    flex: 1 1 0;
    width: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .history-sidebar-column {
    flex: 1 1 0;
    height: 100%;
    min-height: 0;
  }

  .history-sidebar-card {
    height: 100%;
    overflow: hidden;

    > :deep(.ant-card-body) {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
  }

  .history-resize-handle {
    position: relative;
    flex: 0 0 12px;
    cursor: col-resize;
    user-select: none;

    &::after {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 5px;
      width: 2px;
      content: '';
      background-color: #e5e7eb;
      transition: background-color 0.2s ease;
    }

    &:hover::after {
      background-color: @primary-color;
    }

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 42px;
      color: @primary-color;
      font-size: 18px;
      line-height: 1;
      content: '⋮';
      pointer-events: none;
      background: #fff;
      border: 1px solid #d9d9d9;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      opacity: 0;
      transform: translate(-50%, -50%);
      transition:
        opacity 0.2s ease,
        border-color 0.2s ease;
    }

    &:hover::before {
      border-color: @primary-color;
      opacity: 1;
    }
  }

  :global(body.history-video-resizing) {
    cursor: col-resize;
    user-select: none;
  }

  .history-search-card {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    height: calc(100% - clamp(160px, 22vh, 210px) - 8px);
    overflow: hidden;

    :deep(.ant-card-body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }
  }

  .history-table-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .history-record-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;

    :deep(.ant-form) {
      margin-bottom: 6px;
      padding: 10px 10px 4px;
    }

    :deep(.ant-form-item) {
      margin-bottom: 8px;
    }

    :deep(.ant-form .ant-row) {
      flex-wrap: wrap;
    }

    :deep(.ant-form .ant-col) {
      flex: 1 1 160px;
      max-width: 100%;
    }

    :deep(.ant-table-wrapper) {
      flex: 1;
      height: auto;
      min-height: 0;
      padding: 6px;
      overflow: hidden;
    }

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container),
    :deep(.ant-table),
    :deep(.ant-table-container) {
      height: 100%;
      min-height: 0;
    }

    :deep(.ant-table-body) {
      max-height: calc(100vh - 620px) !important;
    }
  }

  .player_container {
    display: grid;
    flex: 1;
    min-height: 0;
  }

  .player_container_1 {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .player_item {
    position: relative;
    height: 100%;
    background-color: #000;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
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

  .slot_index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
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
  }

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

  .radio-item {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    transition: all 0.2s ease;
  }

  .radio-item:hover {
    color: #07baf4;
    border-color: #07baf4;
  }

  :global(.history-date-picker-popup) {
    z-index: 3000;
  }
</style>
