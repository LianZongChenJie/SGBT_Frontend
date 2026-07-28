import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/anomalyRecord/list',
  get = '/operation/anomalyRecord/queryById',
  getStats = '/operation/anomalyRecord/getStats',
  handle = '/operation/anomalyRecord/handle',
  eliminate = '/operation/anomalyRecord/eliminate',
  exportXls = '/operation/anomalyRecord/exportXls',
}

export interface AlarmRecordQuery {
  anomalyNo?: string;
  beginTime?: string;
  endTime?: string;
  eventName?: string;
  level?: string;
  status?: string;
}

export interface AlarmRecordHandlePayload {
  createWorkOrder?: boolean;
  handleOpinion: string;
  id: string;
}

export interface AlarmRecordEliminatePayload {
  handleOpinion: string;
  id: string;
}

export const getDemoList = (params?: AlarmRecordQuery & Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const getExportUrl = Api.exportXls;

export const getNumStats = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.getStats, params });
};

export const sbHandle = (params: AlarmRecordHandlePayload) => {
  return defHttp.post({ url: Api.handle, params });
};

export const sbEliminate = (params: AlarmRecordEliminatePayload) => {
  return defHttp.post({ url: Api.eliminate, params });
};

export const getDemoById = (params: { id: string | number }) => {
  return defHttp.get({ url: Api.get, params });
};
