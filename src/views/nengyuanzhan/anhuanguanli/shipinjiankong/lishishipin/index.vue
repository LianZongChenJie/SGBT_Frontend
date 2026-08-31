<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="history-page">
    <div ref="layoutRef" class="history-layout">
      <aside class="history-sidebar-column" :style="sidebarWidth ? { width: `${sidebarWidth}px`, flex: '0 0 auto' } : undefined">
        <a-card class="history-sidebar-card" :bordered="false">
          <section class="device-section">
            <div class="treeBox"><DepartLeftTree ref="leftTree" @select="onTreeSelect" /></div>
          </section>

          <section class="history-filter-section">
            <div class="section-title">时间范围</div>
            <div class="history-date-fields">
              <label>
                <span>开始时间</span>
                <a-date-picker v-model:value="queryRange.startTime" show-time value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" />
              </label>
              <label>
                <span>结束时间</span>
                <a-date-picker v-model:value="queryRange.endTime" show-time value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" />
              </label>
            </div>
            <div class="quick-range-actions">
              <a-button :type="selectedRangeHours === 24 ? 'primary' : 'default'" @click="setQuickRange(24)">近24小时</a-button>
              <a-button :type="selectedRangeHours === 72 ? 'primary' : 'default'" @click="setQuickRange(72)">近3天</a-button>
              <a-button :type="selectedRangeHours === 168 ? 'primary' : 'default'" @click="setQuickRange(168)">近7天</a-button>
            </div>
            <div class="filter-actions">
              <a-button type="primary" block @click="queryHistory">查询</a-button>
              <a-button block @click="resetHistoryQuery">重置</a-button>
            </div>
          </section>
        </a-card>
      </aside>

      <div class="history-resize-handle" @mousedown="startResize"></div>

      <main class="history-main-column">
        <a-card class="history-player-card" :bordered="false">
          <div class="history-player-panel">
            <div class="player_container player_container_1">
              <div class="player_item">
                <div class="player_box" id="player_box1"></div>
              </div>
            </div>

            <div class="control-row">
              <div class="history-timeline" :class="{ disabled: !isTimelineAvailable }" :title="timelineCurrentDateTime">
                <a-button
                  class="history-control-icon"
                  type="text"
                  :disabled="!currentRecord"
                  :title="isPlaying ? '暂停' : '播放'"
                  :aria-label="isPlaying ? '暂停' : '播放'"
                  @click="isPlaying ? onPause() : onPlayer()"
                >
                  <PauseOutlined v-if="isPlaying" />
                  <CaretRightFilled v-else />
                </a-button>
                <a-button
                  class="history-control-icon"
                  type="text"
                  :disabled="!currentRecord"
                  :title="isMuted ? '开启声音' : '静音'"
                  :aria-label="isMuted ? '开启声音' : '静音'"
                  @click="toggleMute"
                >
                  <AudioMutedOutlined v-if="isMuted" />
                  <SoundOutlined v-else />
                </a-button>
                <span class="timeline-current-duration">{{ timelineCurrentDuration }} / {{ timelineTotalDuration }}</span>
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
                <a-button
                  class="history-control-icon history-replay-icon"
                  type="text"
                  :disabled="!currentRecord"
                  title="重播"
                  aria-label="重播"
                  @click="onReplay"
                  ><ReloadOutlined
                /></a-button>
              </div>
            </div>

            <div class="playback-meta">
              <strong>{{ selectedDeviceName || currentRecord?.deviceName || '未选择设备' }}</strong>
              <span>{{ currentRecord ? `${currentRecord.beginTime} ~ ${currentRecord.endTime}` : '--' }}</span>
            </div>
          </div>
        </a-card>

        <a-card class="history-records-card" :bordered="false">
          <div class="records-heading">
            <strong>录像列表</strong>
            <a-button type="link" @click="queryHistory">刷新</a-button>
          </div>
          <div class="history-record-table-host">
            <BasicTable class="history-record-table" @register="registerTable">
              <template #action="{ record }"><TableAction :actions="getActions(record)" /></template>
            </BasicTable>
          </div>
        </a-card>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup name="lishishipin">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { AudioMutedOutlined, CaretRightFilled, PauseOutlined, ReloadOutlined, SoundOutlined } from '@ant-design/icons-vue';
  import DepartLeftTree from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinshebeiguanli/components/DepartLeftTree.vue';
  import { useEasyPlayer } from '@/views/nengyuanzhan/anhuanguanli/hooks/useEasyPlayer';
  import { normalizeVideoStreamUrl } from '@/views/nengyuanzhan/anhuanguanli/utils/videoStreamUrl';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { columns } from './demo.data';
  import {
    closeHttpMp4Playback,
    clearHistoryListCache,
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
    title?: string;
  }

  interface HistoryRecord {
    id?: string | number;
    deviceId?: string;
    deviceName?: string;
    beginTime?: string;
    endTime?: string;
  }

  const deviceCode = ref('');
  const selectedDeviceName = ref('');
  const selectedRangeHours = ref(24);
  const queryRange = reactive({
    startTime: formatQueryTime(Date.now() - 24 * 60 * 60 * 1000),
    endTime: formatQueryTime(Date.now()),
  });
  const layoutRef = ref<HTMLElement | null>(null);
  // 未拖拽时由左右两个 flex 区域均分宽度；开始拖拽后才记录左侧固定宽度。
  const sidebarWidth = ref(0);
  const videoUrl = ref('');
  const isPlaying = ref(false);
  const isMuted = ref(false);
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
  // 代码主动同步 EasyPlayer 状态时，不再重复触发后端暂停/继续请求。
  let isSyncingEasyPlayerPauseState = false;
  const {
    create: createPlayer,
    destroy: destroyPlayer,
    getPlayer,
    play: playPlayer,
  } = useEasyPlayer({
    playbackSeek: (positionMs) => {
      schedulePlaybackSeek(Number(positionMs));
    },
    timestamps: (timestamp) => {
      // HTTP-fMP4 以 seek 接口返回的 positionMs 为准，此事件仅保留作播放器诊断。
      console.debug('[历史视频] EasyPlayer timestamps', timestamp);
    },
    playbackPause: (paused) => {
      if (isSyncingEasyPlayerPauseState) return;
      void changePlaybackPause(paused, false);
    },
  });

  const isTimelineAvailable = computed(() => Boolean(playbackId.value && playbackDurationMs.value > 0));
  const timelineProgressPercent = computed(() => {
    if (!playbackDurationMs.value) return 0;
    return Math.min(100, Math.max(0, (timelinePositionMs.value / playbackDurationMs.value) * 100));
  });
  const timelineTotalDuration = computed(() => formatTimelineDuration(playbackDurationMs.value));
  const timelineCurrentDuration = computed(() => formatTimelineDuration(timelinePositionMs.value));
  const timelineCurrentDateTime = computed(() => {
    const record = currentRecord.value;
    if (!record?.beginTime) return '--';
    const beginTimestamp = parseHistoryTime(record.beginTime);
    return Number.isFinite(beginTimestamp) ? formatHistoryDateTime(beginTimestamp + timelinePositionMs.value) : '--';
  });

  const [registerTable, { reload }] = useTable({
    api: getDemoList,
    immediate: false,
    columns,
    beforeFetch: (params) => {
      return {
        ...params,
        deviceCode: deviceCode.value,
      };
    },
    striped: true,
    useSearchForm: false,
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
    // 保持固定表头；实际可滚动高度由表格所在卡片的剩余空间控制。
    scroll: { y: 1 },
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
      selectedDeviceName.value = data.title || '';
      await resetPlaybackState({ clearRecord: true });
    }
  }

  function formatQueryTime(timestamp: number) {
    const date = new Date(timestamp);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function setQuickRange(hours: number) {
    selectedRangeHours.value = hours;
    queryRange.endTime = formatQueryTime(Date.now());
    queryRange.startTime = formatQueryTime(Date.now() - hours * 60 * 60 * 1000);
  }

  async function queryHistory() {
    if (!deviceCode.value) {
      message.warning('请先在设备列表中选择摄像头');
      return;
    }
    if (!queryRange.startTime || !queryRange.endTime) {
      message.warning('请选择完整的时间范围');
      return;
    }
    // “查询/刷新”是用户主动获取最新录像列表的操作，不能命中页面内短时缓存。
    clearHistoryListCache();
    await reload({ page: 1, searchInfo: { ...queryRange } });
  }

  async function resetHistoryQuery() {
    setQuickRange(24);
    await queryHistory();
  }

  async function createHistoryPlayer() {
    const player = await createPlayer('player_box1', {
      isLive: false,
      // HTTP-fMP4 使用浏览器 MSE/原生 video 解码，保障回放兼容性。
      MSE: true,
      WCS: false,
      hasAudio: true,
      // 保留 EasyPlayer 悬停时的播放、音量、全屏等底部操作栏；录像定位仍由下方自定义时间轴处理。
      hasControl: true,
      hiddenRightMenu: false,
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
    await changePlaybackPause(false);
  }

  async function onPause() {
    if (!playbackId.value) return;
    await changePlaybackPause(true);
  }

  function toggleMute() {
    isMuted.value = !isMuted.value;
    getPlayer()?.setMute(isMuted.value);
  }

  async function changePlaybackPause(paused: boolean, syncEasyPlayerState = true) {
    if (!playbackId.value) return;

    try {
      if (paused) {
        // 不调用 player.pause()/stop()：EasyPlayer 的 pause 会关闭当前解码和拉流，
        // 恢复时必须重新创建播放器，正是造成播放/暂停卡顿的原因。
        stopProgressSync(true);
        isPlaying.value = false;
        const playback = await pauseHttpMp4Playback({ playbackId: playbackId.value });
        updatePlaybackState(playback);
        emitPlaybackProgress(playbackPositionMs.value);
        if (syncEasyPlayerState) setEasyPlayerPaused(true);
        return;
      }

      const playback = await resumeHttpMp4Playback({ playbackId: playbackId.value });
      await applyPlaybackResponse(playback, false);
      if (syncEasyPlayerState) setEasyPlayerPaused(false);
    } catch (error) {
      if (paused) {
        isPlaying.value = true;
        startProgressSync();
        if (!syncEasyPlayerState) setEasyPlayerPaused(false);
      } else {
        isPlaying.value = false;
        stopProgressSync();
        if (!syncEasyPlayerState) setEasyPlayerPaused(true);
      }
      message.error(error instanceof Error ? error.message : paused ? '暂停历史回放失败' : '继续历史回放失败');
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

  function setEasyPlayerPaused(paused: boolean) {
    const player = getPlayer();
    if (!player || player.playbackPause === paused) return;
    isSyncingEasyPlayerPauseState = true;
    player.playbackPause = paused;
    isSyncingEasyPlayerPauseState = false;
  }

  async function applyPlaybackResponse(playback: PlaybackHttpMp4Response, forceRecreatePlayer = true) {
    const responseUrl = normalizeVideoStreamUrl(playback.httpMp4Url);
    const streamUrl = responseUrl || videoUrl.value;
    if (!playback.playbackId || !streamUrl) {
      throw new Error('未获取到 HTTP-fMP4 回放地址');
    }
    const isStreamChanged = Boolean(responseUrl && responseUrl !== videoUrl.value);
    updatePlaybackState(playback);
    videoUrl.value = streamUrl;
    if (forceRecreatePlayer || isStreamChanged || !getPlayer()) {
      await recreateHistoryPlayer();
      await playHistoryVideo(streamUrl);
      return;
    }

    isPlaying.value = true;
    startProgressSync();
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
      max-height: calc(100vh - 600px) !important;
      overflow-y: auto !important;
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

    // 播放与音量由画面下方的自定义控制条统一管理，其余原生功能保留。
    :deep(.easyplayer-play),
    :deep(.easyplayer-pause),
    :deep(.easyplayer-play-big),
    :deep(.easyplayer-volume),
    :deep(.easyplayer-speed),
    :deep(.easyplayer-speed-menu),
    :deep(.easyplayer-speed-menu-wrap),
    :deep(.easyplayer-controls-item-wrap:has(.easyplayer-speed)),
    :deep(.easyplayer-controls-code-wrap),
    :deep(.easyplayer-controls-item-html) {
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

  .history-control-icon {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    padding: 0;
    color: #111827;
    font-size: 20px;
    border-radius: 5px;

    &:hover:not(:disabled) {
      color: @primary-color;
      background: #f1f5ff;
    }

    &:disabled {
      color: #c5cad3;
    }
  }

  .timeline-current-duration {
    flex: 0 0 auto;
    color: #161b26;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .timeline-current-duration {
    min-width: 120px;
  }

  .history-replay-icon {
    margin-left: 2px;
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

  // 设计稿布局：左侧检索面板 + 右侧回放与录像列表，播放器内部实现保持不变。
  .history-page {
    box-sizing: border-box;
    height: calc(100vh - 110px);
    padding: 14px 14px 34px;
    overflow: hidden;
    background: #f5f7fb;
  }

  .history-layout {
    display: flex;
    height: 100%;
    min-width: 0;
    gap: 0;
  }

  .history-sidebar-column {
    flex: 0 0 29%;
    min-width: 310px;
    max-width: 460px;
  }

  .history-sidebar-card,
  .history-player-card,
  .history-records-card {
    border-radius: 12px;
    box-shadow: 0 5px 18px rgba(41, 63, 103, 0.06);
  }

  .history-sidebar-card {
    height: 100%;
    background: #fff;

    > :deep(.ant-card-body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 20px;
      overflow: hidden;
    }
  }

  .device-section {
    display: flex;
    flex: 1 1 68%;
    flex-direction: column;
    min-height: 240px;
    padding-bottom: 12px;
    border-bottom: 1px solid #edf0f5;
  }

  .section-title,
  .records-heading strong,
  .playback-heading strong {
    color: #182033;
    font-size: 16px;
    font-weight: 600;
  }

  .treeBox {
    flex: 1;
    height: auto;
    min-height: 0;
    overflow: hidden;

    :deep(.ant-card) {
      height: 100% !important;
      box-shadow: none;
    }

    :deep(.ant-card-body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0;
      overflow: hidden;
    }

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      min-height: 0;
      overflow: auto;
    }

    :deep(.ant-tree) {
      padding: 4px 0;
      color: #343b4b;
      background: transparent;
    }

    :deep(.ant-tree-treenode) {
      width: 100%;
      min-height: 35px;
      padding: 2px 0;
    }

    :deep(.ant-tree-node-content-wrapper) {
      width: calc(100% - 22px);
      min-height: 31px;
      line-height: 31px;
      border-radius: 5px;
    }

    :deep(.ant-tree-node-selected) {
      color: @primary-color;
      font-weight: 600;
      background: #edf3ff;
    }
  }

  .history-filter-section {
    flex: 0 0 auto;
    min-height: 0;
    padding-top: 12px;
  }

  .history-date-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 14px;

    label {
      min-width: 0;
      color: #667085;
      font-size: 12px;

      span {
        display: block;
        margin-bottom: 6px;
      }
    }

    :deep(.ant-picker) {
      width: 100%;
      height: 40px;
      padding: 0 8px;
      border-radius: 5px;
    }

    :deep(.ant-picker-input > input) {
      font-size: 12px;
    }

    :deep(.ant-picker-suffix) {
      line-height: 38px;
    }
  }

  .quick-range-actions,
  .filter-actions {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }

  .quick-range-actions {
    grid-template-columns: repeat(3, 1fr);

    :deep(.ant-btn) {
      height: 34px;
      padding: 0 4px;
      border-radius: 5px;
      font-size: 12px;
    }
  }

  .filter-actions {
    grid-template-columns: 1fr 1fr;
    padding-top: 14px;
    border-top: 1px solid #edf0f5;

    :deep(.ant-btn) {
      height: 38px;
      border-radius: 5px;
    }
  }

  .history-main-column {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    gap: 14px;
  }

  .history-player-card {
    flex: 1 1 54%;
    width: 100%;
    height: auto;
    min-height: 306px;
    overflow: hidden;

    :deep(.ant-card-body) {
      height: 100%;
      padding: 16px;
    }
  }

  .history-player-panel {
    gap: 10px;
  }

  .playback-heading,
  .records-heading,
  .playback-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-width: 0;
  }

  .playback-heading span,
  .playback-meta span {
    overflow: hidden;
    color: #242b3a;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .playback-meta {
    min-height: 24px;
    padding: 0 2px;
  }

  .playback-meta strong {
    color: #1c2433;
    font-size: 14px;
  }

  .player_item {
    border-radius: 6px;
  }

  .control-row {
    min-height: 32px;
    padding: 0 4px;
  }

  .history-records-card {
    flex: 1 1 46%;
    min-height: 230px;
    overflow: hidden;

    :deep(.ant-card-body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      padding: 12px 16px 14px;
    }
  }

  .records-heading {
    flex: 0 0 auto;
    min-height: 30px;
    margin-bottom: 8px;
  }

  .history-record-table-host {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .history-record-table {
    flex: 1;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    > :deep(.ant-form-item),
    :deep(.ant-form-item-control),
    :deep(.ant-form-item-control-input),
    :deep(.ant-form-item-control-input-content) {
      display: flex;
      flex: 1 1 0;
      min-height: 0;
    }

    > :deep(.ant-form-item) {
      margin-bottom: 0;
    }

    :deep(.ant-form-item-control-input-content) {
      align-self: stretch;
      flex-direction: column;
      height: 100% !important;
    }

    :deep(.ant-table-wrapper) {
      padding: 0;
    }

    :deep(.ant-table-wrapper),
    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container),
    :deep(.ant-table) {
      display: flex;
      flex: 1 1 0;
      flex-direction: column;
      height: auto !important;
      min-height: 0;
      overflow: hidden;
    }

    :deep(.ant-table) {
      font-size: 13px;
    }

    :deep(.ant-table-thead > tr > th) {
      color: #222b3d;
      font-weight: 600;
      background: #f6f8fc;
    }

    :deep(.ant-table-cell) {
      padding: 11px 10px;
      white-space: nowrap;
    }

    :deep(.ant-table-container) {
      display: flex;
      flex: 1 1 0;
      flex-direction: column;
      height: auto;
      min-height: 0;
      overflow: hidden;
    }

    :deep(.ant-table-header) {
      flex: 0 0 auto;
    }

    :deep(.ant-table-body) {
      flex: 1 1 0;
      height: auto !important;
      min-height: 0;
      max-height: none !important;
      overflow-y: auto !important;
    }
  }

  @media (max-width: 1100px) {
    .history-page {
      height: auto;
      min-height: 100%;
      overflow: auto;
    }

    .history-layout {
      flex-direction: column;
    }

    .history-sidebar-column,
    .history-main-column {
      width: 100% !important;
      max-width: none;
    }

    .history-sidebar-column {
      min-width: 0;
    }

    .history-sidebar-card {
      height: auto;
    }

    .device-section {
      min-height: 220px;
    }

    .history-resize-handle {
      display: none;
    }

    .history-player-card,
    .history-records-card {
      flex-basis: auto;
    }

    .history-player-card {
      height: 460px;
    }
  }

  :global(.history-date-picker-popup) {
    z-index: 3000;
  }
</style>
