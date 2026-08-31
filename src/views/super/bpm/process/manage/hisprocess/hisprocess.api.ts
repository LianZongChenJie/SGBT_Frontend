import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/task/historyProcessList',
  invalidProcess = '/act/task/invalidProcess',
  callBackProcess = '/act/task/callBackProcess',
}
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 作废流程
 * @param params
 */
export const invalidProcess = (params, handleSuccess) => {
  return defHttp.put({ url: Api.invalidProcess, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 取回流程
 * @param params
 */
export const callBackProcess = (params, handleSuccess) => {
  return defHttp.put({ url: Api.callBackProcess, params }).then(() => {
    handleSuccess();
  });
};
