import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/videoDevice/getUrl',
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

function formatHistoryTime(value?: string) {
  return String(value || '')
    .replace('T', ' ')
    .replace(/\.\d+(?:Z|[+-]\d{2}:\d{2})?$/, '');
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
    beginTime: formatHistoryTime(item.beginTime),
    endTime: formatHistoryTime(item.endTime),
    url: item.backUrl || '',
    sizeMb: formatFileSizeMb(item.size),
  }));
}
