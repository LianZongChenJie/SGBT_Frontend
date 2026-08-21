import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/videoDevice/getUrl',
  playbackOpen = '/operation/video/playback/open',
  playbackClose = '/operation/video/playback/close',
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

export interface PlaybackOpenResponse {
  playbackId: string;
  stream?: string;
  wsFlvUrl?: string;
  httpFlvUrl?: string;
}

export function openHistoryPlayback(data: PlaybackOpenRequest) {
  return defHttp.post<PlaybackOpenResponse>({ url: Api.playbackOpen, params: data });
}

export function closeHistoryPlayback(playbackId: string) {
  return defHttp.post({ url: Api.playbackClose, params: { playbackId } });
}
