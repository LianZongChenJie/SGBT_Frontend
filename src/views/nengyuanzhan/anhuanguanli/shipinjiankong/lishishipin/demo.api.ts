import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/videoDevice/getUrl',
  playbackOpenHttpMp4 = '/operation/video/playback/openHttpmp4',
  playbackPauseHttpMp4 = '/operation/video/playback/pauseHttpmp4',
  playbackResumeHttpMp4 = '/operation/video/playback/resumeHttpmp4',
  playbackSeekHttpMp4 = '/operation/video/playback/seekHttpmp4',
  playbackCloseHttpMp4 = '/operation/video/playback/closeHttpmp4',
}

interface HistoryStreamItem {
  id?: string | number;
  backUrl?: string;
  deviceId?: string;
  deviceCode?: string;
  deviceName?: string;
  cameraIndexCode?: string;
  cameraName?: string;
  beginTime?: string;
  endTime?: string;
}

interface HistoryStreamResult {
  url?: string;
  /** 设备信息位于 getUrl 接口 result 顶层，list 仅返回录像片段。 */
  deviceCode?: string;
  deviceName?: string;
  beginTime?: string;
  endTime?: string;
  list?: HistoryStreamItem[];
}

interface HistoryListRecord {
  id: string | number;
  deviceId: string;
  deviceName: string;
  beginTime: string;
  endTime: string;
}

interface HistoryListCacheEntry {
  expiresAt: number;
  records: HistoryListRecord[];
}

// 历史片段的检索结果在短时间内不会变化；只缓存列表数据，不缓存 playbackId 或播放地址。
const HISTORY_LIST_CACHE_TTL = 3 * 60 * 1000;
const HISTORY_LIST_CACHE_MAX_SIZE = 30;
const historyListCache = new Map<string, HistoryListCacheEntry>();
const pendingHistoryListRequests = new Map<string, Promise<HistoryListRecord[]>>();

function getHistoryListCacheKey(params: Record<string, unknown>) {
  return [params.deviceCode, params.startTime, params.endTime].map((value) => String(value || '')).join('|');
}

function cloneHistoryList(records: HistoryListRecord[]) {
  return records.map((record) => ({ ...record }));
}

function cleanHistoryListCache() {
  const now = Date.now();
  for (const [key, entry] of historyListCache) {
    if (entry.expiresAt <= now) historyListCache.delete(key);
  }

  while (historyListCache.size > HISTORY_LIST_CACHE_MAX_SIZE) {
    const oldestKey = historyListCache.keys().next().value;
    if (!oldestKey) break;
    historyListCache.delete(oldestKey);
  }
}

/** 供后续需要“强制刷新”入口时清空所有录像列表缓存。 */
export function clearHistoryListCache() {
  historyListCache.clear();
}

async function requestHistoryList(params: Record<string, unknown>) {
  const result = (await defHttp.post({ url: Api.list, params })) as HistoryStreamResult;
  const streamList = Array.isArray(result?.list) ? result.list : [];
  const records = streamList.length
    ? streamList
    : result?.url
      ? [
          {
            backUrl: result.url,
            beginTime: result.beginTime,
            endTime: result.endTime,
          },
        ]
      : [];

  return records.map((item, index) => ({
    id: item.id || `${item.beginTime || ''}-${item.endTime || ''}-${index}`,
    // 回放时间必须保持海康接口返回的原始格式，避免二次格式化改变实际录像时间段。
    // 同一个检索结果下的所有录像片段均属于 result 顶层返回的设备。
    deviceId: result.deviceCode || '',
    deviceName: result.deviceName || '',
    beginTime: item.beginTime || '',
    endTime: item.endTime || '',
  }));
}

export async function getDemoList(params: Record<string, unknown> = {}) {
  const cacheKey = getHistoryListCacheKey(params);
  const cached = historyListCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cloneHistoryList(cached.records);
  }

  const pendingRequest = pendingHistoryListRequests.get(cacheKey);
  if (pendingRequest) {
    return cloneHistoryList(await pendingRequest);
  }

  const request = requestHistoryList(params);
  pendingHistoryListRequests.set(cacheKey, request);
  try {
    const records = await request;
    cleanHistoryListCache();
    historyListCache.set(cacheKey, {
      expiresAt: Date.now() + HISTORY_LIST_CACHE_TTL,
      records: cloneHistoryList(records),
    });
    return records;
  } finally {
    pendingHistoryListRequests.delete(cacheKey);
  }
}

export interface PlaybackOpenRequest {
  cameraIndexCode: string;
  beginTime: string;
  endTime: string;
  recordLocation?: 0 | 1;
  streamType?: 0 | 1;
}

export interface PlaybackHttpMp4Response {
  /** 本次回放会话 ID，暂停、继续、拖动和关闭均使用此值。 */
  playbackId: string;
  /** ZLM 流 ID；继续或拖动后可能变化。 */
  stream?: string;
  /** HTTP-fMP4 播放地址。 */
  httpMp4Url?: string;
  /** 回放状态：PLAYING / PAUSED / CLOSED。 */
  state?: 'PLAYING' | 'PAUSED' | 'CLOSED' | string;
  /** 本次回放开始、结束时间。 */
  beginTime?: string;
  endTime?: string;
  /** 可拖动的最大位置，单位毫秒，相对于 beginTime。 */
  durationMs?: number;
  /** 当前播放位置，单位毫秒，相对于 beginTime。 */
  positionMs?: number;
}

export interface PlaybackIdRequest {
  playbackId: string;
}

export interface PlaybackSeekRequest extends PlaybackIdRequest {
  /** 相对于本次请求 beginTime 的毫秒偏移。 */
  positionMs: number;
}

export function openHttpMp4Playback(data: PlaybackOpenRequest) {
  return defHttp.post<PlaybackHttpMp4Response>({ url: Api.playbackOpenHttpMp4, params: data });
}

export function pauseHttpMp4Playback(data: PlaybackIdRequest) {
  return defHttp.post<PlaybackHttpMp4Response>({ url: Api.playbackPauseHttpMp4, params: data });
}

export function resumeHttpMp4Playback(data: PlaybackIdRequest) {
  return defHttp.post<PlaybackHttpMp4Response>({ url: Api.playbackResumeHttpMp4, params: data });
}

export function seekHttpMp4Playback(data: PlaybackSeekRequest) {
  return defHttp.post<PlaybackHttpMp4Response>({ url: Api.playbackSeekHttpMp4, params: data });
}

export function closeHttpMp4Playback(data: PlaybackIdRequest) {
  return defHttp.post({ url: Api.playbackCloseHttpMp4, params: data });
}
