import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/meeting/terminal/list',
  Add = '/meeting/terminal/add',
  Edit = '/meeting/terminal/edit',
  Delete = '/meeting/terminal/delete',
  DeleteBatch = '/meeting/terminal/deleteBatch',
  QueryById = '/meeting/terminal/queryById',
}

export const getTerminalListApi = (params) => defHttp.get({ url: Api.List, params }, { joinParamsToUrl: true });

export const addTerminalApi = (params) => defHttp.post({ url: Api.Add, params });

export const editTerminalApi = (params) => defHttp.post({ url: Api.Edit, params });

export const deleteTerminalApi = (params) => defHttp.delete({ url: Api.Delete, params });

export const deleteBatchTerminalApi = (params) => defHttp.delete({ url: Api.DeleteBatch, params });

export const getTerminalByIdApi = (params) => defHttp.get({ url: Api.QueryById, params });
