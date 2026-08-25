import { shallowRef } from 'vue';

type EasyPlayerMethod = 'play' | 'playback';
type EasyPlayerErrorHandler = (error: unknown) => void;

interface EasyPlayerOptions {
  isLive?: boolean;
  bufferTime?: number;
  stretch?: boolean;
  MSE?: boolean;
  WCS?: boolean;
  hasAudio?: boolean;
  hasControl?: boolean;
  hiddenRightMenu?: boolean;
  playbackConfig?: {
    /** simple 模式使用相对时长进度条，适合固定 MP4 点播文件。 */
    controlType?: 'normal' | 'simple';
    /** 固定录像文件的时长，单位：秒。 */
    duration?: number;
    /** 当前回放起点，单位：秒。 */
    startTime?: number;
  };
  watermark?: {
    text: {
      content: string;
    };
    right: number;
    top: number;
  };
}

interface EasyPlayerInstance {
  play: (url: string) => Promise<unknown>;
  playback: (url: string) => Promise<unknown>;
  pause: () => void;
  screenshot?: (filename?: string, type?: string, quality?: number | string, mode?: string) => unknown;
  setMute: (value: boolean) => void;
  setFullscreen: (value: boolean) => void;
  setRate?: (rate: number) => unknown;
  /** 覆盖默认本地定位逻辑时使用。 */
  seekTime?: (position: number) => void;
  /** EasyPlayer 回放的本地暂停状态。 */
  playbackPause?: boolean;
  destroy: () => void;
  on: (event: string, handler: (payload: any) => void) => void;
  emit?: (event: string, payload: unknown) => void;
}

interface EasyPlayerEvents {
  /** EasyPlayer 底层视频 WebSocket 已建立连接 */
  websocketOpen?: () => void;
  websocketError?: (error: unknown) => void;
  websocketClose?: (event: unknown) => void;
  fullscreen?: (flag: boolean) => void;
  playbackRate?: (rate: number, player: EasyPlayerInstance) => void;
  playbackSeek?: (data: unknown) => void;
  /** EasyPlayer 内部时间戳，仅用于观测，不代表后端 HTTP-fMP4 会话位置。 */
  timestamps?: (timestamp: unknown) => void;
  /** 播放器底部原生播放/暂停按钮触发的状态变更。 */
  playbackPause?: (paused: boolean) => void;
}

declare const EasyPlayerPro: new (container: HTMLElement, options: EasyPlayerOptions) => EasyPlayerInstance;

const DEFAULT_OPTIONS: EasyPlayerOptions = {
  bufferTime: 0.2,
  stretch: false,
  watermark: { text: { content: 'easyplayer-pro' }, right: 10, top: 10 },
};

function waitForCleanup() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });
}

function bindEvents(player: EasyPlayerInstance, events: EasyPlayerEvents = {}) {
  if (events.websocketOpen) {
    player.on('websocketOpen', () => {
      events.websocketOpen?.();
    });
  }

  if (events.websocketError) {
    player.on('websocketError', (error) => {
      events.websocketError?.(error);
    });
  }

  if (events.websocketClose) {
    player.on('websocketClose', (event) => {
      events.websocketClose?.(event);
    });
  }

  player.on('fullscreen', (flag) => {
    events.fullscreen?.(flag);
  });

  if (events.playbackRate) {
    player.on('playbackRate', (rate) => {
      events.playbackRate?.(rate, player);
    });
  }

  if (events.playbackSeek) {
    player.on('playbackSeek', (data) => {
      events.playbackSeek?.(data);
    });
  }

  if (events.timestamps) {
    player.on('timestamps', (timestamp) => {
      events.timestamps?.(timestamp);
    });
  }

  if (events.playbackPause) {
    player.on('playbackPause', (paused) => {
      events.playbackPause?.(Boolean(paused));
    });
  }
}

function createEasyPlayer(containerId: string, options: Partial<EasyPlayerOptions> = {}, events: EasyPlayerEvents = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    return null;
  }

  const player = new EasyPlayerPro(container, {
    ...DEFAULT_OPTIONS,
    ...options,
  });
  bindEvents(player, events);
  return player;
}

async function invokePlayer(
  player: EasyPlayerInstance | null,
  method: EasyPlayerMethod,
  url: string,
  onError: EasyPlayerErrorHandler = console.error
) {
  if (!player) {
    console.warn('[EasyPlayer] 播放器未创建，无法播放', {
      method,
      url,
    });
    return;
  }

  if (!url) {
    console.warn('[EasyPlayer] 播放地址为空，无法播放', {
      method,
      url,
    });
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(
      (currentUrl: string) => {
        console.log(`[EasyPlayer] 即将调用 player.${method}，当前播放地址: ${currentUrl}`);
        player[method](currentUrl)
          .then((result) => {
            console.log(`[EasyPlayer] player.${method} 调用成功，当前播放地址: ${currentUrl}`, result);
          })
          .catch((error) => {
            console.error(`[EasyPlayer] player.${method} 调用失败，当前播放地址: ${currentUrl}`, error);
            onError(error);
          })
          .finally(() => resolve());
      },
      0,
      url
    );
  });
}

export function useEasyPlayer(events: EasyPlayerEvents = {}) {
  const player = shallowRef<EasyPlayerInstance | null>(null);

  async function create(containerId: string, options: Partial<EasyPlayerOptions> = {}) {
    await destroy();
    player.value = createEasyPlayer(containerId, options, events);
    return player.value;
  }

  async function destroy() {
    if (!player.value) {
      return;
    }

    player.value.destroy();
    player.value = null;
    await waitForCleanup();
  }

  function getPlayer() {
    return player.value;
  }

  async function play(url: string, method: EasyPlayerMethod = 'play', onError?: EasyPlayerErrorHandler) {
    console.log(`[EasyPlayer] play 方法收到播放地址: ${url}`, { method });
    await invokePlayer(player.value, method, url, onError);
  }

  function pause() {
    player.value?.pause();
  }

  function setMute(value = true) {
    player.value?.setMute(value);
  }

  function setFullscreen(value = true) {
    player.value?.setFullscreen(value);
  }

  return {
    player,
    create,
    destroy,
    getPlayer,
    play,
    pause,
    setMute,
    setFullscreen,
  };
}

export function useEasyPlayerList(getEvents: (index: number) => EasyPlayerEvents = () => ({})) {
  const players = shallowRef<Array<EasyPlayerInstance | null>>([]);

  function getPlayer(index: number) {
    return players.value[index] ?? null;
  }

  async function create(index: number, containerId: string, options: Partial<EasyPlayerOptions> = {}) {
    await destroy(index);
    const nextPlayers = [...players.value];
    nextPlayers[index] = createEasyPlayer(containerId, options, getEvents(index));
    players.value = nextPlayers;
    return nextPlayers[index];
  }

  async function destroy(index?: number) {
    if (typeof index === 'number') {
      const currentPlayer = getPlayer(index);
      if (!currentPlayer) {
        return;
      }
      currentPlayer.destroy();
      const nextPlayers = [...players.value];
      nextPlayers[index] = null;
      players.value = nextPlayers;
      await waitForCleanup();
      return;
    }

    let hasDestroyed = false;
    const nextPlayers = [...players.value];
    for (let currentIndex = 0; currentIndex < nextPlayers.length; currentIndex++) {
      if (nextPlayers[currentIndex]) {
        nextPlayers[currentIndex]?.destroy();
        nextPlayers[currentIndex] = null;
        hasDestroyed = true;
      }
    }
    players.value = nextPlayers;

    if (hasDestroyed) {
      await waitForCleanup();
    }
  }

  async function play(index: number, url: string, method: EasyPlayerMethod = 'play', onError?: EasyPlayerErrorHandler) {
    console.log(`[EasyPlayerList] play 方法收到播放地址: ${url}`, {
      slot: index + 1,
      method,
    });
    await invokePlayer(getPlayer(index), method, url, onError);
  }

  function pause(index: number) {
    getPlayer(index)?.pause();
  }

  function setMute(index: number, value = true) {
    getPlayer(index)?.setMute(value);
  }

  function setFullscreen(index: number, value = true) {
    getPlayer(index)?.setFullscreen(value);
  }

  return {
    players,
    create,
    destroy,
    getPlayer,
    play,
    pause,
    setMute,
    setFullscreen,
  };
}
