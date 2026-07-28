import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/meeting/adjustRecord/list',
  QueryById = '/meeting/adjustRecord/queryById',
  QueryByMeetingId = '/meeting/adjustRecord/queryByMeetingId',
}

export const getAdjustRecordListApi = (params) => defHttp.get({ url: Api.List, params }, { joinParamsToUrl: true });

export const getAdjustRecordByIdApi = (params) => defHttp.get({ url: Api.QueryById, params });

export const getAdjustRecordByMeetingIdApi = (params) => defHttp.get({ url: Api.QueryByMeetingId, params });
