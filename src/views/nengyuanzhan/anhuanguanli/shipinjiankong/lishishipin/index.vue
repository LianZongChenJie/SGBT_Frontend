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
              <div class="history-timeline" :class="{ disabled: !isTimelineAvailable }" :title="timelineCurrentDateTime">
                <button
                  class="history-playback-toggle"
                  type="button"
                  :disabled="!currentRecord"
                  :title="isPlaying ? '暂停' : '播放'"
                  :aria-label="isPlaying ? '暂停' : '播放'"
                  @click="isPlaying ? onPause() : onPlayer()"
                >
                  <span v-if="isPlaying" class="history-pause-icon" aria-hidden="true"><i></i><i></i></span>
                  <span v-else class="history-play-icon" aria-hidden="true"></span>
                </button>
                <div
                  ref="timelineTrackRef"
                  class="history-timeline-track"
                  role="slider"
                  :aria-valuemin="0"
                  :aria-valuemax="playbackDurationMs"
                  :aria-valuenow="timelinePositionMs"
                  :aria-disabled="!isTimelineAvailable"
                  tabindex="0"
                  @pointerdown="startTimelineSeek"
                >
                  <div class="history-timeline-buffer"></div>
                  <div class="history-timeline-played" :style="{ width: `${timelineProgressPercent}%` }"></div>
                  <div class="history-timeline-handle" :style="{ left: `${timelineProgressPercent}%` }"></div>
                </div>
                <span class="history-timeline-total">{{ timelineTotalDuration }}</span>
              </div>
              <div class="control-actions">
                <div class="radio-item" @click="onReplay">重播</div>
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
  import {
    closeHttpMp4Playback,
    getDemoList,
    openHttpMp4Playback,
    pauseHttpMp4Playback,
    resumeHttpMp4Playback,
    seekHttpMp4Playback,
    type PlaybackHttpMp4Response,
  } from './demo.api';

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
  const playbackDurationMs = ref(0);
  const playbackPositionMs = ref(0);
  const timelinePositionMs = ref(0);
  const timelineTrackRef = ref<HTMLElement | null>(null);
  const currentRecord = ref<HistoryRecord | null>(null);
  // 每次创建或释放回放会话都会更新版本号，避免旧请求覆盖当前选择的录像。
  let playbackSessionVersion = 0;
  let seekRequestVersion = 0;
  let seekTimer: number | undefined;
  let progressAnimationFrame: number | undefined;
  let playbackStartedAt = 0;
  let isTimelineSeeking = false;
  let pendingTimelineSeekPositionMs: number | undefined;
  const {
    create: createPlayer,
    destroy: destroyPlayer,
    getPlayer,
    pause: pausePlayer,
    play: playPlayer,
  } = useEasyPlayer({
    playbackSeek: (positionMs) => {
      schedulePlaybackSeek(Number(positionMs));
    },
    timestamps: (timestamp) => {
      // HTTP-fMP4 以 seek 接口返回的 positionMs 为准，此事件仅保留作播放器诊断。
      console.debug('[历史视频] EasyPlayer timestamps', timestamp);
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

  const isTimelineAvailable = computed(() => Boolean(playbackId.value && playbackDurationMs.value > 0));
  const timelineProgressPercent = computed(() => {
    if (!playbackDurationMs.value) return 0;
    return Math.min(100, Math.max(0, (timelinePositionMs.value / playbackDurationMs.value) * 100));
  });
  const timelineTotalDuration = computed(() => formatTimelineDuration(playbackDurationMs.value));
  const timelineCurrentDateTime = computed(() => {
    const record = currentRecord.value;
    if (!record?.beginTime) return '--';
    const beginTimestamp = parseHistoryTime(record.beginTime);
    return Number.isFinite(beginTimestamp) ? formatHistoryDateTime(beginTimestamp + timelinePositionMs.value) : '--';
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
      playbackDurationMs.value = 0;
      playbackPositionMs.value = 0;
      timelinePositionMs.value = 0;
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
    const player = await createPlayer('player_box1', {
      isLive: false,
      MSE: false,
      WCS: false,
      hasAudio: true,
      // 保留 EasyPlayer 悬停时的播放、音量、全屏等底部操作栏；录像定位仍由下方自定义时间轴处理。
      hasControl: true,
      hiddenRightMenu: true,
      playbackConfig: {
        // HTTP-fMP4 的进度条位置由后端 seek 接口确定，单位由 EasyPlayer 换算为秒。
        controlType: 'simple',
        // 后端 durationMs/positionMs 是毫秒，EasyPlayer 的 duration/startTime 需要秒。
        duration: millisecondsToSeconds(playbackDurationMs.value),
        startTime: millisecondsToSeconds(playbackPositionMs.value),
      },
    });
    // HTTP-fMP4 的定位由后端 seekHttpmp4 创建新流完成；禁用 EasyPlayer 先对本地缓冲区 seek，
    // 避免进度条在服务端返回前出现错误跳转或回跳。
    if (player) {
      player.seekTime = () => undefined;
    }
    return player;
  }

  async function recreateHistoryPlayer() {
    stopProgressSync();
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
    // HTTP-fMP4 的播放器启动 Promise 可能会等待首帧；时间轴以服务端确认的
    // positionMs 为基准立即开始推进，避免首帧期间进度条停在原处。
    startProgressSync();
    await playPlayer(url, 'playback', (error) => {
      isPlaying.value = false;
      stopProgressSync();
      console.error(error);
    });
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
    try {
      const playback = await resumeHttpMp4Playback({ playbackId: playbackId.value });
      await applyPlaybackResponse(playback);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '继续历史回放失败');
    }
  }

  async function onPause() {
    if (!playbackId.value) return;
    try {
      const playback = await pauseHttpMp4Playback({ playbackId: playbackId.value });
      stopProgressSync();
      updatePlaybackState(playback);
      emitPlaybackProgress(playbackPositionMs.value);
      pausePlayer();
      isPlaying.value = false;
    } catch (error) {
      message.error(error instanceof Error ? error.message : '暂停历史回放失败');
    }
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
    videoUrl.value = '';
    playbackDurationMs.value = 0;
    playbackPositionMs.value = 0;
    timelinePositionMs.value = 0;
    const sessionVersion = ++playbackSessionVersion;
    try {
      const playback = await openHttpMp4Playback({
        cameraIndexCode: deviceCode.value,
        beginTime: record.beginTime,
        endTime: record.endTime,
        recordLocation: 0,
        streamType: 1,
      });
      if (sessionVersion !== playbackSessionVersion) return;
      if (!playback.playbackId || !playback.httpMp4Url) {
        throw new Error('未获取到历史回放任务ID');
      }
      await applyPlaybackResponse(playback);
    } catch (error) {
      if (sessionVersion === playbackSessionVersion) {
        await releasePlaybackProxy();
        message.error(error instanceof Error ? error.message : '创建历史回放失败');
      }
    }
  }

  function updatePlaybackState(playback: PlaybackHttpMp4Response) {
    playbackId.value = playback.playbackId || playbackId.value;
    // 列表接口每条记录就是本次点播的有效时间段（当前场景为 5 分钟一条）。
    // 优先使用该起止时间计算总长，避免 HTTP-fMP4 会话返回整段录像时长而拉长进度条。
    const durationMs = getCurrentRecordDurationMs() || Number(playback.durationMs);
    if (Number.isFinite(durationMs) && durationMs >= 0) {
      playbackDurationMs.value = durationMs;
    }
    const positionMs = Number(playback.positionMs);
    if (Number.isFinite(positionMs) && positionMs >= 0) {
      playbackPositionMs.value = Math.min(positionMs, playbackDurationMs.value || positionMs);
    }
    timelinePositionMs.value = playbackPositionMs.value;
  }

  function getCurrentRecordDurationMs() {
    const record = currentRecord.value;
    if (!record?.beginTime || !record.endTime) return 0;

    const beginTimestamp = parseHistoryTime(record.beginTime);
    const endTimestamp = parseHistoryTime(record.endTime);
    return Number.isFinite(beginTimestamp) && Number.isFinite(endTimestamp) && endTimestamp > beginTimestamp ? endTimestamp - beginTimestamp : 0;
  }

  function parseHistoryTime(value: string) {
    // 保持接口原始时间字符串用于请求，只在前端计算进度条总时长时转换时间戳。
    return new Date(value.replace(' ', 'T')).getTime();
  }

  function millisecondsToSeconds(milliseconds: number) {
    return Math.max(0, Math.floor(milliseconds / 1000));
  }

  function formatTimelineDuration(milliseconds: number) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const minuteSecond = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return hours ? `${String(hours).padStart(2, '0')}:${minuteSecond}` : minuteSecond;
  }

  function formatHistoryDateTime(timestamp: number) {
    const date = new Date(timestamp);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function getCurrentPlaybackPositionMs() {
    if (!playbackStartedAt) return playbackPositionMs.value;
    const elapsedMs = Date.now() - playbackStartedAt;
    return Math.min(playbackPositionMs.value + elapsedMs, playbackDurationMs.value || playbackPositionMs.value + elapsedMs);
  }

  function emitPlaybackProgress(positionMs = getCurrentPlaybackPositionMs()) {
    // EasyPlayer simple 回放进度条监听 playbackTime，参数单位为秒。
    // HTTP-fMP4 没有固定文件时长，因此由后端回放状态提供准确时间轴。
    const normalizedPositionMs = Math.min(Math.max(0, positionMs), playbackDurationMs.value || positionMs);
    if (pendingTimelineSeekPositionMs === undefined) {
      timelinePositionMs.value = normalizedPositionMs;
    }
    const player = getPlayer();
    player?.emit?.('playbackTime', normalizedPositionMs / 1000 || 0.001);
  }

  function startProgressSync() {
    stopProgressSync();
    playbackStartedAt = Date.now();
    const syncProgress = () => {
      emitPlaybackProgress();
      progressAnimationFrame = window.requestAnimationFrame(syncProgress);
    };
    syncProgress();
  }

  function stopProgressSync(keepCurrentPosition = false) {
    if (keepCurrentPosition) {
      playbackPositionMs.value = getCurrentPlaybackPositionMs();
    }
    playbackStartedAt = 0;
    if (progressAnimationFrame !== undefined) {
      window.cancelAnimationFrame(progressAnimationFrame);
      progressAnimationFrame = undefined;
    }
    emitPlaybackProgress(playbackPositionMs.value);
  }

  function getTimelinePosition(event: PointerEvent) {
    const track = timelineTrackRef.value;
    if (!track || !playbackDurationMs.value) return 0;
    const { left, width } = track.getBoundingClientRect();
    const percentage = Math.min(1, Math.max(0, (event.clientX - left) / width));
    return Math.round(percentage * playbackDurationMs.value);
  }

  function startTimelineSeek(event: PointerEvent) {
    if (!isTimelineAvailable.value) return;
    event.preventDefault();
    isTimelineSeeking = true;
    updateTimelineSeekPreview(event);
    document.addEventListener('pointermove', updateTimelineSeekPreview);
    document.addEventListener('pointerup', finishTimelineSeek, { once: true });
  }

  function updateTimelineSeekPreview(event: PointerEvent) {
    if (!isTimelineSeeking) return;
    timelinePositionMs.value = getTimelinePosition(event);
  }

  function finishTimelineSeek(event: PointerEvent) {
    if (!isTimelineSeeking) return;
    updateTimelineSeekPreview(event);
    isTimelineSeeking = false;
    document.removeEventListener('pointermove', updateTimelineSeekPreview);
    pendingTimelineSeekPositionMs = timelinePositionMs.value;
    schedulePlaybackSeek(timelinePositionMs.value);
  }

  async function applyPlaybackResponse(playback: PlaybackHttpMp4Response) {
    const streamUrl = normalizeVideoStreamUrl(playback.httpMp4Url);
    if (!playback.playbackId || !streamUrl) {
      throw new Error('未获取到 HTTP-fMP4 回放地址');
    }
    updatePlaybackState(playback);
    videoUrl.value = streamUrl;
    await recreateHistoryPlayer();
    await playHistoryVideo(streamUrl);
  }

  function schedulePlaybackSeek(positionMs: number) {
    if (!playbackId.value || !Number.isFinite(positionMs)) return;
    const targetPositionMs = Math.min(Math.max(0, positionMs), playbackDurationMs.value || positionMs);
    const requestVersion = ++seekRequestVersion;
    if (seekTimer) window.clearTimeout(seekTimer);
    const sessionVersion = playbackSessionVersion;
    seekTimer = window.setTimeout(() => {
      seekTimer = undefined;
      void seekPlayback(targetPositionMs, sessionVersion, requestVersion);
    }, 180);
  }

  async function seekPlayback(positionMs: number, sessionVersion: number, requestVersion: number) {
    if (sessionVersion !== playbackSessionVersion || requestVersion !== seekRequestVersion || !playbackId.value) return;
    try {
      const playback = await seekHttpMp4Playback({ playbackId: playbackId.value, positionMs: Math.round(positionMs) });
      if (sessionVersion !== playbackSessionVersion || requestVersion !== seekRequestVersion) return;
      pendingTimelineSeekPositionMs = undefined;
      await applyPlaybackResponse(playback);
    } catch (error) {
      if (sessionVersion === playbackSessionVersion && requestVersion === seekRequestVersion) {
        pendingTimelineSeekPositionMs = undefined;
        emitPlaybackProgress();
        message.error(error instanceof Error ? error.message : '定位历史回放失败');
      }
    }
  }

  async function releasePlaybackProxy() {
    playbackSessionVersion += 1;
    seekRequestVersion += 1;
    isTimelineSeeking = false;
    pendingTimelineSeekPositionMs = undefined;
    document.removeEventListener('pointermove', updateTimelineSeekPreview);
    document.removeEventListener('pointerup', finishTimelineSeek);
    if (seekTimer) {
      window.clearTimeout(seekTimer);
      seekTimer = undefined;
    }
    stopProgressSync();
    const activePlaybackId = playbackId.value;
    playbackId.value = '';
    playbackDurationMs.value = 0;
    playbackPositionMs.value = 0;
    timelinePositionMs.value = 0;
    if (!activePlaybackId) return;
    try {
      await closeHttpMp4Playback({ playbackId: activePlaybackId });
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

    :deep(.easyplayer-control-progress-box) {
      display: none !important;
    }
  }

  .control-row {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .history-timeline {
    display: flex;
    flex: 1 1 320px;
    align-items: center;
    min-width: 0;
    gap: 10px;

    &.disabled {
      color: #bfbfbf;
      opacity: 0.45;

      .history-timeline-track {
        cursor: not-allowed;
      }
    }
  }

  .history-timeline-track {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 16px;
    cursor: pointer;
    touch-action: none;
    user-select: none;

    &:hover {
      .history-timeline-buffer,
      .history-timeline-played {
        height: 4px;
      }

      .history-timeline-handle {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  .history-playback-toggle {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    color: #fff;
    cursor: pointer;
    background: @primary-color;
    border: 0;
    border-radius: 50%;
    box-shadow: 0 2px 6px fade(@primary-color, 32%);
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover:not(:disabled) {
      color: #fff;
      background: darken(@primary-color, 7%);
      box-shadow: 0 3px 8px fade(@primary-color, 42%);
      transform: scale(1.06);
    }

    &:disabled {
      color: #fff;
      cursor: not-allowed;
      background: #bfbfbf;
      box-shadow: none;
    }
  }

  .history-play-icon {
    width: 0;
    height: 0;
    margin-left: 2px;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 9px solid #fff;
  }

  .history-pause-icon {
    display: inline-flex;
    gap: 4px;

    i {
      display: block;
      width: 3px;
      height: 12px;
      background: #fff;
      border-radius: 1px;
    }
  }

  .history-timeline-buffer,
  .history-timeline-played {
    position: absolute;
    top: 50%;
    left: 0;
    height: 2px;
    border-radius: 99px;
    transform: translateY(-50%);
  }

  .history-timeline-buffer {
    right: 0;
    background: #d9d9d9;
  }

  .history-timeline-played {
    z-index: 1;
    background: @primary-color;
  }

  .history-timeline-handle {
    position: absolute;
    top: 50%;
    z-index: 2;
    width: 12px;
    height: 12px;
    pointer-events: none;
    background: #fff;
    border: 2px solid @primary-color;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.7);
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .history-timeline-total {
    flex: 0 0 auto;
    color: #595959;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .control-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
  }

  .radio-item {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 0;
    color: #595959;
    font-size: 13px;
    line-height: 1.5;
    transition: color 0.2s ease;
  }

  .radio-item:hover {
    color: @primary-color;
  }

  :global(.history-date-picker-popup) {
    z-index: 3000;
  }
</style>
