import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/meeting/info/list',
  QueryById = '/meeting/info/queryById',
  Cancel = '/meeting/info/cancel',
  Approve = '/meeting/info/approve',
  Adjust = '/meeting/info/adjust',
  DateList = '/meeting/dateRelation/list',
  AdjustDate = '/meeting/dateRelation/adjust',
  CancelDate = '/meeting/dateRelation/cancel',
  SaveMinutes = '/meeting/dateRelation/saveMinutes',
}

export const getMeetingListApi = (params) => defHttp.get({ url: Api.List, params }, { joinParamsToUrl: true });

export const getMeetingByIdApi = (params) => defHttp.get({ url: Api.QueryById, params });

export const cancelMeetingApi = (params) => defHttp.post({ url: Api.Cancel, params }, { joinParamsToUrl: true });

export const approveMeetingApi = (params) => defHttp.post({ url: Api.Approve, params }, { joinParamsToUrl: true });

export const adjustMeetingApi = (params) => defHttp.post({ url: Api.Adjust, data: params });

export const getMeetingDateListApi = (params) => defHttp.get({ url: Api.DateList, params }, { joinParamsToUrl: true });

export const adjustDateRecordApi = (params) => defHttp.post({ url: Api.AdjustDate, params }, { joinParamsToUrl: true });

export const cancelDateRecordApi = (params) => defHttp.post({ url: Api.CancelDate, params }, { joinParamsToUrl: true });

export const saveMinutesApi = (params) => defHttp.post({ url: Api.SaveMinutes, data: params });
