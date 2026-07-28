import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/meeting/service/list',
  Add = '/meeting/service/add',
  Edit = '/meeting/service/edit',
  Delete = '/meeting/service/delete',
  DeleteBatch = '/meeting/service/deleteBatch',
  QueryById = '/meeting/service/queryById',
}

export const getServiceListApi = (params) => defHttp.get({ url: Api.List, params }, { joinParamsToUrl: true });

export const addServiceApi = (params) => defHttp.post({ url: Api.Add, params });

export const editServiceApi = (params) => defHttp.post({ url: Api.Edit, params });

export const deleteServiceApi = (params) => defHttp.delete({ url: Api.Delete, params });

export const deleteBatchServiceApi = (params) => defHttp.delete({ url: Api.DeleteBatch, params });

export const getServiceByIdApi = (params) => defHttp.get({ url: Api.QueryById, params });
