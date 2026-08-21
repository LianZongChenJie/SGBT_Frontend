<template>
  <BasicModal v-bind="$attrs" @register="registerModal" @cancel="cancel" :title="title" width="40%">
    <div class="patrol-player-panel">
      <div class="device-summary">{{ currentDeviceSummary }}</div>

      <div class="player_item">
        <div class="slot_header">
          <span class="slot_index">直播</span>
          <span class="slot_name">{{ currentDeviceName }}</span>
        </div>
        <div class="player_box" id="player_box1"></div>
        <div v-if="showCheckIn && hasPermission(PATROL_PERMISSION.checkIn)" class="checkin-overlay">
          <a-button class="checkin-button" type="primary" :disabled="indexStatus" @click="onClickCheckIn">
            {{ indexStatus ? '已打卡' : '打卡' }}
          </a-button>
        </div>
      </div>

      <div class="status-row">
        <div class="active-device-info">{{ patrolStatusText }}</div>
      </div>

      <div class="control-row">
        <div class="control-actions">
          <div v-if="patrolRunning && hasPermission(PATROL_PERMISSION.pause)" class="radio-item" @click="onClickStop">
            {{ pauseAfterCurrent ? '暂停中' : '暂停' }}
          </div>
          <div v-else-if="!patrolRunning && hasPermission(PATROL_PERMISSION.play)" class="radio-item" @click="onClickStart">播放</div>
          <div class="radio-item" @click="setFullscreen">全屏</div>
          <div class="radio-item" @click="onScreenshot">抓拍</div>
        </div>

        <div class="business-actions">
          <a-button v-if="hasPermission(PATROL_PERMISSION.submitAlarm)" danger type="primary" @click="clickOpenAlarm"> 告警上报 </a-button>
        </div>
      </div>
    </div>

    <DemoModalAlarm :isDisabled="isDisabled" @register="registerModalAlarm" @success="success" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, ref, unref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { useEasyPlayer } from '@/views/nengyuanzhan/anhuanguanli/hooks/useEasyPlayer';
  import { normalizeVideoStreamUrl } from '@/views/nengyuanzhan/anhuanguanli/utils/videoStreamUrl';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { defHttp } from '/@/utils/http/axios';
  import { uploadUrl } from '/@/api/common/api';
  import { completeTask, getStartTask, getVideoPatrolState, PatrolStateResponse, saveCheckIn, startVideoPatrol, stopVideoPatrol } from './demo.api';
  import DemoModalAlarm from './DemoModalAlarm.vue';

  const [registerModalAlarm, { openModal: openModalAlarm }] = useModal();
  const { hasPermission } = usePermission();

  const PATROL_PERMISSION = {
    startTask: 'operation:videoPatrolTask:startTask',
    pause: 'operation:videoPatrolTask:pause',
    play: 'operation:videoPatrolTask:play',
    submitAlarm: 'operation:videoPatrolTask:submitAlarm',
    complete: 'operation:videoPatrolTask:complete',
    checkIn: 'operation:videoPatrolTask:checkIn',
  } as const;

  interface PatrolDevice {
    deviceCode?: string | number;
    deviceName?: string;
    needCheck?: boolean;
  }

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const indexStatus = ref(false);
  defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const currentIndex = ref(0);
  const taskId = ref<string | number>(0);
  const taskArr = ref<PatrolDevice[]>([]);
  const playDuration = ref(0);
  const deviceCode = ref<string | number>('');
  const currentDevice = ref<PatrolDevice | null>(null);
  const videoUrl = ref('');
  const patrolRunning = ref(false);
  const hasPatrolCompleted = ref(false);
  const checkedDeviceCodes = ref<Set<string>>(new Set());
  const hasCompletedNotified = ref(false);
  const patrolId = ref('');
  const patrolStream = ref('');
  const nextSwitchAt = ref(0);
  const resumeFromIndex = ref(0);
  const sessionStartIndex = ref(0);
  const pauseAfterCurrent = ref(false);
  let stateTimer: ReturnType<typeof setInterval> | null = null;
  let switchTimer: ReturnType<typeof setTimeout> | null = null;
  let pauseStopTimer: ReturnType<typeof setTimeout> | null = null;
  let stateRequestInFlight = false;
  let stopRequestInFlight = false;
  const { create: createPlayer, destroy: destroyPlayer, getPlayer, play: playPlayer, setFullscreen: setPlayerFullscreen } = useEasyPlayer();

  const title = computed(() => (!unref(isUpdate) ? '执行巡更任务' : '执行巡更任务'));
  const showCheckIn = computed(() => Boolean(currentDevice.value?.needCheck));
  const currentDeviceCode = computed(() => String(currentDevice.value?.deviceCode || ''));
  const currentDeviceName = computed(() => currentDevice.value?.deviceName || '未加载设备');
  const currentDeviceSummary = computed(() => {
    if (!currentDevice.value) {
      return '当前设备：未开始巡更';
    }

    return `当前设备：${currentDeviceName.value}(实时视频) ${currentIndex.value + 1}/${taskArr.value.length}`;
  });
  const patrolStatusText = computed(() => {
    if (!taskArr.value.length) {
      return '巡更状态：暂无设备';
    }

    if (patrolRunning.value) {
      if (pauseAfterCurrent.value) {
        return '巡更状态：当前视频播放完后暂停';
      }
      return `巡更状态：播放中，当前设备 ${currentIndex.value + 1}/${taskArr.value.length}`;
    }

    if (hasPatrolCompleted.value) {
      return '巡更状态：已完成';
    }

    return '巡更状态：已暂停';
  });

  function createLivePlayer() {
    return createPlayer('player_box1', {
      isLive: true,
      MSE: false,
      WCS: false,
      hasAudio: true,
      hiddenRightMenu: true,
    });
  }

  async function recreateLivePlayer() {
    await destroyPlayer();
    await nextTick();
    await createLivePlayer();
  }

  function playCurrentVideo() {
    if (!videoUrl.value) {
      message.warning('未获取到视频流地址');
      return;
    }

    return playPlayer(videoUrl.value, 'play', (error) => {
      console.error(error);
    });
  }

  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    await resetPatrolSession();
    resetPatrolView();
    setModalProps({ confirmLoading: false, showOkBtn: false, showCancelBtn: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      taskId.value = data.record.id;
      await nextTick();
      await createLivePlayer();
      await startPatrol();
    }
  });

  function resetPatrolView() {
    currentIndex.value = 0;
    indexStatus.value = false;
    taskArr.value = [];
    deviceCode.value = '';
    currentDevice.value = null;
    playDuration.value = 0;
    videoUrl.value = '';
    patrolId.value = '';
    patrolStream.value = '';
    nextSwitchAt.value = 0;
    resumeFromIndex.value = 0;
    sessionStartIndex.value = 0;
    pauseAfterCurrent.value = false;
    patrolRunning.value = false;
    hasPatrolCompleted.value = false;
    hasCompletedNotified.value = false;
    checkedDeviceCodes.value = new Set();
  }

  function clearPatrolTimers() {
    if (stateTimer) clearInterval(stateTimer);
    if (switchTimer) clearTimeout(switchTimer);
    if (pauseStopTimer) clearTimeout(pauseStopTimer);
    stateTimer = null;
    switchTimer = null;
    pauseStopTimer = null;
  }

  function scheduleNextSwitch() {
    if (!patrolRunning.value || !patrolId.value || hasPatrolCompleted.value) return;
    if (pauseAfterCurrent.value) {
      schedulePauseStop();
      return;
    }
    if (switchTimer) clearTimeout(switchTimer);
    const fallbackAt = Date.now() + playDuration.value * 1000;
    // ZLM 巡更会话会按 staySeconds 自动换路。前端只在切换点查询状态并消费新流，
    // 不再自动调用 next，避免与服务端自动切换叠加导致跳过第二路。
    const targetAt = nextSwitchAt.value > 0 ? Math.max(Date.now() + 500, nextSwitchAt.value) : fallbackAt;
    switchTimer = setTimeout(() => void syncPatrolState(), Math.max(0, targetAt - Date.now()) + 100);
  }

  function schedulePauseStop() {
    if (!patrolId.value || !pauseAfterCurrent.value) return;
    if (pauseStopTimer) clearTimeout(pauseStopTimer);
    const fallbackAt = Date.now() + playDuration.value * 1000;
    const targetAt = nextSwitchAt.value > Date.now() ? nextSwitchAt.value : fallbackAt;
    pauseStopTimer = setTimeout(() => void resetPatrolSession(), Math.max(0, targetAt - Date.now()));
  }

  async function playStateStream(state: PatrolStateResponse) {
    const streamUrl = normalizeVideoStreamUrl(state.wsFlvUrl);
    const nextStream = state.stream || streamUrl;
    const streamChanged = nextStream !== patrolStream.value || streamUrl !== videoUrl.value;
    const previousStream = patrolStream.value;
    patrolStream.value = nextStream;
    videoUrl.value = streamUrl;
    currentIndex.value = sessionStartIndex.value + Math.max(0, Number(state.currentIndex || 0));
    const matchedDevice = taskArr.value.find((item) => String(item.deviceCode) === String(state.cameraIndexCode));
    currentDevice.value = matchedDevice || {
      deviceCode: state.cameraIndexCode,
      deviceName: state.cameraName,
      needCheck: matchedDevice?.needCheck,
    };
    deviceCode.value = state.cameraIndexCode || currentDevice.value?.deviceCode || '';
    indexStatus.value = checkedDeviceCodes.value.has(String(deviceCode.value));
    nextSwitchAt.value = normalizeNextSwitchAt(state.nextSwitchAt);
    if (streamChanged && streamUrl) {
      // 后续路数的 FLV 流切换时重建播放器，避免旧 MSE/WebSocket 连接导致黑屏。
      if (previousStream && getPlayer()) {
        await recreateLivePlayer();
      }
      await playCurrentVideo();
    }
    scheduleNextSwitch();
  }

  function normalizeNextSwitchAt(value?: number) {
    const timestamp = Number(value || 0);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return 0;
    // 同时兼容后端返回秒级和毫秒级时间戳。
    return timestamp < 100000000000 ? timestamp * 1000 : timestamp;
  }

  async function applyPatrolState(state: PatrolStateResponse) {
    if (!state) return;
    if (state.status === 'FINISHED') {
      await completePatrol();
      return;
    }
    if (state.status === 'ERROR') {
      await failPatrol(state.message || '巡更任务执行异常');
      return;
    }
    if (state.status === 'STOPPED') {
      clearPatrolTimers();
      patrolRunning.value = false;
      return;
    }
    if (pauseAfterCurrent.value && state.stream && state.stream !== patrolStream.value) {
      await resetPatrolSession();
      return;
    }
    await playStateStream(state);
  }

  async function startPatrol(isResume = false) {
    if (patrolRunning.value) return;
    const permission = isResume ? PATROL_PERMISSION.play : PATROL_PERMISSION.startTask;
    if (!hasPermission(permission)) {
      message.warning(isResume ? '暂无播放巡更权限' : '暂无执行巡更权限');
      return;
    }
    try {
      const task = await getStartTask({ taskId: taskId.value });
      taskArr.value = Array.isArray(task?.deviceList) ? task.deviceList : [];
      playDuration.value = Math.max(1, Number(task?.playDuration || 1));
      if (!taskArr.value.length) {
        message.warning('当前任务暂无巡更设备');
        return;
      }
      const remainingDevices = taskArr.value.slice(resumeFromIndex.value);
      if (!remainingDevices.length) {
        message.warning('当前巡更任务已无待播放设备');
        return;
      }
      sessionStartIndex.value = resumeFromIndex.value;
      const state = await startVideoPatrol({
        cameras: remainingDevices.map((item) => ({ cameraIndexCode: String(item.deviceCode || ''), cameraName: item.deviceName || '' })),
        loop: false,
        staySeconds: playDuration.value,
        streamType: 1,
      });
      patrolId.value = state.patrolId;
      patrolRunning.value = true;
      startStatePolling();
      await applyPatrolState(state);
    } catch (error) {
      await failPatrol(error instanceof Error ? error.message : '启动巡更任务失败');
    }
  }

  function startStatePolling() {
    clearPatrolTimers();
    stateTimer = setInterval(() => void syncPatrolState(), 3000);
  }

  async function syncPatrolState() {
    if (!patrolId.value || stateRequestInFlight || !patrolRunning.value) return;
    stateRequestInFlight = true;
    try {
      await applyPatrolState(await getVideoPatrolState(patrolId.value));
    } catch (error) {
      await failPatrol(error instanceof Error ? error.message : '查询巡更状态失败');
    } finally {
      stateRequestInFlight = false;
    }
  }

  async function resetPatrolSession() {
    clearPatrolTimers();
    patrolRunning.value = false;
    const activePatrolId = patrolId.value;
    patrolId.value = '';
    pauseAfterCurrent.value = false;
    if (activePatrolId && !stopRequestInFlight) {
      stopRequestInFlight = true;
      try {
        await stopVideoPatrol(activePatrolId);
      } catch (error) {
        console.warn('停止巡更会话失败', error);
      } finally {
        stopRequestInFlight = false;
      }
    }
    await destroyPlayer();
  }

  async function completePatrol() {
    if (hasCompletedNotified.value) return;
    hasCompletedNotified.value = true;
    hasPatrolCompleted.value = true;
    patrolRunning.value = false;
    clearPatrolTimers();
    try {
      if (!hasPermission(PATROL_PERMISSION.complete)) {
        message.warning('暂无巡更完成权限，无法更新任务完成状态');
        return;
      }
      await completeTask({ taskId: taskId.value, taskStatus: 2 });
      emit('success');
      Modal.success({ title: '提示', content: '用户巡更完成！', okText: '确认' });
    } catch (error) {
      hasCompletedNotified.value = false;
      throw error;
    } finally {
      await resetPatrolSession();
    }
  }

  async function failPatrol(errorMessage: string) {
    clearPatrolTimers();
    patrolRunning.value = false;
    await resetPatrolSession();
    message.error(errorMessage || '巡更任务执行失败');
  }

  async function onClickStart() {
    if (!hasPermission(PATROL_PERMISSION.play)) {
      message.warning('暂无播放巡更权限');
      return;
    }
    // 暂停完成会销毁播放器并释放 ZLM 会话；恢复时先重建播放器，再创建新的巡更会话。
    if (!getPlayer()) {
      await nextTick();
      await createLivePlayer();
    }
    await startPatrol(true);
  }
  function onClickStop() {
    if (!hasPermission(PATROL_PERMISSION.pause)) {
      message.warning('暂无暂停巡更权限');
      return;
    }
    if (!patrolRunning.value || pauseAfterCurrent.value) return;
    // 暂停只阻止进入下一路；恢复时重新从当前摄像头创建巡更会话。
    resumeFromIndex.value = currentIndex.value;
    pauseAfterCurrent.value = true;
    if (switchTimer) clearTimeout(switchTimer);
    switchTimer = null;
    schedulePauseStop();
  }

  function setFullscreen() {
    const player = getPlayer();
    if (!player) {
      message.warning('播放器未初始化');
      return;
    }

    setPlayerFullscreen(true);
  }

  function buildScreenshotFilename() {
    const deviceName = String(currentDevice.value?.deviceName || 'camera').replace(/[\\/:*?"<>|]/g, '_');
    const date = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const timestamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    return `${deviceName}_${timestamp}`;
  }

  async function getScreenshotDataUrl() {
    const player = getPlayer();
    if (player?.screenshot) {
      try {
        // JPEG 显著小于原始 PNG 截图，避免监控画面尺寸较大时被后端上传大小限制拒绝。
        const result = await Promise.resolve(player.screenshot(buildScreenshotFilename(), 'jpeg', 0.82, 'base64'));
        if (typeof result === 'string' && result) {
          return result.startsWith('data:image') ? result : `data:image/jpeg;base64,${result}`;
        }
      } catch (error) {
        console.warn('EasyPlayer 抓拍失败，尝试从视频画面抓拍', error);
      }
    }

    return captureVideoFrame();
  }

  function captureVideoFrame() {
    const container = document.getElementById('player_box1');
    const videos = Array.from(container?.querySelectorAll('video') || []);
    const video = videos.find((item) => item.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && item.videoWidth > 0 && item.videoHeight > 0);
    if (!video) {
      return '';
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return '';
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.82);
    } catch (error) {
      // 某些浏览器或流协议不允许 Canvas 读取画面，继续按重试策略等待 EasyPlayer 可用。
      console.warn('从视频画面抓拍失败', error);
      return '';
    }
  }

  async function captureAlarmScreenshot() {
    // 后续路数切流后，播放器可能需要数秒才能拿到首帧；等待并重试，且提供 video 元素兜底抓拍。
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const dataUrl = await getScreenshotDataUrl();
      if (dataUrl) {
        return dataUrl;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 500));
    }
    return '';
  }

  function dataUrlToFile(dataUrl: string, fileName: string) {
    const [header, content = ''] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
    const binary = window.atob(content);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new File([bytes], fileName, { type: mime });
  }

  function downloadScreenshot(dataUrl: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${buildScreenshotFilename()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function uploadScreenshot(dataUrl: string) {
    // 后端存储路径不支持部分中文文件名，上传时统一使用 ASCII 文件名。
    const file = dataUrlToFile(dataUrl, `video_patrol_${Date.now()}.jpeg`);
    const result: any = await defHttp.uploadFile(
      { url: uploadUrl },
      {
        file,
        filename: file.name,
        data: {
          biz: 'temp',
        },
      },
      { isReturnResponse: true }
    );

    // uploadFile 在不同请求配置下可能返回响应体本身或 AxiosResponse，兼容两种结构。
    const payload = result?.data || result;
    const imageUrl = payload?.result || payload?.url || payload?.message || '';
    if (payload?.success === false || !imageUrl) {
      throw new Error(payload?.message || '截图上传失败');
    }

    return String(imageUrl);
  }

  async function onScreenshot() {
    const dataUrl = await getScreenshotDataUrl();
    if (!dataUrl) {
      message.warning('抓拍失败，请确认视频已正常播放后重试');
      return;
    }

    downloadScreenshot(dataUrl);
    message.success('抓拍已开始下载');
  }

  async function clickOpenAlarm() {
    if (!hasPermission(PATROL_PERMISSION.submitAlarm)) {
      message.warning('暂无告警上报权限');
      return;
    }
    if (!currentDevice.value?.deviceCode) {
      message.warning('当前无可上报的设备');
      return;
    }

    const dataUrl = await captureAlarmScreenshot();

    if (patrolRunning.value) {
      // 告警上报会结束当前巡更会话；后续点击播放时从告警所在摄像头重新开始。
      resumeFromIndex.value = currentIndex.value;
      await resetPatrolSession();
    }

    let imageUrl = '';
    if (dataUrl) {
      try {
        imageUrl = await uploadScreenshot(dataUrl);
      } catch (error) {
        // 抓拍图片仍会带入告警表单，用户可在提交前手动处理图片。
        console.error('告警自动截图上传失败', error);
      }
    } else {
      console.warn('告警自动截图失败，已打开告警表单供手动上传图片');
    }

    openModalAlarm(true, {
      taskId: taskId.value,
      cameraCode: currentDevice.value.deviceCode,
      deviceName: currentDevice.value.deviceName,
      // 上传失败时先将本地截图放进表单图片控件；提交时会转换成后端文件路径。
      imageUrl: imageUrl || dataUrl,
      isUpdate: true,
    });
  }

  function success() {}

  function onClickCheckIn() {
    if (!hasPermission(PATROL_PERMISSION.checkIn)) {
      message.warning('暂无互动打卡权限');
      return;
    }
    if (indexStatus.value || !currentDevice.value?.deviceCode) {
      return;
    }

    const obj = {
      deviceCode: currentDevice.value.deviceCode || deviceCode.value,
      taskId: taskId.value,
    };

    Modal.confirm({
      title: '打卡',
      content: '是否打卡?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return saveCheckIn(obj, function () {
          checkedDeviceCodes.value.add(currentDeviceCode.value);
          indexStatus.value = true;
        });
      },
    });
  }

  async function cancel() {
    await resetPatrolSession();
    resetPatrolView();
  }

  onBeforeUnmount(() => {
    void resetPatrolSession();
  });
</script>
<style scoped lang="less">
  .patrol-player-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .device-summary {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
  }

  .player_item {
    position: relative;
    padding-bottom: 56%;
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

  .checkin-overlay {
    position: absolute;
    left: 50%;
    bottom: 16px;
    z-index: 3;
    border-radius: 4px;
    transform: translateX(-50%);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  }

  .checkin-button {
    box-shadow: none;
  }

  // 打卡成功后按钮会变为禁用态，焦点样式由外层容器统一承载，避免按钮自身出现外圈。
  .checkin-button:focus,
  .checkin-button:focus-visible,
  .checkin-button.ant-btn:focus,
  .checkin-button.ant-btn:focus-visible {
    outline: none;
    box-shadow: none;
  }

  :deep(.checkin-button.ant-btn-primary:disabled) {
    color: #fff !important;
    background-color: @primary-color !important;
    border-color: @primary-color !important;
    opacity: 1;
  }

  :deep(.checkin-button.ant-btn-primary:disabled > span) {
    color: #fff !important;
  }

  .status-row,
  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .active-device-info {
    min-width: 0;
    color: #606266;
    font-size: 14px;
  }

  .control-actions,
  .business-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .business-actions {
    margin-left: auto;
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

  .player_box {
    width: 100%;
    height: 300px;
  }

  .player_box {
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  // 隐藏 EasyPlayer 操作栏中的 WASM 解码模式提示/切换面板，不影响实际解码与播放。
  :deep(.easyplayer-controls-code-wrap) {
    display: none !important;
  }
</style>
