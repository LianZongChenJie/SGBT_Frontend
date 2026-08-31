import { defHttp } from '/@/utils/http/axios';

enum Api {
  queryAppConfig = '/eoa/sysAppConfig/queryAppConfig',
  getRouteList = '/eoa/sysAppRoute/getRouteList',
  sortChange = '/eoa/sysAppRoute/sortChange',
  deleteOne = '/eoa/sysAppRoute/delete',
  saveRoute = '/eoa/sysAppRoute/add',
  editRoute = '/eoa/sysAppRoute/edit',
  queryRouteById = '/eoa/sysAppRoute/queryById',
  saveConfig = '/eoa/sysAppConfig/add',
  editConfig = '/eoa/sysAppConfig/edit',
  queryDesFormList = '/act/process/extActDesignFlowData/getDesFormFlows',
  queryOnlineList = '/joa/designform/designFormCommuse/queryOnlineFormList',
}
/**
 * 查询APP首页配置
 * @param params
 */
export const queryAppConfig = () => defHttp.get({ url: Api.queryAppConfig }, { isTransformResponse: false });
/**
 * 查询路由配置
 * @param params
 */
export const getRouteList = () => defHttp.get({ url: Api.getRouteList }, { isTransformResponse: false });
/**
 * 排序修改
 * @param params
 */
export const sortChange = (params) => {
  return defHttp.post({ url: Api.sortChange, params }, { isTransformResponse: false });
};
/**
 * 删除路由
 */
export const deleteRoute = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, params }, { isTransformResponse: false, joinParamsToUrl: true }).then((res) => {
    handleSuccess(res);
  });
};

/**
 * 保存或者更新路由信息
 * @param params
 */
export const saveOrUpdateRoute = (params, isUpdate) => {
  let url = isUpdate ? Api.editRoute : Api.saveRoute;
  return isUpdate
    ? defHttp.put({ url: url, params }, { isTransformResponse: false })
    : defHttp.post({ url: url, params }, { isTransformResponse: false });
};
/**
 * 根据id查询路由
 * @param params
 */
export const queryRouteById = (params) => defHttp.get({ url: Api.queryRouteById, params }, { isTransformResponse: false });
/**
 * 保存或者更新配置信息
 * @param params
 */
export const saveOrUpdateConfig = (params, isUpdate) => {
  let url = isUpdate ? Api.editConfig : Api.saveConfig;
  return isUpdate ? defHttp.put({ url: url, params }) : defHttp.post({ url: url, params });
};
/**
 * 查询设计器列表
 */
export const queryDesFormList = () => defHttp.get({ url: Api.queryDesFormList });
/**
 * 查询online列表
 */
export const queryOnlineList = () => defHttp.get({ url: Api.queryOnlineList });
