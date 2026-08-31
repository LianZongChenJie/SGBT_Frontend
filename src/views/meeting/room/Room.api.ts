import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/meeting/room/list',
  Add = '/meeting/room/add',
  Edit = '/meeting/room/edit',
  Delete = '/meeting/room/delete',
  DeleteBatch = '/meeting/room/deleteBatch',
  QueryById = '/meeting/room/queryById',
  Lock = '/meeting/room/lock',
  BindDevice = '/meeting/room/bindDevice',
  BindTerminal = '/meeting/room/bindTerminal',
}

enum AccessControlApi {
  ListByRoom = '/meeting/accessControl/listByRoom',
  SaveBatch = '/meeting/accessControl/saveBatch',
  UpdatePassword = '/meeting/accessControl/updatePassword',
}

export const getRoomListApi = (params) => defHttp.get({ url: Api.List, params }, { joinParamsToUrl: true });

export const addRoomApi = (params) => {
  const { approverIds, ...data } = params;
  if (!data.status) {
    data.status = '1';
  }
  const queryParams = {};
  if (approverIds && approverIds.length > 0) {
    queryParams.approverIds = Array.isArray(approverIds) ? approverIds.join(',') : approverIds;
  }
  return defHttp.post({ 
    url: Api.Add, 
    params: queryParams,
    data 
  });
};

export const editRoomApi = (params) => {
  const { approverIds, ...data } = params;
  const queryParams = {};
  if (approverIds && approverIds.length > 0) {
    queryParams.approverIds = Array.isArray(approverIds) ? approverIds.join(',') : approverIds;
  }
  return defHttp.post({ 
    url: Api.Edit, 
    params: queryParams,
    data 
  });
};

export const deleteRoomApi = (params) => defHttp.delete({ url: Api.Delete, params }, { joinParamsToUrl: true });

export const deleteBatchRoomApi = (params) => defHttp.delete({ url: Api.DeleteBatch, params });

export const getRoomByIdApi = (params) => defHttp.get({ url: Api.QueryById, params });

export const lockRoomApi = (params) => defHttp.post({ url: Api.Lock, params }, { joinParamsToUrl: true });

export const bindDeviceApi = (params) => {
  const { roomId, deviceIds } = params;
  return defHttp.post({
    url: Api.BindDevice,
    params: { roomId },
    data: deviceIds || [],
  });
};

export const bindTerminalApi = (params) => defHttp.post({ url: Api.BindTerminal, params }, { joinParamsToUrl: true });

export const getAccessControlListByRoomApi = (roomId) => defHttp.get({ url: AccessControlApi.ListByRoom, params: { roomId } });

export const saveAccessControlListApi = (roomId, list) => defHttp.post({
  url: AccessControlApi.SaveBatch,
  params: { roomId },
  data: list || [],
});

export const updateAccessPasswordApi = (roomId, password) => defHttp.post({
  url: AccessControlApi.UpdatePassword,
  params: { roomId, password },
}, { joinParamsToUrl: true });
