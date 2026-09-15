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
      <span class="video-loading-text">{{ slowLoading ? '正在建立视频流，请稍候…' : '加载中…' }}</span>
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
  import { useMessage } from '/@/hooks/web/useMessage';
  import { sendCameraHeartbeat } from '../../index.api';

  const { createMessage } = useMessage();

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

  /**
   * 单次清单请求超时（毫秒）。
   * 首帧慢的根因是：localPlayUrl 返回后服务端往往还在建流，网关会把第一个 m3u8 请求挂住。
   * 因此这里缩短单次请求超时并配合快速重试（总窗口仍为 props.timeout），
   * 让「等流就绪」表现为几次快速重试，而不是一次干等 60s。
   */
  const MANIFEST_LOADING_TIMEOUT = 8000;
  /** 超过该时长仍未出画面时，提示文案切换为「正在建立视频流」 */
  const SLOW_LOADING_AFTER = 5000;

  const slowLoading = ref(false);

  let hls: Hls | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let loadTimer: ReturnType<typeof setTimeout> | null = null;
  let slowTimer: ReturnType<typeof setTimeout> | null = null;

  const clearLoadTimer = () => {
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
    if (slowTimer) {
      clearTimeout(slowTimer);
      slowTimer = null;
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

  /** 心跳失败提示的 key：同一条提示复用同 key，避免多路并发 / 多次重试时提示刷屏 */
  const HEARTBEAT_ERROR_KEY = 'camera-heartbeat-error';

  /** 心跳续期：播放期间按固定间隔上报 streamKey，避免服务端提前回收视频流 */
  const sendHeartbeat = async () => {
    if (!props.streamKey) return;
    try {
      // 成功不提示：接口返回的 message（如 'ok'）已通过 successMessageMode: 'none' 屏蔽
      await sendCameraHeartbeat({ streamKey: props.streamKey });
    } catch (err) {
      console.warn('[camera heartbeat] 心跳上报失败:', props.streamKey, err);
      // 心跳失败意味着服务端可能回收该路视频流，需要让用户感知
      createMessage.error({
        content: `视频流心跳续期失败：${(err as Error)?.message || '请检查网络或服务状态'}`,
        key: HEARTBEAT_ERROR_KEY,
      });
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
    slowLoading.value = false;
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
    slowLoading.value = false;

    if (!props.url) {
      showError('暂无视频流');
      return;
    }
    if (!video) return;

    // 建流期间给出更明确的提示，避免用户以为卡死
    slowTimer = setTimeout(() => {
      if (loading.value) {
        slowLoading.value = true;
      }
    }, SLOW_LOADING_AFTER);

    // 兜底超时：比 hls 自身的重试窗口略长，优先让 hls 的重试/错误处理生效
    loadTimer = setTimeout(() => {
      if (loading.value) {
        showError('视频加载超时');
      }
    }, props.timeout + 10000);

    const token = getToken();

    // 优先使用 hls.js：通过 xhrSetup 为每个分片请求注入 X-Access-Token
    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        // 清单：单次请求快速超时 + 快速重试，总窗口仍为 props.timeout。
        // 首次请求常被网关挂住（服务端建流中），10s 内重试到流就绪即可出画面，
        // 避免原先「一次请求干等 60s，等到超时还同时把 hls 销毁」的问题。
        manifestLoadingTimeOut: MANIFEST_LOADING_TIMEOUT,
        manifestLoadingMaxRetry: 10,
        manifestLoadingRetryDelay: 500,
        manifestLoadingMaxRetryTimeout: props.timeout,
        levelLoadingTimeOut: MANIFEST_LOADING_TIMEOUT,
        levelLoadingMaxRetry: 10,
        levelLoadingRetryDelay: 500,
        levelLoadingMaxRetryTimeout: props.timeout,
        // 分片加载超时仍放宽，配合重试避免弱网下过早失败
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
        // 排查用：某一路没播起来时，看这条日志的 response（状态码）即可定位原因
        console.warn(
          '[camera hls] 播放致命错误:',
          props.streamKey || props.url,
          data.type,
          data.details,
          code,
          data.response,
        );
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);

    .video-loading-text {
      margin-top: 8px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
    }
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
