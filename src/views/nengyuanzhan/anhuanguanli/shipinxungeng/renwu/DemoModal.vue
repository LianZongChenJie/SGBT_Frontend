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
        <div v-if="showCheckIn" class="checkin-overlay">
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
          <div v-if="patrolRunning" class="radio-item" @click="onClickStop">暂停</div>
          <div v-else class="radio-item" @click="onClickStart">播放</div>
          <div class="radio-item" @click="setFullscreen">全屏</div>
          <div class="radio-item" @click="onScreenshot">抓拍</div>
        </div>

        <div class="business-actions">
          <a-button danger type="primary" @click="clickOpenAlarm">告警上报</a-button>
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
  import { getStartTask, saveCheckIn } from './demo.api';
  import DemoModalAlarm from './DemoModalAlarm.vue';

  const [registerModalAlarm, { openModal: openModalAlarm }] = useModal();

  interface PatrolDevice {
    deviceCode?: string | number;
    deviceName?: string;
    streamUrl?: string;
    needCheck?: boolean;
  }

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const indexStatus = ref(false);
  const props = defineProps({
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
  let timer: ReturnType<typeof setInterval> | null = null;
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
    stopAutoPlay();
    currentIndex.value = 0;
    indexStatus.value = false;
    taskArr.value = [];
    deviceCode.value = '';
    currentDevice.value = null;
    hasPatrolCompleted.value = false;
    checkedDeviceCodes.value = new Set();
    videoUrl.value = '';
    setModalProps({ confirmLoading: false, showOkBtn: false, showCancelBtn: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      taskId.value = data.record.id;
      const getObj = await getStartTask({ taskId: taskId.value });

      taskArr.value = Array.isArray(getObj?.deviceList) ? getObj.deviceList : [];
      playDuration.value = Math.max(1, Number(getObj?.playDuration || 1));
      await nextTick();
      await createLivePlayer();

      if (taskArr.value.length === 0) {
        message.warning('当前任务暂无巡更设备');
        return;
      }

      startAutoPlay();
    }
  });

  function renderCurrentDevice() {
    const nextDevice = taskArr.value[currentIndex.value];
    if (!nextDevice) {
      return;
    }

    currentDevice.value = nextDevice;
    deviceCode.value = nextDevice.deviceCode || '';
    videoUrl.value = normalizeVideoStreamUrl(nextDevice.streamUrl);
    indexStatus.value = checkedDeviceCodes.value.has(String(nextDevice.deviceCode || ''));
    void playCurrentVideo();
  }

  function startAutoPlay() {
    if (timer || taskArr.value.length === 0) {
      return;
    }

    if (hasPatrolCompleted.value) {
      currentIndex.value = 0;
      hasPatrolCompleted.value = false;
    }

    patrolRunning.value = true;
    renderCurrentDevice();

    timer = setInterval(
      () => {
        const nextIndex = currentIndex.value + 1;

        if (nextIndex >= taskArr.value.length) {
          currentIndex.value = taskArr.value.length - 1;
          stopAutoPlay(true);
          return;
        }

        currentIndex.value = nextIndex;
        renderCurrentDevice();
      },
      playDuration.value * 1000 + 10000
    );
  }

  function stopAutoPlay(completed = false) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    patrolRunning.value = false;
    hasPatrolCompleted.value = completed;
  }

  function onClickStart() {
    startAutoPlay();
  }
  function onClickStop() {
    stopAutoPlay();
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

  function onScreenshot() {
    const player = getPlayer();
    if (!player?.screenshot) {
      message.warning('播放器未初始化');
      return;
    }

    const result = player.screenshot(buildScreenshotFilename(), 'png', 0.92, 'download');
    if (result === null) {
      message.warning('抓拍失败，请稍后重试');
      return;
    }

    message.success('抓拍已开始下载');
  }

  function clickOpenAlarm() {
    onClickStop();

    if (!currentDevice.value?.deviceCode) {
      message.warning('当前无可上报的设备');
      return;
    }

    openModalAlarm(true, {
      taskId: taskId.value,
      cameraCode: currentDevice.value.deviceCode,
      deviceName: currentDevice.value.deviceName,
      isUpdate: true,
    });
  }

  function success() {}

  function onClickCheckIn() {
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
    stopAutoPlay();
    currentIndex.value = 0;
    taskArr.value = [];
    deviceCode.value = '';
    currentDevice.value = null;
    hasPatrolCompleted.value = false;
    checkedDeviceCodes.value = new Set();
    videoUrl.value = '';
    await destroyPlayer();
  }

  onBeforeUnmount(() => {
    stopAutoPlay();
    void destroyPlayer();
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
    transform: translateX(-50%);
  }

  .checkin-button {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
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
</style>
