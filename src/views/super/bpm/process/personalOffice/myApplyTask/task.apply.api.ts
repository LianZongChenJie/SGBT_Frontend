import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/task/myApplyProcessList',
  invalidProcess = '/act/task/invalidProcess',
  backProcess = '/act/task/callBackProcess',
  taskNotification = '/act/process/extActTaskNotification/taskNotification',
  notifyList = '/act/process/extActTaskNotification/mylist',
}

/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 作废
 * @param params
 */
export const invalidProcess = (params) => defHttp.put({ url: Api.invalidProcess, params });

/**
 * 取回
 * @param params
 */
export const backProcess = (params) => defHttp.put({ url: Api.backProcess, params });

/**
 * 催办
 * @param params
 */
export const taskNotification = (params) => defHttp.post({ url: Api.taskNotification, params });

/**
 * 列表查询
 * @param params
 */
export const taskNotifyList = (params) => defHttp.get({ url: Api.notifyList, params });
