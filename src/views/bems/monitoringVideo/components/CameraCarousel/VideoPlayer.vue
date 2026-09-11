<template>
  <div class="video-player-wrap">
    <video
      ref="videoRef"
      class="video-player"
      :controls="controls"
      :muted="muted"
      :loop="loop"
      autoplay
      playsinline
    ></video>
    <div v-if="loading" class="video-loading">
      <a-spin size="small" />
    </div>
    <div v-if="error" class="video-error">
      <video-camera-outlined class="error-icon" />
      <span class="error-text">{{ errorText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
  import Hls from 'hls.js';
  import { VideoCameraOutlined } from '@ant-design/icons-vue';
  import { getToken } from '/@/utils/auth';
  import { sendCameraHeartbeat } from '../../index.api';

  const props = withDefaults(
    defineProps<{
      /** m3u8 播放地址 */
      url: string;
      /** 心跳续期 streamKey（取摄像头唯一编码 cameraIndexCode） */
      streamKey?: string;
      muted?: boolean;
      autoplay?: boolean;
      loop?: boolean;
      controls?: boolean;
      /** 首帧加载超时（毫秒），超时后提示加载失败 */
      timeout?: number;
    }>(),
    {
      streamKey: '',
      muted: true,
      autoplay: true,
      loop: false,
      controls: false,
      timeout: 60000,
    },
  );

  const videoRef = ref<HTMLVideoElement | null>(null);
  const loading = ref(true);
  const error = ref(false);
  const errorText = ref('视频加载失败');

  /** 心跳间隔（秒），与 hls-player 保持一致 */
  const HEARTBEAT_INTERVAL = 30;

  let hls: Hls | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let loadTimer: ReturnType<typeof setTimeout> | null = null;

  const clearLoadTimer = () => {
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const destroyHls = () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  };

  /** 心跳续期：播放期间按固定间隔上报 streamKey，避免服务端提前回收视频流 */
  const sendHeartbeat = async () => {
    if (!props.streamKey) return;
    try {
      await sendCameraHeartbeat({ streamKey: props.streamKey });
    } catch (err) {
      console.warn('[camera heartbeat] 心跳上报失败:', props.streamKey, err);
    }
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    if (!props.streamKey) return;
    // 立即上报一次，保证开播瞬间已续期
    void sendHeartbeat();
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL * 1000);
  };

  const showError = (text: string) => {
    clearLoadTimer();
    loading.value = false;
    error.value = true;
    errorText.value = text;
    destroyHls();
    stopHeartbeat();
  };

  const startPlay = () => {
    const video = videoRef.value;
    clearLoadTimer();
    destroyHls();
    stopHeartbeat();

    loading.value = true;
    error.value = false;

    if (!props.url) {
      showError('暂无视频流');
      return;
    }
    if (!video) return;

    // 超时保护：超过 timeout 仍未开始播放则提示失败（默认 60s）
    loadTimer = setTimeout(() => {
      if (loading.value) {
        showError('视频加载超时');
      }
    }, props.timeout);

    const token = getToken();

    // 优先使用 hls.js：通过 xhrSetup 为每个分片请求注入 X-Access-Token
    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        // 清单/分片加载超时放宽，配合重试避免弱网下过早失败
        manifestLoadingTimeOut: props.timeout,
        manifestLoadingMaxRetry: 4,
        manifestLoadingMaxRetryTimeout: props.timeout,
        levelLoadingTimeOut: props.timeout,
        levelLoadingMaxRetry: 4,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 6,
        xhrSetup: (xhr) => {
          if (token) {
            xhr.setRequestHeader('X-Access-Token', token);
          }
        },
      });

      hls.loadSource(props.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        clearLoadTimer();
        loading.value = false;
        error.value = false;
        void video.play().catch(() => {
          /* 自动播放被拦截时忽略，等待用户交互 */
        });
        startHeartbeat();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        const code = data.response?.code;
        if (code === 401 || code === 403) {
          showError('播放鉴权失败，请重新登录');
          return;
        }
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // 网络/分片异常：尝试重连
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError();
            break;
          default:
            showError('视频加载失败');
        }
      });
      return;
    }

    // 兜底：浏览器原生 HLS（如 Safari），此方式无法附加自定义请求头
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.addEventListener(
        'loadedmetadata',
        () => {
          clearLoadTimer();
          loading.value = false;
          error.value = false;
          void video.play().catch(() => {});
          startHeartbeat();
        },
        { once: true },
      );
      video.src = props.url;
      void video.play().catch(() => {});
      return;
    }

    showError('当前浏览器不支持 HLS 播放');
  };

  watch(
    () => props.url,
    () => {
      nextTick(startPlay);
    },
  );

  onMounted(() => {
    nextTick(startPlay);
  });

  onBeforeUnmount(() => {
    clearLoadTimer();
    destroyHls();
    stopHeartbeat();
    const video = videoRef.value;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  });
</script>

<style scoped lang="less">
  .video-player-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    overflow: hidden;
  }

  .video-player {
    width: 100%;
    height: 100%;
    display: block;
    border: none;
    background: #000;
    object-fit: contain;
  }

  .video-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
  }

  .video-error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    color: rgba(255, 255, 255, 0.5);

    .error-icon {
      font-size: 28px;
      margin-bottom: 6px;
    }

    .error-text {
      font-size: 13px;
    }
  }
</style>
