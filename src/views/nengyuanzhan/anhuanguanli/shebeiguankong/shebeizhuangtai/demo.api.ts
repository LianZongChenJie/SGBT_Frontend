
import {defHttp} from '/@/utils/http/axios';

enum Api {
  list = '/operation/operationDimDeviceType/list',
  queryDepartTreeSync = '/operation/operationDimDeviceType/queryTreeSync',
  searchBy = '/operation/operationDimDeviceType/searchBy',
}
/**
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params) => {
  return defHttp.get({url: Api.list, params});
};

export const searchByKeywords = (params) => defHttp.get({ url: Api.searchBy, params });

export const queryDepartTreeSync = (params?) => defHttp.get({url: Api.queryDepartTreeSync, params});
