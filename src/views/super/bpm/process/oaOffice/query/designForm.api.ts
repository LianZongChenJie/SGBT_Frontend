import { defHttp } from '/@/utils/http/axios';
enum Api {
  list = '/desform/data/list',
  queryById = '/desform/queryById',
  getColumns = '/desform/getColumns',
  queryByCode = '/desform/queryByCode',
  delete = '/desform/data/delete',
  deleteBatch = '/desform/data/deleteBatch',
  exportXls = '/desform/data/exportXls/',
  importXls = '/desform/data/importXls/',
  // 对接流程地址
  startProcess = '/act/process/extActProcess/startDesFormMutilProcess',
}

/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params }, { isTransformResponse: false });
/**
 * 直接请求
 * @param url
 */
export const getAction = (url) => defHttp.get({ url: url }, { isTransformResponse: false });
/**
 * 获取列信息
 * @param params
 */
export const getColumns = (params) => defHttp.get({ url: Api.getColumns, params }, { isTransformResponse: false });

const getTransitURL = (url) => `/sys/common/transitRESTful?url=${encodeURIComponent(url)}`;
// 中转HTTP请求
export const transitRESTful = {
  get: (url, params?) => defHttp.get({ url: getTransitURL(url), params }, { isTransformResponse: false }),
  post: (url, params?) => defHttp.post({ url: getTransitURL(url), params }, { isTransformResponse: false }),
  put: (url, params?) => defHttp.put({ url: getTransitURL(url), params }, { isTransformResponse: false }),
};
/**
 * 提交流程
 * @param params
 */
export const startProcess = (params) => {
  return defHttp.post({ url: Api.startProcess, params }, { isTransformResponse: false });
};

/**
 * 删除
 * @param params
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { isTransformResponse: false, joinParamsToUrl: true }).then((res) => {
    handleSuccess(res);
  });
};
/**
 * 批量删除
 * @param params
 */
export const deleteBatch = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteBatch, data: params }, { isTransformResponse: false, joinParamsToUrl: true }).then((res) => {
    handleSuccess(res);
  });
};
