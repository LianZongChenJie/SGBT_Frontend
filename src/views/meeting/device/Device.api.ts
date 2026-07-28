import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/meeting/device/list',
  Add = '/meeting/device/add',
  Edit = '/meeting/device/edit',
  Delete = '/meeting/device/delete',
  DeleteBatch = '/meeting/device/deleteBatch',
  QueryById = '/meeting/device/queryById',
}

export const getDeviceListApi = (params) => defHttp.get({ url: Api.List, params }, { joinParamsToUrl: true });

export const addDeviceApi = (params) => defHttp.post({ url: Api.Add, params });

export const editDeviceApi = (params) => defHttp.post({ url: Api.Edit, params });

export const deleteDeviceApi = (params) => defHttp.delete({ url: Api.Delete, params });

export const deleteBatchDeviceApi = (params) => defHttp.delete({ url: Api.DeleteBatch, params });

export const getDeviceByIdApi = (params) => defHttp.get({ url: Api.QueryById, params });
