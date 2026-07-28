import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/meeting/info/list',
  Add = '/meeting/info/add',
  Edit = '/meeting/info/edit',
  Delete = '/meeting/info/delete',
  QueryById = '/meeting/info/queryById',
  Cancel = '/meeting/info/cancel',
  Approve = '/meeting/info/approve',
  CheckTimeConflict = '/meeting/info/checkTimeConflict',
  RoomOccupancy = '/meeting/info/roomOccupancy',
  Adjust = '/meeting/info/adjust',
  UploadMinutes = '/meeting/info/uploadMinutes',
}

export const getMeetingListApi = (params) => defHttp.get({ url: Api.List, params }, { joinParamsToUrl: true });

export const addMeetingApi = (params) => defHttp.post({ url: Api.Add, data: params });

export const editMeetingApi = (params) => defHttp.post({ url: Api.Edit, data: params });

export const deleteMeetingApi = (params) => defHttp.delete({ url: Api.Delete, params }, { joinParamsToUrl: true });

export const getMeetingByIdApi = (params) => defHttp.get({ url: Api.QueryById, params });

export const cancelMeetingApi = (params) => defHttp.post({ url: Api.Cancel, params }, { joinParamsToUrl: true });

export const approveMeetingApi = (params) => defHttp.post({ url: Api.Approve, params }, { joinParamsToUrl: true });

export const checkTimeConflictApi = (params) => defHttp.get({ url: Api.CheckTimeConflict, params });

export const getRoomOccupancyApi = (params) => defHttp.get({ url: Api.RoomOccupancy, params });

export const adjustMeetingApi = (params) => defHttp.post({ url: Api.Adjust, data: params });

export const uploadMinutesApi = (params) => defHttp.post({ url: Api.UploadMinutes, data: params });
