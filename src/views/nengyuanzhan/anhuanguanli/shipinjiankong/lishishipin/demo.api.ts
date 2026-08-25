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
  beginTime?: string;
  endTime?: string;
  size?: number;
}

interface HistoryStreamResult {
  url?: string;
  beginTime?: string;
  endTime?: string;
  list?: HistoryStreamItem[];
}

function formatFileSizeMb(value?: number) {
  const size = Number(value);
  if (!Number.isFinite(size) || size < 0) {
    return '';
  }

  return (size / 1024 / 1024).toFixed(2);
}

export async function getDemoList(params) {
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
    beginTime: item.beginTime || '',
    endTime: item.endTime || '',
    sizeMb: formatFileSizeMb(item.size),
  }));
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
