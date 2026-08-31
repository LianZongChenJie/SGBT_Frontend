import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/processInstance/list',
  suspend = '/act/processInstance/suspend',
  restart = '/act/processInstance/restart',
  close = '/act/processInstance/close',
  taskEntrust = '/act/task/taskEntrust',
  taskComplaint = '/act/task/taskComplaint',
}
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 激活
 * @param params
 */
export const restart = (params, handleSuccess) => {
  return defHttp.get({ url: Api.restart, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 挂起
 * @param params
 */
export const suspend = (params, handleSuccess) => {
  return defHttp.get({ url: Api.suspend, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 关闭
 * @param params
 */
export const closeProcess = (params, handleSuccess) => {
  return defHttp.get({ url: Api.close, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 委派
 * @param params
 */
export const taskEntrust = (params, handleSuccess) => {
  return defHttp.put({ url: Api.taskEntrust, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 转办
 * @param params
 */
export const taskComplaint = (params, handleSuccess) => {
  return defHttp.put({ url: Api.taskComplaint, params }).then(() => {
    handleSuccess();
  });
};
